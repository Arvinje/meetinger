import { APIGatewayProxyResult } from 'aws-lambda';
import { ListMeetingsRequest } from '@meetings/usecase/listMeetings/ListMeetingsRequest';
import { BaseController } from '@src/shared/infra/http/BaseController';
import { APIGatewayWithAuthorizerEvent } from '@src/shared/infra/http/types';
import { ValidationError } from '@src/shared/core/AppError';
import { BaseErrorResponse } from '@src/shared/core/BaseError';
import { ListMeetingsUseCase } from './ListMeetingsUseCase';
import { ListMeetingsResponse } from './ListMeetingsResponse';

export class ListMeetingsController extends BaseController {
  private useCase: ListMeetingsUseCase;

  constructor(useCase: ListMeetingsUseCase) {
    super();
    this.useCase = useCase;
  }

  async execute(event: APIGatewayWithAuthorizerEvent): Promise<APIGatewayProxyResult> {
    if (!event.queryStringParameters) return this.badRequest<BaseErrorResponse>();

    const request: ListMeetingsRequest = {
      location: event.queryStringParameters.location,
      month: event.queryStringParameters.month,
      category: event.queryStringParameters.category,
    };

    const result = await this.useCase.execute(request);
    if (result.isErr()) {
      const error = result.unwrapErr();
      switch (error.type) {
        case ValidationError.type:
          return this.unprocessableEntity<BaseErrorResponse>((error as ValidationError).toResponse);

        default:
          return this.internalError<BaseErrorResponse>(error.toResponse);
      }
    }

    return this.ok<ListMeetingsResponse>(result.unwrap());
  }
}
