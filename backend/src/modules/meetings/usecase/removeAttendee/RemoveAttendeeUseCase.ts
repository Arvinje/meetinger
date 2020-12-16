import { Err, Ok, Result } from '@hqoss/monads';
import { UseCase } from '@src/shared/core/useCase';
import { UnexpectedError } from '@src/shared/core/AppError';
import { UniqueID } from '@src/shared/domain/uniqueId';
import { MeetingID } from '@meetings/domain/MeetingID';
import { AttendeeRepo } from '@meetings/repos/AttendeeRepo';
import { UserName } from '@users/domain/UserName';
import { AttendeeLeftEvent } from '@meetings/integrationEvents/AttendeeLeftEvent';

type Response = Result<void, UnexpectedError>;

export class RemoveAttendeeUseCase implements UseCase<AttendeeLeftEvent, Promise<Response>> {
  private attendeeRepo: AttendeeRepo;

  constructor(attendeeRepo: AttendeeRepo) {
    this.attendeeRepo = attendeeRepo;
  }

  async execute(payload: AttendeeLeftEvent): Promise<Response> {
    const username = (await UserName.create(payload.username)).unwrap();
    const meetingID = MeetingID.create(new UniqueID(payload.meetingID));

    try {
      await this.attendeeRepo.remove(username, meetingID);
      return Ok(undefined);
    } catch (error) {
      return Err(UnexpectedError.wrap(error));
    }
  }
}
