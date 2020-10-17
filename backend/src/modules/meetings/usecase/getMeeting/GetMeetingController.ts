import { APIGatewayProxyResult } from 'aws-lambda';
import { GetMeetingRequest } from '@meetings/usecase/getMeeting/GetMeetingRequest';
import { BaseController } from '@src/shared/infra/http/BaseController';
import { APIGatewayWithAuthorizerEvent } from '@src/shared/infra/http/types';
import { ValidationError } from '@src/shared/core/AppError';
import { BaseErrorResponse } from '@src/shared/core/BaseError';
import { MeetingViewDTO } from '@meetings/dtos/MeetingViewDTO';
import { MeetingNotFoundError } from '@meetings/errors/MeetingErrors';
import { GetMeetingUseCase } from './GetMeetingUseCase';

export class GetMeetingController extends BaseController {
  private useCase: GetMeetingUseCase;

  constructor(useCase: GetMeetingUseCase) {
    super();
    this.useCase = useCase;
  }

  async execute(event: APIGatewayWithAuthorizerEvent): Promise<APIGatewayProxyResult> {
    const request: GetMeetingRequest = {
      meetingID: event.pathParameters.id,
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

    return this.ok<MeetingViewDTO>(result.unwrap());
  }
}
