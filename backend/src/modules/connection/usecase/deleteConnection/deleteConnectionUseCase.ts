import { UseCase } from '@src/shared/core/useCase';
import { Ok, Err, Result } from '@hqoss/monads';
import { ConnectionRepo } from '@connection/repos/connectionRepo';
import { UnexpectedError } from '@src/shared/core/AppError';
import { DeleteConnectionDTO } from './deleteConnectionDTO';

type Response = Result<void, UnexpectedError>;

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
      return Err(
        UnexpectedError.wrap(
          error,
          'An unexpected error occured when executing DeleteConnectionUseCase'
        )
      );
    }
  }
}
