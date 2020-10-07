import { Ok, Err, Result } from '@hqoss/monads';
import { UseCase } from '@src/shared/core/useCase';
import { ConnectionRepo } from '@connection/repos/connectionRepo';
import { Connection } from '@connection/domain/connection';
import { UnexpectedError } from '@src/shared/core/AppError';
import { CreateConnectionDTO } from './createConnectionDTO';

type Response = Result<void, UnexpectedError>;

export class CreateConnectionUseCase implements UseCase<CreateConnectionDTO, Promise<Response>> {
  private connectionRepo: ConnectionRepo;

  constructor(connectionRepo: ConnectionRepo) {
    this.connectionRepo = connectionRepo;
  }

  async execute(request: CreateConnectionDTO): Promise<Response> {
    const connection = Connection.create({
      id: request.id,
      userId: request.userId,
      username: request.username,
    });

    try {
      await this.connectionRepo.create(connection);
      return Ok(undefined);
    } catch (error) {
      return Err(
        UnexpectedError.wrap(
          error,
          'An unexpected error occured when executing CreateConnectionUseCase'
        )
      );
    }
  }
}
