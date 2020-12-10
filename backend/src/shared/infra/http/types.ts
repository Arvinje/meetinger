import {
  APIGatewayProxyWithLambdaAuthorizerEvent,
  APIGatewayProxyWithLambdaAuthorizerHandler,
} from 'aws-lambda';

export interface AuthorizerContext {
  username: string;
}

export type APIGatewayWithAuthorizerEvent = APIGatewayProxyWithLambdaAuthorizerEvent<AuthorizerContext>;

export type APIGatewayWithAuthorizerHandler = APIGatewayProxyWithLambdaAuthorizerHandler<AuthorizerContext>;
