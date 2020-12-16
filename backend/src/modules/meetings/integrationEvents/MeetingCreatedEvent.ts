export interface MeetingCreatedEvent {
  id: string;
  title: string;
  description: string;
  category: string;
  startsAt: Date;
  location: string;
  availableSeats: number;
  createdBy: string;
}
