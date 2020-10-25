import 'source-map-support/register';
import { APIGatewayProxyResult, APIGatewayProxyEvent } from 'aws-lambda';
import { BaseController } from '@src/shared/infra/http/BaseController';
import { BaseErrorResponse } from '@src/shared/core/BaseError';
import { DeleteConnectionUseCase } from './DeleteConnectionUseCase';
import { DeleteConnectionRequest } from './DeleteConnectionRequest';

export class DeleteConnectionController extends BaseController {
  private useCase: DeleteConnectionUseCase;

  constructor(useCase: DeleteConnectionUseCase) {
    super();
    this.useCase = useCase;
  }

  async execute(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    const request: DeleteConnectionRequest = {
      id: event.requestContext.connectionId,
    };

    const result = await this.useCase.execute(request);
    if (result.isErr()) {
      return this.internalError<BaseErrorResponse>(result.unwrapErr().toResponse);
    }

    return this.ok();
  }
}
