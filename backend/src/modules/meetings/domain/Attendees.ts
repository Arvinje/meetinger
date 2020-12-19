import { Err, Ok, Result } from '@hqoss/monads';
import { UserName } from '@users/domain/UserName';
import { ValidationError } from '@src/shared/core/AppError';

export class Attendees {
  private readonly usernames: UserName[];

  private constructor(usernames: UserName[]) {
    this.usernames = usernames;
  }

  public static create(usernames: UserName[]): Result<Attendees, ValidationError> {
    if (usernames.length === 0)
      return Err(ValidationError.create('at least one attendee is required'));

    const usernameValues = usernames.map((u: UserName) => u.value);
    if (new Set(usernameValues).size !== usernames.length)
      return Err(ValidationError.create('attendee is already added'));

    return Ok(new Attendees(usernames));
  }

  get value(): UserName[] {
    return this.usernames;
  }

  get count(): number {
    return this.usernames.length;
  }

  public add(username: UserName): Result<Attendees, ValidationError> {
    if (this.has(username)) return Err(ValidationError.create('attendee already exists'));

    return Attendees.create([...this.usernames, username]);
  }

  public remove(username: UserName): Result<Attendees, ValidationError> {
    if (this.usernames.findIndex((u: UserName) => u.equals(username)) === -1)
      return Err(ValidationError.create(`attendee was not found`));

    const newList = this.usernames.filter((u) => !u.equals(username));

    return Attendees.create(newList);
  }

  public has(username: UserName): boolean {
    return this.usernames.findIndex((u: UserName) => u.equals(username)) !== -1;
  }
}
