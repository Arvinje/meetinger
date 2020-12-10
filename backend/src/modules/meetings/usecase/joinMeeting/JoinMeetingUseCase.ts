import { Err, Ok, Result } from '@hqoss/monads';
import { UseCase } from '@src/shared/core/useCase';
import { UnexpectedError, ValidationError } from '@src/shared/core/AppError';
import { UniqueID } from '@src/shared/domain/uniqueId';
import { UserRepo } from '@users/repos/UserRepo';
import { UserName } from '@users/domain/UserName';
import { MeetingRepo } from '@meetings/repos/MeetingRepo';
import { Meeting } from '@meetings/domain/Meeting';
import { Attendee } from '@meetings/domain/Attendee';
import { User } from '@users/domain/User';
import { MeetingID } from '@meetings/domain/MeetingID';
import { AttendeeRepo } from '@meetings/repos/AttendeeRepo';
import { MeetingNotFoundError, MeetingFullyBooked } from '@meetings/errors/MeetingErrors';
import { MeetingRemainingSeats } from '@meetings/domain/MeetingRemainingSeats';
import { JoinMeetingRequest } from './JoinMeetingRequest';

type Response = Result<
  void,
  MeetingNotFoundError | MeetingFullyBooked | ValidationError | UnexpectedError
>;

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
    let meetingVersion: number;
    try {
      [meeting, meetingVersion] = await this.meetingRepo.fetchMeetingByID(meetingID);
    } catch (error) {
      if (error instanceof MeetingNotFoundError) return Err(error);
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
      meetingStartsAt: meeting.startsAt,
      meetingTitle: meeting.title,
    }).unwrap();

    const remainingSeatsOrError = await MeetingRemainingSeats.create(
      meeting.remainingSeats.value - 1
    );
    if (remainingSeatsOrError.isErr()) return Err(MeetingFullyBooked.create());

    const remainingSeatsUpdated = meeting.updateRemainingSeats(remainingSeatsOrError.unwrap());
    if (remainingSeatsUpdated.isErr()) return Err(remainingSeatsUpdated.unwrapErr());

    try {
      await this.meetingRepo.save(meeting, meetingVersion);
    } catch (error) {
      return Err(UnexpectedError.wrap(error));
    }

    try {
      return Ok(await this.attendeeRepo.save(attendee));
    } catch (error) {
      return Err(UnexpectedError.wrap(error));
    }
  }
}
