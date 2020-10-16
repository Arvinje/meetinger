export interface CreateMeetingRequest {
  title: string;
  organizer: string;
  description: string;
  startsAt: string;
  availableSeats: number;
}
