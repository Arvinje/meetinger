import { Meeting } from '@meetings/domain/Meeting';
import { MeetingID } from '@meetings/domain/MeetingID';
import { MeetingCategory } from '@meetings/domain/MeetingCategory';
import { MeetingItemView } from '@meetings/domain/MeetingItemView';
import { MeetingPlace } from '@meetings/domain/MeetingPlace';
import { UserName } from '@users/domain/UserName';
import { RegisteredMeetingView } from '@meetings/domain/RegisteredMeetingView';

export interface MeetingRepo {
  save(meeting: Meeting, currentVersion?: number): Promise<void>;
  fetchMeetingByID(meetingID: MeetingID): Promise<[Meeting, number]>;
  fetchMeetingItemViews(
    place: MeetingPlace,
    month: string,
    category?: MeetingCategory
  ): Promise<MeetingItemView[]>;
  fetchRegisteredMeetingViews(username: UserName): Promise<RegisteredMeetingView[]>;
}
