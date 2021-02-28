import { AttendeeJoinedEmail } from '@meetings/emails/AttendeeJoinedEmail';
import { UserEmail } from '@users/domain/UserEmail';

export interface EmailService {
  send(
    template: 'AttendeeJoined',
    toAddress: UserEmail,
    payload: AttendeeJoinedEmail
  ): Promise<void>;
}
