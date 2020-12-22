export interface MeetingCreatedEvent {
  id: string;
  title: string;
  description: string;
  category: string;
  startsAt: Date;
  place: string;
  availableSeats: number;
  createdBy: string;
}
