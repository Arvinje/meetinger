import { UserName } from '@users/domain/UserName';
import { MeetingID } from '@meetings/domain/MeetingID';
import { Attendee } from '@meetings/domain/Attendee';

export interface AttendeeRepo {
  exists(username: UserName, meetingID: MeetingID): Promise<boolean>;
  fetch(username: UserName, meetingID: MeetingID): Promise<Attendee>;
}
