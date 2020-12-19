import { APIGatewayProxyResult } from 'aws-lambda';
import { BaseController } from '@src/shared/infra/http/BaseController';
import { APIGatewayWithAuthorizerEvent } from '@src/shared/infra/http/types';
import { AppErrors, UnexpectedError } from '@src/shared/core/AppError';
import { BaseErrorResponse } from '@src/shared/core/BaseError';
import { ListRegisteredMeetingsUseCase } from './ListRegisteredMeetingsUseCase';
import { ListRegisteredMeetingsResponse } from './ListRegisteredMeetingsResponse';
import { ListRegisteredMeetingsRequest } from './ListRegisteredMeetingsRequest';

export class ListRegisteredMeetingsController extends BaseController {
  private useCase: ListRegisteredMeetingsUseCase;

  constructor(useCase: ListRegisteredMeetingsUseCase) {
    super();
    this.useCase = useCase;
  }

  async execute(event: APIGatewayWithAuthorizerEvent): Promise<APIGatewayProxyResult> {
    const request: ListRegisteredMeetingsRequest = {
      username: event.requestContext.authorizer.username,
    };

    const result = await this.useCase.execute(request);
    if (result.isErr()) {
      const error = result.unwrapErr();
      switch (error.type) {
        case AppErrors.UnexpectedError:
          return this.internalError<BaseErrorResponse>(error.toResponse);

        case AppErrors.ValidationError:
          return this.unprocessableEntity<BaseErrorResponse>(error.toResponse);

        default:
          return this.internalError<BaseErrorResponse>(
            UnexpectedError.wrap(error, 'unknown error detected').toResponse
          );
      }
    }

    return this.ok<ListRegisteredMeetingsResponse>(result.unwrap());
  }
}
