import { UserName } from '@users/domain/UserName';
import { MeetingID } from '@meetings/domain/MeetingID';

export interface AttendeeRepo {
  exists(username: UserName, meetingID: MeetingID): Promise<boolean>;
}
