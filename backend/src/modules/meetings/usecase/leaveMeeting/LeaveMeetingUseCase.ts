import { Err, Ok, Result } from '@hqoss/monads';
import { UseCase } from '@src/shared/core/useCase';
import { UserName } from '@users/domain/UserName';
import { MeetingRepo } from '@meetings/repos/MeetingRepo';
import { Meeting } from '@meetings/domain/Meeting';
import { Attendee } from '@meetings/domain/Attendee';
import { UnexpectedError, ValidationError } from '@src/shared/core/AppError';
import { UniqueID } from '@src/shared/domain/uniqueId';
import { MeetingID } from '@meetings/domain/MeetingID';
import { AttendeeRepo } from '@meetings/repos/AttendeeRepo';
import { MeetingErrors, MeetingNotFoundError } from '@meetings/errors/MeetingErrors';
import { AttendeeErrors, AttendeeNotFoundError } from '@meetings/errors/AttendeeErrors';
import { LeaveMeetingRequest } from './LeaveMeetingRequest';
import { OrganizerCannotLeaveError } from './LeaveMeetingErrors';

type Response = Result<
  void,
  | MeetingNotFoundError
  | AttendeeNotFoundError
  | OrganizerCannotLeaveError
  | ValidationError
  | UnexpectedError
>;

export class LeaveMeetingUseCase implements UseCase<LeaveMeetingRequest, Promise<Response>> {
  private meetingRepo: MeetingRepo;

  private attendeeRepo: AttendeeRepo;

  constructor(meetingRepo: MeetingRepo, attendeeRepo: AttendeeRepo) {
    this.meetingRepo = meetingRepo;
    this.attendeeRepo = attendeeRepo;
  }

  async execute(request: LeaveMeetingRequest): Promise<Response> {
    const meetingID = MeetingID.create(new UniqueID(request.meetingID));

    const userNameOrError = await UserName.create(request.attendeeUserName);
    if (userNameOrError.isErr()) return Err(userNameOrError.unwrapErr());

    let attendee: Attendee;
    let meeting: Meeting;
    let meetingVersion: number;
    try {
      [[attendee], [meeting, meetingVersion]] = await Promise.all<
        [Attendee, number],
        [Meeting, number]
      >([
        this.attendeeRepo.fetch(userNameOrError.unwrap(), meetingID),
        this.meetingRepo.fetchMeetingByID(meetingID),
      ]);
    } catch (error) {
      switch (error.type) {
        case AttendeeErrors.AttendeeNotFoundError:
        case MeetingErrors.MeetingNotFoundError:
          return Err<never, MeetingNotFoundError | AttendeeNotFoundError>(error);

        default:
          return Err(UnexpectedError.wrap(error));
      }
    }

    if (attendee.isOrganizer) return Err(OrganizerCannotLeaveError.create());

    const leaveOrError = await meeting.removeAttendee(attendee.username);
    if (leaveOrError.isErr()) return Err(leaveOrError.unwrapErr());

    try {
      await this.meetingRepo.save(meeting, meetingVersion);
      return Ok(undefined);
    } catch (error) {
      return Err(UnexpectedError.wrap(error));
    }
  }
}
