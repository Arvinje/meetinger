export interface AttendeeJoinedEvent {
  username: string;
  meetingID: string;
  joinedMeetingOn: Date;
  isOrganizer: boolean;
}
