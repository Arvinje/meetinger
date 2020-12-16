import { APIGatewayProxyResult } from 'aws-lambda';
import { CreateMeetingRequest } from '@meetings/usecase/createMeeting/CreateMeetingRequest';
import { CreateMeetingUseCase } from '@meetings/usecase/createMeeting/CreateMeetingUseCase';
import { BaseController } from '@src/shared/infra/http/BaseController';
import { APIGatewayWithAuthorizerEvent } from '@src/shared/infra/http/types';
import { AppErrors, UnexpectedError } from '@src/shared/core/AppError';
import { BaseErrorResponse } from '@src/shared/core/BaseError';
import { CreateMeetingResponse } from './CreateMeetingResponse';

export class CreateMeetingController extends BaseController {
  private useCase: CreateMeetingUseCase;

  constructor(useCase: CreateMeetingUseCase) {
    super();
    this.useCase = useCase;
  }

  async execute(event: APIGatewayWithAuthorizerEvent): Promise<APIGatewayProxyResult> {
    const request: CreateMeetingRequest = JSON.parse(event.body);
    request.organizer = event.requestContext.authorizer.username;

    const result = await this.useCase.execute(request);
    if (result.isErr()) {
      const error = result.unwrapErr();
      switch (error.type) {
        case AppErrors.ValidationError:
          return this.unprocessableEntity<BaseErrorResponse>(error.toResponse);

        case AppErrors.UnexpectedError:
          return this.internalError<BaseErrorResponse>(error.toResponse);

        default:
          return this.internalError<BaseErrorResponse>(
            UnexpectedError.wrap(error, 'unknown error detected').toResponse
          );
      }
    }

    return this.created<CreateMeetingResponse>(result.unwrap());
  }
}
