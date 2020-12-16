import { AttendeeDetailsDTO } from './AttendeeDetailsDTO';
import { MeetingDTO } from './MeetingDTO';

export type MeetingViewDTO = MeetingDTO & {
  attendees: AttendeeDetailsDTO[];
};
