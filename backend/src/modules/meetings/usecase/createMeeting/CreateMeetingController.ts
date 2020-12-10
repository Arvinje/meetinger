import { APIGatewayProxyResult } from 'aws-lambda';
import { CreateMeetingRequest } from '@meetings/usecase/createMeeting/CreateMeetingRequest';
import { CreateMeetingUseCase } from '@meetings/usecase/createMeeting/CreateMeetingUseCase';
import { BaseController } from '@src/shared/infra/http/BaseController';
import { APIGatewayWithAuthorizerEvent } from '@src/shared/infra/http/types';
import { ValidationError } from '@src/shared/core/AppError';
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
        case ValidationError.type:
          return this.unprocessableEntity<BaseErrorResponse>(error.toResponse as ValidationError);

        default:
          return this.internalError<BaseErrorResponse>(error.toResponse);
      }
    }

    return this.created<CreateMeetingResponse>(result.unwrap());
  }
}
