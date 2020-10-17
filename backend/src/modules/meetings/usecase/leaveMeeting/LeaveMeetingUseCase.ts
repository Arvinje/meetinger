import { Err, Ok, Result } from '@hqoss/monads';
import { UseCase } from '@src/shared/core/useCase';
import { UserName } from '@src/modules/users/domain/UserName';
import { MeetingRepo } from '@meetings/repos/MeetingRepo';
import { Meeting } from '@meetings/domain/Meeting';
import { Attendee } from '@meetings/domain/Attendee';
import { UnexpectedError, ValidationError } from '@src/shared/core/AppError';
import { UniqueID } from '@src/shared/domain/uniqueId';
import { MeetingID } from '@meetings/domain/MeetingID';
import { AttendeeRepo } from '@meetings/repos/AttendeeRepo';
import { MeetingNotFoundError } from '@meetings/errors/MeetingErrors';
import { AttendeeNotFoundError } from '@meetings/errors/AttendeeErrors';
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
    try {
      [attendee, meeting] = await Promise.all<Attendee, Meeting>([
        this.attendeeRepo.fetch(userNameOrError.unwrap(), meetingID),
        this.meetingRepo.fetchMeetingByID(meetingID),
      ]);
    } catch (error) {
      switch (error.type) {
        case AttendeeNotFoundError.type:
        case MeetingNotFoundError.type:
          return Err<never, MeetingNotFoundError | AttendeeNotFoundError>(error);

        default:
          return Err(UnexpectedError.wrap(error));
      }
    }

    if (attendee.isOrganizer) return Err(OrganizerCannotLeaveError.create());

    meeting.removeAttendee(attendee);

    try {
      return Ok(await this.meetingRepo.updateAttendees(meeting));
    } catch (error) {
      return Err(UnexpectedError.wrap(error));
    }
  }
}
