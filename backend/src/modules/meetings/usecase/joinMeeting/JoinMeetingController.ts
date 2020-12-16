import { APIGatewayProxyResult } from 'aws-lambda';
import { JoinMeetingRequest } from '@meetings/usecase/joinMeeting/JoinMeetingRequest';
import { BaseController } from '@src/shared/infra/http/BaseController';
import { APIGatewayWithAuthorizerEvent } from '@src/shared/infra/http/types';
import { AppErrors, UnexpectedError } from '@src/shared/core/AppError';
import { BaseErrorResponse } from '@src/shared/core/BaseError';
import { MeetingErrors } from '@meetings/errors/MeetingErrors';
import { JoinMeetingUseCase } from './JoinMeetingUseCase';

export class JoinMeetingController extends BaseController {
  private useCase: JoinMeetingUseCase;

  constructor(useCase: JoinMeetingUseCase) {
    super();
    this.useCase = useCase;
  }

  async execute(event: APIGatewayWithAuthorizerEvent): Promise<APIGatewayProxyResult> {
    const request: JoinMeetingRequest = {
      meetingID: event.pathParameters.id,
      attendeeUserName: event.requestContext.authorizer.username,
    };

    const result = await this.useCase.execute(request);
    if (result.isErr()) {
      const error = result.unwrapErr();
      switch (error.type) {
        case AppErrors.UnexpectedError:
          return this.internalError<BaseErrorResponse>(error.toResponse);

        case AppErrors.ValidationError:
          return this.unprocessableEntity<BaseErrorResponse>(error.toResponse);

        case MeetingErrors.MeetingNotFoundError:
          return this.notFound<BaseErrorResponse>(error.toResponse);

        case MeetingErrors.MeetingFullyBooked:
          return this.unprocessableEntity<BaseErrorResponse>(error.toResponse);

        default:
          return this.internalError<BaseErrorResponse>(
            UnexpectedError.wrap(error, 'unknown error detected').toResponse
          );
      }
    }

    return this.created<void>();
  }
}
