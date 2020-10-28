/* eslint-disable class-methods-use-this */
import { APIGatewayProxyResult } from 'aws-lambda';
import { APIGatewayWithAuthorizerEvent } from './types';

export abstract class BaseController {
  protected abstract execute(event: APIGatewayWithAuthorizerEvent): Promise<APIGatewayProxyResult>;

  protected static json<TResponse>(statusCode: number, body?: TResponse): APIGatewayProxyResult {
    const jsonBody = body ? JSON.stringify(body) : '';
    return {
      statusCode,
      body: jsonBody,
    };
  }

  protected ok<TResponse>(body?: TResponse): APIGatewayProxyResult {
    return BaseController.json(200, body);
  }

  protected created<TResponse>(body?: TResponse): APIGatewayProxyResult {
    return BaseController.json(201, body);
  }

  protected noContent(): APIGatewayProxyResult {
    return BaseController.json(204);
  }

  protected badRequest<TResponse>(body?: TResponse): APIGatewayProxyResult {
    return BaseController.json(400, body);
  }

  protected unauthorized<TResponse>(body?: TResponse): APIGatewayProxyResult {
    return BaseController.json(401, body);
  }

  protected forbidden<TResponse>(body?: TResponse): APIGatewayProxyResult {
    return BaseController.json(403, body);
  }

  protected notFound<TResponse>(body?: TResponse): APIGatewayProxyResult {
    return BaseController.json(404, body);
  }

  protected unprocessableEntity<TResponse>(body?: TResponse): APIGatewayProxyResult {
    return BaseController.json(422, body);
  }

  protected internalError<TResponse>(body?: TResponse): APIGatewayProxyResult {
    return BaseController.json(500, body);
  }
}
