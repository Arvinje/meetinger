export interface CreateMeetingRequest {
  title: string;
  organizer: string;
  description: string;
  startsAt: string;
  location: string;
  availableSeats: number;
}
