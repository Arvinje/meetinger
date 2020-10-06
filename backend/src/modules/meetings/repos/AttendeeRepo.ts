import { Attendee } from '@meetings/domain/Attendee';

export interface MeetingRepo {
  AddAttendees(meeting: Attendee): Promise<void>;
}
