import dayjs from 'dayjs';
import { Err, Ok, Result } from '@hqoss/monads';
import { UseCase } from '@src/shared/core/useCase';
import { UnexpectedError } from '@src/shared/core/AppError';
import { AttendeeJoinedEvent } from '@meetings/integrationEvents/AttendeeJoinedEvent';
import { UserName } from '@users/domain/UserName';
import { UserRepo } from '@users/repos/UserRepo';
import { User } from '@users/domain/User';
import { EmailService } from '@src/shared/infra/emailService/EmailService';
import { AttendeeJoinedEmail } from '@meetings/emails/AttendeeJoinedEmail';

type Response = Result<void, UnexpectedError>;

export class EmailJoinedAttendeeUseCase implements UseCase<AttendeeJoinedEvent, Promise<Response>> {
  private emailService: EmailService;

  private userRepo: UserRepo;

  constructor(emailService: EmailService, userRepo: UserRepo) {
    this.emailService = emailService;
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

    try {
      await this.emailService.send('AttendeeJoined', user.email, emailPayload);
      return Ok(undefined);
    } catch (error) {
      return Err(UnexpectedError.wrap(error));
    }
  }
}
