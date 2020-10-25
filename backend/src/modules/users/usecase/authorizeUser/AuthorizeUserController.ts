import 'source-map-support/register';
import {
  APIGatewayAuthorizerResult,
  APIGatewayAuthorizerEvent,
  APIGatewayRequestAuthorizerEvent,
  APIGatewayTokenAuthorizerEvent,
} from 'aws-lambda';
import { AuthorizeUserRequest } from './AuthorizeUserRequest';
import { AuthorizeUserUseCase } from './AuthorizeUserUseCase';

type Response = APIGatewayAuthorizerResult;

export class AuthorizeUserController {
  private useCase: AuthorizeUserUseCase;

  constructor(useCase: AuthorizeUserUseCase) {
    this.useCase = useCase;
  }

  async execute(event: APIGatewayAuthorizerEvent): Promise<Response> {
    let apiType: 'WebSocket' | 'REST';
    let authorizationToken: string;
    if (event.methodArn.includes('$connect')) {
      apiType = 'WebSocket';
      authorizationToken = (event as APIGatewayRequestAuthorizerEvent).queryStringParameters.Auth;
    } else {
      apiType = 'REST';
      authorizationToken = (event as APIGatewayTokenAuthorizerEvent).authorizationToken.substring(
        7
      );
    }

    const request: AuthorizeUserRequest = {
      apiType,
      authorizationToken,
      methodArn: event.methodArn,
    };

    const result = await this.useCase.execute(request);
    if (result.isErr()) {
      // the only way that API Gateway would return a 401 response instead of a 5xx
      throw new Error('Unauthorized');
    }

    return result.unwrap();
  }
}
