import { Meeting } from '@meetings/domain/Meeting';

export interface MeetingRepo {
  create(meeting: Meeting): Promise<void>;
}
