import { Meeting } from '@meetings/domain/Meeting';
import { MeetingID } from '@meetings/domain/MeetingID';
import { MeetingView } from '@meetings/domain/MeetingView';
import { MeetingCategory } from '@meetings/domain/MeetingCategory';
import { MeetingItemView } from '@meetings/domain/MeetingItemView';
import { MeetingLocation } from '@meetings/domain/MeetingLocation';

export interface MeetingRepo {
  create(meeting: Meeting): Promise<void>;
  fetchMeetingByID(meetingID: MeetingID): Promise<Meeting>;
  updateAttendees(meeting: Meeting): Promise<void>;
  fetchMeetingView(meetingID: MeetingID): Promise<MeetingView>;
  fetchMeetingItemViews(
    location: MeetingLocation,
    month: string,
    category?: MeetingCategory
  ): Promise<MeetingItemView[]>;
}
