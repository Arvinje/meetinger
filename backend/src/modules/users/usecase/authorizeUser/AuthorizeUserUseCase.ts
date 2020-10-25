import axios from 'axios';
import jwkToPem from 'jwk-to-pem';
import { AuthResponse } from 'aws-lambda';
import { decode, verify } from 'jsonwebtoken';
import { Ok, Err, Result } from '@hqoss/monads';
import ApiGatewayAuthPolicy, { HttpVerb } from 'api-gateway-auth-policy';
import { UnexpectedError, ValidationError } from '@src/shared/core/AppError';
import { UseCase } from '@src/shared/core/useCase';
import { AuthorizeUserRequest } from './AuthorizeUserRequest';

type Response = Result<AuthResponse, ValidationError | UnexpectedError>;

type JWKPems = { [key: string]: string };

type JWTPayload = {
  sub: string;
  username: string;
  iat: number;
  exp: number;
};

export class AuthorizeUserUseCase implements UseCase<AuthorizeUserRequest, Promise<Response>> {
  private cognitoPublicKeys: JWKPems;

  private iss: string;

  constructor(iss: string) {
    this.iss = iss;
    this.cognitoPublicKeys = {};
  }

  async execute(request: AuthorizeUserRequest): Promise<Response> {
    // Fetches JWKs if they're not available
    if (Object.keys(this.cognitoPublicKeys).length === 0) {
      try {
        await this.fetchJWKs();
      } catch (error) {
        return Err<never, UnexpectedError>(error as UnexpectedError);
      }
    }

    let decoded: JWTPayload;
    try {
      decoded = this.validateToken(request.authorizationToken);
    } catch (error) {
      return Err<never, ValidationError>(error);
    }

    if (request.apiType === 'WebSocket') {
      return Ok<AuthResponse>({
        principalId: decoded.sub,
        policyDocument: {
          Version: '2012-10-17',
          Statement: [
            {
              Action: 'execute-api:Invoke',
              Effect: 'Allow',
              Resource: request.methodArn,
            },
          ],
        },
        context: {
          username: decoded.username,
        },
      });
    }

    const policy = new ApiGatewayAuthPolicy('*')
      .allowMethod(HttpVerb.ALL, '*')
      .addValueToContext('username', decoded.username)
      .render(decoded.sub);

    return Ok<AuthResponse>(policy);
  }

  private async fetchJWKs(): Promise<void> {
    const jwksUrl = `${this.iss}/.well-known/jwks.json`;
    const jwks = await axios.get(jwksUrl).catch((err) => {
      throw UnexpectedError.wrap(err, `cannot access JWKs at "${jwksUrl}"`);
    });

    jwks.data.keys.forEach((k: jwkToPem.RSA & { kid: string }) => {
      const jwkArray: jwkToPem.RSA = {
        kty: k.kty,
        n: k.n,
        e: k.e,
      };
      this.cognitoPublicKeys[k.kid] = jwkToPem(jwkArray);
    });
  }

  private validateToken(token: string): JWTPayload {
    // Fail if the token is not jwt
    const decodedJwt = decode(token, { complete: true }) as {
      header: { kid: string };
      // eslint-disable-next-line camelcase
      payload: { iss: string; token_use: string };
    };

    if (!decodedJwt) {
      throw ValidationError.create('invalid JWT token');
    }

    // Fail if token is not from your UserPool
    if (decodedJwt.payload.iss !== this.iss) {
      throw ValidationError.create('invalid issuer');
    }

    // Reject the jwt if it's not an 'Access Token'
    if (decodedJwt.payload.token_use !== 'access') {
      throw ValidationError.create('not an access token');
    }

    // Get the kid from the token and retrieve corresponding PEM
    const { kid } = decodedJwt.header;

    const pem = this.cognitoPublicKeys[kid];
    if (!pem) {
      throw ValidationError.create('invalid access token');
    }

    try {
      // Verify the signature of the JWT token to ensure it's really coming from your User Pool
      return verify(token, pem, { issuer: this.iss }) as JWTPayload;
    } catch (error) {
      throw ValidationError.wrap(error, 'invalid signature');
    }
  }
}
