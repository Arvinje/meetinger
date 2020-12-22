export interface CreateMeetingRequest {
  title: string;
  organizer: string;
  description: string;
  category: string;
  startsAt: string;
  place: string;
  address?: string;
  availableSeats: number;
}
