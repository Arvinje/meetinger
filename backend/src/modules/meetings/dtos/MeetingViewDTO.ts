import { AttendeeDetailsDTO } from './AttendeeDetailsDTO';

export interface MeetingViewDTO {
  id: string;
  title: string;
  description: string;
  startsAt: string;
  remainingSeats: number;
  availableSeats: number;
  createdBy: string;
  attendees: AttendeeDetailsDTO[];
}
