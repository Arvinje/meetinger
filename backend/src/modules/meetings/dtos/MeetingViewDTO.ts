import { AttendeeDetailsDTO } from './AttendeeDetailsDTO';

export interface MeetingViewDTO {
  id: string;
  title: string;
  description: string;
  category: string;
  startsAt: string;
  location: string;
  remainingSeats: number;
  availableSeats: number;
  createdBy: string;
  attendees: AttendeeDetailsDTO[];
}
