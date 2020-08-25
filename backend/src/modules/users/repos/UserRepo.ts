import { User } from '@users/domain/User';
import { UserName } from '@users/domain/UserName';

export interface UserRepo {
  create(user: User): Promise<void>;
  find(username: UserName): Promise<User>;
}
