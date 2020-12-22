export interface MeetingDTO {
  id: string;
  title: string;
  description: string;
  category: string;
  startsAt: string;
  place: string;
  address?: string;
  remainingSeats: number;
  availableSeats: number;
  createdBy: string;
}
