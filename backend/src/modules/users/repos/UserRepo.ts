import { User } from '@users/domain/User';

export interface UserRepo {
  create(user: User): Promise<void>;
}
