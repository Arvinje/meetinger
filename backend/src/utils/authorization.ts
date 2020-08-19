import axios from 'axios';
import { decode, verify } from 'jsonwebtoken';
import jwkToPem from 'jwk-to-pem';
import { ValidationError, AxiosError } from '@src/utils/errors';

const iss = process.env.ISS;

type JWKPems = { [key: string]: string };
export const cognitoPublicKeys: JWKPems = {};

type JWK = {
  alg: string;
  kty: 'RSA';
  use: string;
  n: string;
  e: string;
  kid: string;
  x5t: string;
  x5c: string[];
};

type JWTPayload = {
  sub: string;
  username: string;
  iat: number;
  exp: number;
};

// Fetches JsonWebKeys of the `iss`
export async function fetchJWKs(): Promise<void> {
  const jwksUrl = `${iss}/.well-known/jwks.json`;
  const jwks = await axios.get(jwksUrl).catch((err) => {
    throw new AxiosError(err, 'cannot access JWKs at "%s"', jwksUrl);
  });

  jwks.data.keys.forEach((k: JWK) => {
    const jwkArray: jwkToPem.JWK = {
      kty: k.kty,
      n: k.n,
      e: k.e,
    };
    cognitoPublicKeys[k.kid] = jwkToPem(jwkArray);
  });
}

// validateToken validates a token against a list of public keys
export function validateToken(token: string, pems: JWKPems): JWTPayload {
  // Fail if the token is not jwt
  const decodedJwt = decode(token, { complete: true }) as {
    header: { kid: string };
    // eslint-disable-next-line camelcase
    payload: { iss: string; token_use: string };
  };

  if (!decodedJwt) {
    throw new ValidationError('invalid JWT token');
  }

  // Fail if token is not from your UserPool
  if (decodedJwt.payload.iss !== iss) {
    throw new ValidationError('invalid issuer');
  }

  // Reject the jwt if it's not an 'Access Token'
  if (decodedJwt.payload.token_use !== 'access') {
    throw new ValidationError('not an access token');
  }

  // Get the kid from the token and retrieve corresponding PEM
  const { kid } = decodedJwt.header;

  const pem = pems[kid];
  if (!pem) {
    throw new ValidationError('invalid access token');
  }

  try {
    // Verify the signature of the JWT token to ensure it's really coming from your User Pool
    return verify(token, pem, { issuer: iss }) as JWTPayload;
  } catch (error) {
    throw new ValidationError(error, 'invalid signature');
  }
}
