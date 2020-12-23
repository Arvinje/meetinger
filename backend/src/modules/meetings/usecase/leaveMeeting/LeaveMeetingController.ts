import { APIGatewayProxyResult } from 'aws-lambda';
import { JoinMeetingRequest } from '@meetings/usecase/joinMeeting/JoinMeetingRequest';
import { BaseController } from '@src/shared/infra/http/BaseController';
import { APIGatewayWithAuthorizerEvent } from '@src/shared/infra/http/types';
import { AppErrors, UnexpectedError } from '@src/shared/core/AppError';
import { BaseErrorResponse } from '@src/shared/core/BaseError';
import { MeetingErrors } from '@meetings/errors/MeetingErrors';
import { AttendeeErrors } from '@meetings/errors/AttendeeErrors';
import { LeaveMeetingUseCase } from './LeaveMeetingUseCase';

export class LeaveMeetingController extends BaseController {
  private useCase: LeaveMeetingUseCase;

  constructor(useCase: LeaveMeetingUseCase) {
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
        case MeetingErrors.OrganizerCannotLeaveError:
        case MeetingErrors.MeetingAlreadyStarted:
          return this.unprocessableEntity<BaseErrorResponse>(error.toResponse);

        case MeetingErrors.MeetingNotFoundError:
        case AttendeeErrors.AttendeeNotFoundError:
          return this.notFound<BaseErrorResponse>(error.toResponse);

        default:
          return this.internalError<BaseErrorResponse>(
            UnexpectedError.wrap(error, 'unknown error detected').toResponse
          );
      }
    }

    return this.noContent();
  }
}
