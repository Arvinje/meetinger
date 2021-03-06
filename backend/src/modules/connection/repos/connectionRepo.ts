import { Connection } from '@connection/domain/connection';

export interface ConnectionRepo {
  create(connection: Connection): Promise<void>;
  delete(id: string): Promise<void>;
}
