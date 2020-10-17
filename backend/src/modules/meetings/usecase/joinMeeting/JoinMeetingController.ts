import { APIGatewayProxyResult } from 'aws-lambda';
import { JoinMeetingRequest } from '@meetings/usecase/joinMeeting/JoinMeetingRequest';
import { BaseController } from '@src/shared/infra/http/BaseController';
import { APIGatewayWithAuthorizerEvent } from '@src/shared/infra/http/types';
import { ValidationError } from '@src/shared/core/AppError';
import { BaseErrorResponse } from '@src/shared/core/BaseError';
import { MeetingNotFoundError } from '@meetings/errors/MeetingErrors';
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
        case ValidationError.type:
          return this.unprocessableEntity<BaseErrorResponse>((error as ValidationError).toResponse);

        case MeetingNotFoundError.type:
          return this.notFound<BaseErrorResponse>((error as MeetingNotFoundError).toResponse);

        default:
          return this.internalError<BaseErrorResponse>(error.toResponse);
      }
    }

    return this.created<void>();
  }
}
