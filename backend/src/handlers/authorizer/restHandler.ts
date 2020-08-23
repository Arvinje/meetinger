import 'source-map-support/register';
import { AuthResponse, CustomAuthorizerEvent } from 'aws-lambda';
import { UnAuthorizedError, ValidationError } from '@src/utils/errors';
import { fetchJWKs, cognitoPublicKeys, validateToken } from '@src/utils/authorization';
import ApiGatewayAuthPolicy, { HttpVerb } from 'api-gateway-auth-policy';

// Authorizer function for Websocket connections
export async function handle(event: CustomAuthorizerEvent): Promise<AuthResponse> {
  try {
    if (!event.authorizationToken) {
      throw new ValidationError('authorization token not found');
    }

    // Fetches JWKs if they're not available
    if (Object.keys(cognitoPublicKeys).length === 0) {
      await fetchJWKs();
    }

    // Remove 'bearer ' from token:
    const token = event.authorizationToken.substring(7);

    const decoded = validateToken(token, cognitoPublicKeys);

    return new ApiGatewayAuthPolicy('*')
      .allowMethod(HttpVerb.ALL, '*')
      .addValueToContext('username', decoded.username)
      .render(decoded.sub);
  } catch (error) {
    throw new UnAuthorizedError('Unauthorized');
  }
}
