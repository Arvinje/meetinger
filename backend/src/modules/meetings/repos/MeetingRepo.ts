import { Meeting } from '@meetings/domain/Meeting';
import { MeetingID } from '@meetings/domain/MeetingID';

export interface MeetingRepo {
  create(meeting: Meeting): Promise<void>;
  fetchMeetingByID(meetingID: MeetingID): Promise<Meeting>;
  updateAttendees(meeting: Meeting): Promise<void>;
}
