import { Err, Ok, Result } from '@hqoss/monads';
import { UseCase } from '@src/shared/core/useCase';
import { UserName } from '@users/domain/UserName';
import { Attendee } from '@meetings/domain/Attendee';
import { UnexpectedError, ValidationError } from '@src/shared/core/AppError';
import { UniqueID } from '@src/shared/domain/uniqueId';
import { MeetingID } from '@meetings/domain/MeetingID';
import { AttendeeRepo } from '@meetings/repos/AttendeeRepo';
import { AttendeeNotFoundError } from '@meetings/errors/AttendeeErrors';
import { GetAttendanceRequest } from './GetAttendanceRequest';
import { GetAttendanceResponse } from './GetAttendanceResponse';

type Response = Result<
  GetAttendanceResponse,
  AttendeeNotFoundError | ValidationError | UnexpectedError
>;

export class GetAttendanceUseCase implements UseCase<GetAttendanceRequest, Promise<Response>> {
  private attendeeRepo: AttendeeRepo;

  constructor(attendeeRepo: AttendeeRepo) {
    this.attendeeRepo = attendeeRepo;
  }

  async execute(request: GetAttendanceRequest): Promise<Response> {
    const meetingID = MeetingID.create(new UniqueID(request.meetingID));

    const userNameOrError = await UserName.create(request.attendeeUserName);
    if (userNameOrError.isErr()) return Err(userNameOrError.unwrapErr());

    let attendee: Attendee;
    try {
      [attendee] = await this.attendeeRepo.fetch(userNameOrError.unwrap(), meetingID);
    } catch (error) {
      switch (error.type) {
        case AttendeeNotFoundError.type:
          return Err<never, AttendeeNotFoundError>(error);

        default:
          return Err(UnexpectedError.wrap(error));
      }
    }

    return Ok({
      joinedMeetingOn: attendee.joinedMeetingOn,
      isOrganizer: attendee.isOrganizer,
    });
  }
}
