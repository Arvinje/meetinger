import { Entity } from '@src/shared/domain/entity';
import { Ok, Result } from '@hqoss/monads';
import { UserIntroduction } from './UserIntroduction';
import { UserName } from './UserName';
import { UserFullName } from './UserFullName';
import { UserEmail } from './UserEmail';

export interface UserProps {
  username: UserName;
  email: UserEmail;
  fullName: UserFullName;
  joinedOn?: Date;
  introduction: UserIntroduction;
}

type Response = Result<User, void>;

export class User extends Entity<UserProps> {
  get username(): UserName {
    return this.props.username;
  }

  get email(): UserEmail {
    return this.props.email;
  }

  get fullName(): UserFullName {
    return this.props.fullName;
  }

  get joinedOn(): Date {
    return this.props.joinedOn;
  }

  get introduction(): UserIntroduction {
    return this.props.introduction;
  }

  // eslint-disable-next-line no-useless-constructor
  private constructor(props: UserProps) {
    super(props);
  }

  public static create(props: UserProps): Response {
    const defaultProps: UserProps = {
      ...props,
      joinedOn: props.joinedOn || new Date(),
    };
    return Ok(new User(defaultProps));
  }
}
