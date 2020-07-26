import { UseCase } from '@src/shared/core/useCase';
import { Ok, Err } from '@hqoss/monads';
import { DynamoDBError } from '@src/utils/errors';
import { ConnectionRepo } from '@connection/repos/connectionRepo';
import { Response } from './deleteConnectionResponse';
import { DeleteConnectionDTO } from './deleteConnectionDTO';

export class DeleteConnectionUseCase implements UseCase<DeleteConnectionDTO, Promise<Response>> {
  private connectionRepo: ConnectionRepo;

  constructor(connectionRepo: ConnectionRepo) {
    this.connectionRepo = connectionRepo;
  }

  async execute(request: DeleteConnectionDTO): Promise<Response> {
    try {
      await this.connectionRepo.delete(request.id);
      return Ok(undefined);
    } catch (error) {
      return Err(error as DynamoDBError);
    }
  }
}
