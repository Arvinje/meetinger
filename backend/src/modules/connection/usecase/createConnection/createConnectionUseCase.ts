import { Ok, Err } from '@hqoss/monads';
import { DynamoDBError } from '@src/utils/errors';
import { UseCase } from '@src/shared/core/useCase';
import { ConnectionRepo } from '@connection/repos/connectionRepo';
import { Connection } from '@connection/domain/connection';
import { CreateConnectionDTO } from './createConnectionDTO';
import { Response } from './createConnectionResponse';

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
      return Err(error as DynamoDBError);
    }
  }
}
