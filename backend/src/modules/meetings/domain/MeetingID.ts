import { Entity } from '@src/shared/domain/entity';
import { UniqueID } from '@src/shared/domain/uniqueId';

export class MeetingID extends Entity<void> {
  get id(): UniqueID {
    // eslint-disable-next-line no-underscore-dangle
    return this._id;
  }

  private constructor(id?: UniqueID) {
    super(null, id);
  }

  public static create(id?: UniqueID): MeetingID {
    return new MeetingID(id);
  }
}
