import { Meeting } from '@meetings/domain/Meeting';
import { MeetingID } from '@meetings/domain/MeetingID';
import { MeetingView } from '@meetings/domain/MeetingView';

export interface MeetingRepo {
  create(meeting: Meeting): Promise<void>;
  fetchMeetingByID(meetingID: MeetingID): Promise<Meeting>;
  updateAttendees(meeting: Meeting): Promise<void>;
  fetchMeetingView(meetingID: MeetingID): Promise<MeetingView>;
}
