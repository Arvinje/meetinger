export interface EditMeetingRequest {
  id: string;
  title?: string;
  description?: string;
  category?: string;
  organizer?: string;
  startsAt?: string;
  place?: string;
  address?: string;
  availableSeats?: number;
}
