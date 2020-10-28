export interface CreateMeetingRequest {
  title: string;
  organizer: string;
  description: string;
  category: string;
  startsAt: string;
  location: string;
  availableSeats: number;
}
