import { Connection } from '@src/modules/connection/domain/connection';

export interface ConnectionRepo {
  create(connection: Connection): Promise<void>;
  delete(id: string): Promise<void>;
}
