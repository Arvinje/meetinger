import { WatchedList } from '@src/shared/domain/WatchedList';
import { Attendee } from './Attendee';

export class Attendees extends WatchedList<Attendee> {
  // eslint-disable-next-line no-useless-constructor
  private constructor(initialAttendees: Attendee[]) {
    super(initialAttendees);
  }

  // eslint-disable-next-line class-methods-use-this
  compareItems(a: Attendee, b: Attendee): boolean {
    return a.equals(b);
  }

  public static create(attendees?: Attendee[]): Attendees {
    return new Attendees(attendees || []);
  }
}
