import { Err, Ok, Result } from '@hqoss/monads';
import { UseCase } from '@src/shared/core/useCase';
import { UnexpectedError, ValidationError } from '@src/shared/core/AppError';
import { UniqueID } from '@src/shared/domain/uniqueId';
import { UserName } from '@users/domain/UserName';
import { MeetingRepo } from '@meetings/repos/MeetingRepo';
import { Meeting } from '@meetings/domain/Meeting';
import { MeetingID } from '@meetings/domain/MeetingID';
import { AttendeeRepo } from '@meetings/repos/AttendeeRepo';
import { MeetingNotFoundError, MeetingFullyBooked } from '@meetings/errors/MeetingErrors';
import { JoinMeetingRequest } from './JoinMeetingRequest';

type Response = Result<
  void,
  MeetingNotFoundError | MeetingFullyBooked | ValidationError | UnexpectedError
>;

export class JoinMeetingUseCase implements UseCase<JoinMeetingRequest, Promise<Response>> {
  private meetingRepo: MeetingRepo;

  private attendeeRepo: AttendeeRepo;

  constructor(meetingRepo: MeetingRepo, attendeeRepo: AttendeeRepo) {
    this.meetingRepo = meetingRepo;
    this.attendeeRepo = attendeeRepo;
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

    const addedOrError = await meeting.addAttendee(userNameOrError.unwrap());
    if (addedOrError.isErr()) return Err(addedOrError.unwrapErr());

    try {
      await this.meetingRepo.save(meeting, meetingVersion);
      return Ok(undefined);
    } catch (error) {
      return Err(UnexpectedError.wrap(error));
    }
  }
}
