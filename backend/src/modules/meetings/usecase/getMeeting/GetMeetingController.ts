import { APIGatewayProxyResult } from 'aws-lambda';
import { GetMeetingRequest } from '@meetings/usecase/getMeeting/GetMeetingRequest';
import { BaseController } from '@src/shared/infra/http/BaseController';
import { APIGatewayWithAuthorizerEvent } from '@src/shared/infra/http/types';
import { AppErrors, UnexpectedError } from '@src/shared/core/AppError';
import { BaseErrorResponse } from '@src/shared/core/BaseError';
import { MeetingViewDTO } from '@meetings/dtos/MeetingViewDTO';
import { MeetingErrors } from '@meetings/errors/MeetingErrors';
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
        case AppErrors.UnexpectedError:
          return this.internalError<BaseErrorResponse>(error.toResponse);

        case MeetingErrors.MeetingNotFoundError:
          return this.notFound<BaseErrorResponse>(error.toResponse);

        default:
          return this.internalError<BaseErrorResponse>(
            UnexpectedError.wrap(error, 'unknown error detected').toResponse
          );
      }
    }

    return this.ok<MeetingViewDTO>(result.unwrap());
  }
}
