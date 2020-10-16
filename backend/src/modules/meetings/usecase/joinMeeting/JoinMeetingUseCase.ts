import { Err, Ok, Result } from '@hqoss/monads';
import { UseCase } from '@src/shared/core/useCase';
import { UserRepo } from '@src/modules/users/repos/UserRepo';
import { UserName } from '@src/modules/users/domain/UserName';
import { MeetingRepo } from '@meetings/repos/MeetingRepo';
import { Meeting } from '@meetings/domain/Meeting';
import { Attendee } from '@meetings/domain/Attendee';
import { UnexpectedError, ValidationError } from '@src/shared/core/AppError';
import { UniqueID } from '@src/shared/domain/uniqueId';
import { User } from '@src/modules/users/domain/User';
import { MeetingID } from '@meetings/domain/MeetingID';
import { AttendeeRepo } from '@meetings/repos/AttendeeRepo';
import { JoinMeetingRequest } from './JoinMeetingRequest';

type Response = Result<void, ValidationError | UnexpectedError>;

export class JoinMeetingUseCase implements UseCase<JoinMeetingRequest, Promise<Response>> {
  private meetingRepo: MeetingRepo;

  private attendeeRepo: AttendeeRepo;

  private userRepo: UserRepo;

  constructor(meetingRepo: MeetingRepo, attendeeRepo: AttendeeRepo, userRepo: UserRepo) {
    this.meetingRepo = meetingRepo;
    this.attendeeRepo = attendeeRepo;
    this.userRepo = userRepo;
  }

  async execute(request: JoinMeetingRequest): Promise<Response> {
    const meetingID = MeetingID.create(new UniqueID(request.meetingID));

    const userNameOrError = await UserName.create(request.attendeeUserName);
    if (userNameOrError.isErr()) return Err(userNameOrError.unwrapErr());

    try {
      const attendeeAlreadyExists = await this.attendeeRepo.exists(
        userNameOrError.unwrap(),
        meetingID
      );
      if (attendeeAlreadyExists) return Ok(undefined);
    } catch (error) {
      return Err(UnexpectedError.wrap(error));
    }

    let meeting: Meeting;
    try {
      meeting = await this.meetingRepo.fetchMeetingByID(meetingID);
    } catch (error) {
      return Err(UnexpectedError.wrap(error));
    }

    let user: User;
    try {
      user = await this.userRepo.findByUserName(userNameOrError.unwrap());
    } catch (error) {
      return Err(UnexpectedError.wrap(error));
    }

    const attendee = Attendee.create({
      username: user.username,
      fullName: user.fullName,
      meetingID: meeting.id,
      joinedMeetingOn: new Date(),
    }).unwrap();

    meeting.addAttendee(attendee);

    try {
      return Ok(await this.meetingRepo.updateAttendees(meeting));
    } catch (error) {
      return Err(UnexpectedError.wrap(error));
    }
  }
}
