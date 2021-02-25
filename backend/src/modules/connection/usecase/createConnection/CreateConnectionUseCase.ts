import { Ok, Err, Result } from '@hqoss/monads';
import { UseCase } from '@src/shared/core/useCase';
import { ConnectionRepo } from '@connection/repos/connectionRepo';
import { Connection } from '@connection/domain/connection';
import { UnexpectedError } from '@src/shared/core/AppError';
import { CreateConnectionRequest } from './CreateConnectionRequest';

type Response = Result<void, UnexpectedError>;

export class CreateConnectionUseCase
  implements UseCase<CreateConnectionRequest, Promise<Response>> {
  private connectionRepo: ConnectionRepo;

  constructor(connectionRepo: ConnectionRepo) {
    this.connectionRepo = connectionRepo;
  }

  async execute(request: CreateConnectionRequest): Promise<Response> {
    const connection = Connection.create({
      id: request.id,
      userId: request.userId,
      username: request.username,
    });

    try {
      await this.connectionRepo.create(connection);
      return Ok(undefined);
    } catch (error) {
      return Err(UnexpectedError.wrap(error));
    }
  }
}
