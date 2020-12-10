import { UserName } from '@users/domain/UserName';
import { MeetingID } from '@meetings/domain/MeetingID';
import { Attendee } from '@meetings/domain/Attendee';
import { AttendeeDetails } from '@meetings/domain/AttendeeDetails';

export interface AttendeeRepo {
  save(attendee: Attendee, currentVersion?: number): Promise<void>;
  remove(username: UserName, meetingID: MeetingID): Promise<void>;
  exists(username: UserName, meetingID: MeetingID): Promise<boolean>;
  fetch(username: UserName, meetingID: MeetingID): Promise<[Attendee, number]>;
  fetchAllByMeetingID(meetingID: MeetingID): Promise<AttendeeDetails[]>;
}
