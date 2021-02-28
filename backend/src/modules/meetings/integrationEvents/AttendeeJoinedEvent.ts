export interface AttendeeJoinedEvent {
  username: string;
  meetingID: string;
  meetingTitle: string;
  meetingStartsAt: Date;
  joinedMeetingOn: Date;
  isOrganizer: boolean;
}
