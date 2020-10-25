import 'source-map-support/register';
import { APIGatewayProxyResult, APIGatewayProxyEvent } from 'aws-lambda';
import { CreateConnectionUseCase } from '@src/modules/connection/usecase/createConnection/CreateConnectionUseCase';
import { CreateConnectionRequest } from '@src/modules/connection/usecase/createConnection/CreateConnectionRequest';
import { BaseController } from '@src/shared/infra/http/BaseController';
import { BaseErrorResponse } from '@src/shared/core/BaseError';

export class CreateConnectionController extends BaseController {
  private useCase: CreateConnectionUseCase;

  constructor(useCase: CreateConnectionUseCase) {
    super();
    this.useCase = useCase;
  }

  async execute(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    const request: CreateConnectionRequest = {
      id: event.requestContext.connectionId,
      userId: event.requestContext.authorizer.principalId,
      username: event.requestContext.authorizer.username,
    };

    const result = await this.useCase.execute(request);
    if (result.isErr()) {
      return this.internalError<BaseErrorResponse>(result.unwrapErr().toResponse);
    }

    return this.ok();
  }
}
