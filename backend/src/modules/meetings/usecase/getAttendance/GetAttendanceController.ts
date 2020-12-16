import { APIGatewayProxyResult } from 'aws-lambda';
import { BaseController } from '@src/shared/infra/http/BaseController';
import { APIGatewayWithAuthorizerEvent } from '@src/shared/infra/http/types';
import { AppErrors, UnexpectedError } from '@src/shared/core/AppError';
import { BaseErrorResponse } from '@src/shared/core/BaseError';
import { AttendeeErrors } from '@meetings/errors/AttendeeErrors';
import { GetAttendanceUseCase } from './GetAttendanceUseCase';
import { GetAttendanceResponse } from './GetAttendanceResponse';
import { GetAttendanceRequest } from './GetAttendanceRequest';

export class GetAttendanceController extends BaseController {
  private useCase: GetAttendanceUseCase;

  constructor(useCase: GetAttendanceUseCase) {
    super();
    this.useCase = useCase;
  }

  async execute(event: APIGatewayWithAuthorizerEvent): Promise<APIGatewayProxyResult> {
    const request: GetAttendanceRequest = {
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

        case AttendeeErrors.AttendeeNotFoundError:
          return this.notFound<BaseErrorResponse>(error.toResponse);

        default:
          return this.internalError<BaseErrorResponse>(
            UnexpectedError.wrap(error, 'unknown error detected').toResponse
          );
      }
    }

    return this.ok<GetAttendanceResponse>(result.unwrap());
  }
}
