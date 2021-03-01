import dayjs from 'dayjs';
import { Err, Ok, Result } from '@hqoss/monads';
import { UseCase } from '@src/shared/core/useCase';
import { UnexpectedError } from '@src/shared/core/AppError';
import { AttendeeJoinedEvent } from '@meetings/integrationEvents/AttendeeJoinedEvent';
import { UserName } from '@users/domain/UserName';
import { UserRepo } from '@users/repos/UserRepo';
import { User } from '@users/domain/User';
import { AttendeeJoinedEmail } from '@meetings/emails/AttendeeJoinedEmail';
import { JobQueue } from '@src/shared/infra/queues/JobQueue';
import { EmailMessage } from '@src/shared/infra/emailService/EmailMessage';

type Response = Result<void, UnexpectedError>;

export class EmailJoinedAttendeeUseCase implements UseCase<AttendeeJoinedEvent, Promise<Response>> {
  private jobQueue: JobQueue;

  private userRepo: UserRepo;

  constructor(jobQueue: JobQueue, userRepo: UserRepo) {
    this.jobQueue = jobQueue;
    this.userRepo = userRepo;
  }

  async execute(payload: AttendeeJoinedEvent): Promise<Response> {
    const username = (await UserName.create(payload.username)).unwrap();

    let user: User;
    try {
      user = await this.userRepo.findByUserName(username);
    } catch (error) {
      return Err(UnexpectedError.wrap(error));
    }

    const emailPayload: AttendeeJoinedEmail = {
      meetingStartsAt: dayjs(payload.meetingStartsAt).format('DD/MM/YYYY [@] HH:mm'),
      meetingTitle: payload.meetingTitle,
    };

    const emailMessage: EmailMessage = {
      sender: 'no-reply',
      template: 'AttendeeJoined',
      templateData: JSON.stringify(emailPayload),
      toAddresses: [user.email.value],
    };

    try {
      await this.jobQueue.send('EmailsToSend', JSON.stringify(emailMessage));
      return Ok(undefined);
    } catch (error) {
      return Err(UnexpectedError.wrap(error));
    }
  }
}
