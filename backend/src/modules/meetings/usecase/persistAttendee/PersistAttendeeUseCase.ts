import { Err, Ok, Result } from '@hqoss/monads';
import { UseCase } from '@src/shared/core/useCase';
import { UnexpectedError } from '@src/shared/core/AppError';
import { UniqueID } from '@src/shared/domain/uniqueId';
import { MeetingRepo } from '@meetings/repos/MeetingRepo';
import { MeetingID } from '@meetings/domain/MeetingID';
import { Meeting } from '@meetings/domain/Meeting';
import { AttendeeRepo } from '@meetings/repos/AttendeeRepo';
import { AttendeeJoinedEvent } from '@meetings/integrationEvents/AttendeeJoinedEvent';
import { UserName } from '@users/domain/UserName';
import { UserRepo } from '@users/repos/UserRepo';
import { User } from '@users/domain/User';
import { Attendee } from '@meetings/domain/Attendee';

type Response = Result<void, UnexpectedError>;

export class PersistAttendeeUseCase implements UseCase<AttendeeJoinedEvent, Promise<Response>> {
  private meetingRepo: MeetingRepo;

  private userRepo: UserRepo;

  private attendeeRepo: AttendeeRepo;

  constructor(meetingRepo: MeetingRepo, userRepo: UserRepo, attendeeRepo: AttendeeRepo) {
    this.meetingRepo = meetingRepo;
    this.userRepo = userRepo;
    this.attendeeRepo = attendeeRepo;
  }

  async execute(payload: AttendeeJoinedEvent): Promise<Response> {
    const username = (await UserName.create(payload.username)).unwrap();
    const meetingID = MeetingID.create(new UniqueID(payload.meetingID));

    let alreadyExists: boolean;
    try {
      alreadyExists = await this.attendeeRepo.exists(username, meetingID);
    } catch (error) {
      return Err(UnexpectedError.wrap(error));
    }

    if (alreadyExists) return Ok(undefined);

    let user: User;
    let meeting: Meeting;
    try {
      [user, [meeting]] = await Promise.all<User, [Meeting, number]>([
        this.userRepo.findByUserName(username),
        this.meetingRepo.fetchMeetingByID(meetingID),
      ]);
    } catch (error) {
      return Err(UnexpectedError.wrap(error));
    }

    const attendee = Attendee.create({
      username,
      meetingID,
      fullName: user.fullName,
      email: user.email,
      joinedMeetingOn: payload.joinedMeetingOn,
      meetingStartsAt: meeting.startsAt,
      meetingTitle: meeting.title,
      isOrganizer: !!payload.isOrganizer,
    }).unwrap();

    try {
      await this.attendeeRepo.save(attendee);
      return Ok(undefined);
    } catch (error) {
      return Err(UnexpectedError.wrap(error));
    }
  }
}
