import { APIGatewayProxyResult } from 'aws-lambda';
import { EditMeetingRequest } from '@meetings/usecase/editMeeting/EditMeetingRequest';
import { EditMeetingUseCase } from '@meetings/usecase/editMeeting/EditMeetingUseCase';
import { BaseController } from '@src/shared/infra/http/BaseController';
import { APIGatewayWithAuthorizerEvent } from '@src/shared/infra/http/types';
import { AppErrors, UnexpectedError } from '@src/shared/core/AppError';
import { MeetingErrors } from '@meetings/errors/MeetingErrors';

export class EditMeetingController extends BaseController {
  private useCase: EditMeetingUseCase;

  constructor(useCase: EditMeetingUseCase) {
    super();
    this.useCase = useCase;
  }

  async execute(event: APIGatewayWithAuthorizerEvent): Promise<APIGatewayProxyResult> {
    const request: EditMeetingRequest = JSON.parse(event.body);
    request.id = event.pathParameters.id;
    request.organizer = event.requestContext.authorizer.username;

    const result = await this.useCase.execute(request);
    if (result.isErr()) {
      const error = result.unwrapErr();
      switch (error.type) {
        case AppErrors.ForbiddenError:
          return this.forbidden(error.toResponse);

        case AppErrors.ValidationError:
        case MeetingErrors.MeetingAlreadyStarted:
        case MeetingErrors.MeetingStartingDateInvalid:
        case MeetingErrors.RemoteMeetingCannotHaveAddress:
          return this.unprocessableEntity(error.toResponse);

        case AppErrors.UnexpectedError:
          return this.internalError(error.toResponse);

        default:
          return this.internalError(UnexpectedError.wrap(error).toResponse);
      }
    }

    return this.noContent();
  }
}
