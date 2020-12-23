import dayjs from 'dayjs';
import { Err, Ok, Result } from '@hqoss/monads';
import { UseCase } from '@src/shared/core/useCase';
import { UserName } from '@users/domain/UserName';
import { MeetingRepo } from '@meetings/repos/MeetingRepo';
import { MeetingTitle } from '@meetings/domain/MeetingTitle';
import { MeetingDescription } from '@meetings/domain/MeetingDescription';
import { Meeting } from '@meetings/domain/Meeting';
import { ForbiddenError, UnexpectedError, ValidationError } from '@src/shared/core/AppError';
import { MeetingCategory } from '@meetings/domain/MeetingCategory';
import { MeetingAddress } from '@meetings/domain/MeetingAddress';
import { UniqueID } from '@src/shared/domain/uniqueId';
import { MeetingID } from '@meetings/domain/MeetingID';
import {
  MeetingAlreadyStarted,
  MeetingNotFoundError,
  MeetingStartingDateInvalid,
  RemoteMeetingCannotHaveAddress,
} from '@meetings/errors/MeetingErrors';
import { EditMeetingRequest } from './EditMeetingRequest';

type Response = Result<
  void,
  | MeetingNotFoundError
  | MeetingAlreadyStarted
  | MeetingStartingDateInvalid
  | RemoteMeetingCannotHaveAddress
  | ForbiddenError
  | ValidationError
  | UnexpectedError
>;

export class EditMeetingUseCase implements UseCase<EditMeetingRequest, Promise<Response>> {
  private meetingRepo: MeetingRepo;

  constructor(meetingRepo: MeetingRepo) {
    this.meetingRepo = meetingRepo;
  }

  async execute(request: EditMeetingRequest): Promise<Response> {
    const meetingID = MeetingID.create(new UniqueID(request.id));

    let meeting: Meeting;
    let meetingVersion: number;
    try {
      [meeting, meetingVersion] = await this.meetingRepo.fetchMeetingByID(meetingID);
    } catch (error) {
      if (error instanceof MeetingNotFoundError) return Err(error);
      return Err(UnexpectedError.wrap(error));
    }

    const organizerOrError = await UserName.create(request.organizer);
    if (organizerOrError.isErr()) return Err(organizerOrError.unwrapErr());

    if (!meeting.createdBy.equals(organizerOrError.unwrap()))
      return Err(ForbiddenError.create(`Only the organizer can edit the meeting`));

    if (request.title) {
      const titleOrError = await MeetingTitle.create(request.title);
      if (titleOrError.isErr()) return Err(titleOrError.unwrapErr());
      const res = meeting.setTitle(titleOrError.unwrap());
      if (res.isErr()) return Err(res.unwrapErr());
    }

    if (request.description) {
      const descOrError = await MeetingDescription.create(request.description);
      if (descOrError.isErr()) return Err(descOrError.unwrapErr());
      const res = meeting.setDescription(descOrError.unwrap());
      if (res.isErr()) return Err(res.unwrapErr());
    }

    if (request.category) {
      const categoryOrError = await MeetingCategory.create(request.category);
      if (categoryOrError.isErr()) return Err(categoryOrError.unwrapErr());
      const res = meeting.setCategory(categoryOrError.unwrap());
      if (res.isErr()) return Err(res.unwrapErr());
    }

    if (request.startsAt) {
      const startsAt = dayjs(request.startsAt);
      if (!startsAt.isValid())
        return Err(ValidationError.create('Meeting start time is not valid'));
      const res = meeting.setStartsAt(startsAt.toDate());
      if (res.isErr()) return Err(res.unwrapErr());
    }

    if (request.address) {
      const addressOrError = await MeetingAddress.create(request.address);
      if (addressOrError.isErr()) return Err(addressOrError.unwrapErr());
      const res = meeting.setAddress(addressOrError.unwrap());
      if (res.isErr()) return Err(res.unwrapErr());
    }

    try {
      await this.meetingRepo.save(meeting, meetingVersion);
      return Ok(undefined);
    } catch (error) {
      return Err(UnexpectedError.wrap(error));
    }
  }
}
