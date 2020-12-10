import { Meeting } from '@meetings/domain/Meeting';
import { MeetingID } from '@meetings/domain/MeetingID';
import { MeetingCategory } from '@meetings/domain/MeetingCategory';
import { MeetingItemView } from '@meetings/domain/MeetingItemView';
import { MeetingLocation } from '@meetings/domain/MeetingLocation';

export interface MeetingRepo {
  save(meeting: Meeting, currentVersion?: number): Promise<void>;
  fetchMeetingByID(meetingID: MeetingID): Promise<[Meeting, number]>;
  fetchMeetingItemViews(
    location: MeetingLocation,
    month: string,
    category?: MeetingCategory
  ): Promise<MeetingItemView[]>;
}
