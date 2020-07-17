import 'source-map-support/register';
import { AuthResponse, CustomAuthorizerEvent } from 'aws-lambda';
import { AuthError } from '@src/utils/errors';
import { fetchJWKs, cognitoPublicKeys, validateToken } from '@src/utils/authorization';

// Authorizer function for Websocket connections
export async function handle(event: CustomAuthorizerEvent): Promise<AuthResponse> {
  try {
    if (!event.queryStringParameters.Auth) {
      throw new Error('authorization token not found');
    }

    // Fetches JWKs if they're not available
    if (Object.keys(cognitoPublicKeys).length === 0) {
      await fetchJWKs();
    }

    const decoded = validateToken(event.queryStringParameters.Auth, cognitoPublicKeys);
    return {
      principalId: decoded.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: event.methodArn,
          },
        ],
      },
      context: {
        username: decoded.username,
      },
    };
  } catch (error) {
    throw new AuthError(error, 'Unauthorized');
  }
}
