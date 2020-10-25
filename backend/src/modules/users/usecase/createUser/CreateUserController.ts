import 'source-map-support/register';
import { CognitoUserPoolTriggerEvent } from 'aws-lambda';
import { CreateUserRequest } from '@users/usecase/createUser/CreateUserRequest';
import { CreateUserUseCase } from '@users/usecase/createUser/CreateUserUseCase';
import { UnexpectedError } from '@src/shared/core/AppError';

type Response = CognitoUserPoolTriggerEvent | UnexpectedError;

export class CreateUserController {
  private useCase: CreateUserUseCase;

  constructor(useCase: CreateUserUseCase) {
    this.useCase = useCase;
  }

  async execute(event: CognitoUserPoolTriggerEvent): Promise<Response> {
    const request: CreateUserRequest = {
      username: event.userName,
      email: event.request.userAttributes.email,
    };

    const result = await this.useCase.execute(request);
    if (result.isErr()) return result.unwrapErr();
    return event;
  }
}
