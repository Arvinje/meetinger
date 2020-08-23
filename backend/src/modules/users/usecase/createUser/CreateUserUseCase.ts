import { Ok, Err } from '@hqoss/monads';
import { DynamoDBError } from '@src/utils/errors';
import { UseCase } from '@src/shared/core/useCase';
import { UserRepo } from '@users/repos/UserRepo';
import { UserName } from '@users/domain/UserName';
import { UserEmail } from '@users/domain/UserEmail';
import { User } from '@users/domain/User';
import { CreateUserRequest } from './CreateUserRequest';
import { Response } from './CreateUserResponse';

export class CreateUserUseCase implements UseCase<CreateUserRequest, Promise<Response>> {
  private userRepo: UserRepo;

  constructor(userRepo: UserRepo) {
    this.userRepo = userRepo;
  }

  async execute(request: CreateUserRequest): Promise<Response> {
    const usernameOrError = await UserName.create(request.username);
    if (usernameOrError.isErr()) return Err(usernameOrError.unwrapErr());

    const emailOrError = await UserEmail.create(request.email);
    if (emailOrError.isErr()) return Err(emailOrError.unwrapErr());

    const user = User.create({
      username: usernameOrError.unwrap(),
      email: emailOrError.unwrap(),
      joinedOn: new Date(),
    });

    try {
      await this.userRepo.create(user);
      return Ok(undefined);
    } catch (error) {
      return Err(error as DynamoDBError);
    }
  }
}
