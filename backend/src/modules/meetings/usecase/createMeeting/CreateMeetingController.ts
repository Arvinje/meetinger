import { APIGatewayProxyResult } from 'aws-lambda';
import { CreateMeetingRequest } from '@meetings/usecase/createMeeting/CreateMeetingRequest';
import { CreateMeetingUseCase } from '@src/modules/meetings/usecase/createMeeting/CreateMeetingUseCase';
import { BaseController } from '@src/shared/infra/http/BaseController';
import { APIGatewayWithAuthorizerEvent } from '@src/shared/infra/http/types';
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

      // eslint-disable-next-line no-console
      console.error(error);

      switch (error.name) {
        case 'ValidationError':
          return this.unprocessableEntity();

        default:
          return this.internalError();
      }
    }

    return this.created<CreateMeetingResponse>(result.unwrap());
  }
}
