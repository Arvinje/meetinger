import { Ok, Err, Result } from '@hqoss/monads';
import { UnexpectedError, ValidationError } from '@src/shared/core/AppError';
import { UseCase } from '@src/shared/core/useCase';
import { UserRepo } from '@users/repos/UserRepo';
import { UserName } from '@users/domain/UserName';
import { UserEmail } from '@users/domain/UserEmail';
import { User } from '@users/domain/User';
import { UserFullName } from '@users/domain/UserFullName';
import { UserIntroduction } from '@users/domain/UserIntroduction';
import { CreateUserRequest } from './CreateUserRequest';

type Response = Result<void, ValidationError | UnexpectedError>;

export class CreateUserUseCase implements UseCase<CreateUserRequest, Promise<Response>> {
  private userRepo: UserRepo;

  constructor(userRepo: UserRepo) {
    this.userRepo = userRepo;
  }

  async execute(request: CreateUserRequest): Promise<Response> {
    const usernameOrError = await UserName.create(request.username);
    if (usernameOrError.isErr()) return Err(usernameOrError.unwrapErr());

    const fullNameOrError = await UserFullName.create(request.username);
    if (fullNameOrError.isErr()) return Err(fullNameOrError.unwrapErr());

    const emailOrError = await UserEmail.create(request.email);
    if (emailOrError.isErr()) return Err(emailOrError.unwrapErr());

    const introOrError = await UserIntroduction.create('');
    if (introOrError.isErr()) return Err(introOrError.unwrapErr());

    const userOrError = User.create({
      username: usernameOrError.unwrap(),
      fullName: fullNameOrError.unwrap(),
      email: emailOrError.unwrap(),
      joinedOn: new Date(),
      introduction: introOrError.unwrap(),
    });

    try {
      await this.userRepo.create(userOrError.unwrap());
      return Ok(undefined);
    } catch (error) {
      return Err(error);
    }
  }
}
