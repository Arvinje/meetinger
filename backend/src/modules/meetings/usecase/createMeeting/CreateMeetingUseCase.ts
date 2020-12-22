import dayjs from 'dayjs';
import { Err, Ok, Result } from '@hqoss/monads';
import { UseCase } from '@src/shared/core/useCase';
import { UserName } from '@users/domain/UserName';
import { MeetingRepo } from '@meetings/repos/MeetingRepo';
import { MeetingTitle } from '@meetings/domain/MeetingTitle';
import { MeetingDescription } from '@meetings/domain/MeetingDescription';
import { Meeting } from '@meetings/domain/Meeting';
import { UnexpectedError, ValidationError } from '@src/shared/core/AppError';
import { MeetingAvailableSeats } from '@meetings/domain/MeetingAvailableSeats';
import { MeetingPlace } from '@meetings/domain/MeetingPlace';
import { MeetingCategory } from '@meetings/domain/MeetingCategory';
import { MeetingAddress } from '@meetings/domain/MeetingAddress';
import { CreateMeetingResponse } from './CreateMeetingResponse';
import { CreateMeetingRequest } from './CreateMeetingRequest';

type Response = Result<CreateMeetingResponse, ValidationError | UnexpectedError>;

export class CreateMeetingUseCase implements UseCase<CreateMeetingRequest, Promise<Response>> {
  private meetingRepo: MeetingRepo;

  constructor(meetingRepo: MeetingRepo) {
    this.meetingRepo = meetingRepo;
  }

  async execute(request: CreateMeetingRequest): Promise<Response> {
    const titleOrError = await MeetingTitle.create(request.title);
    if (titleOrError.isErr()) return Err(titleOrError.unwrapErr());

    const organizerOrError = await UserName.create(request.organizer);
    if (organizerOrError.isErr()) return Err(organizerOrError.unwrapErr());

    const descOrError = await MeetingDescription.create(request.description);
    if (descOrError.isErr()) return Err(descOrError.unwrapErr());

    const categoryOrError = await MeetingCategory.create(request.category);
    if (categoryOrError.isErr()) return Err(categoryOrError.unwrapErr());

    const startsAt = dayjs(request.startsAt);
    if (!startsAt.isValid()) return Err(ValidationError.create('Meeting start time is not valid'));

    const placeOrError = await MeetingPlace.create(request.place);
    if (placeOrError.isErr()) return Err(placeOrError.unwrapErr());

    let address: MeetingAddress;
    if (request.address) {
      const addressOrError = await MeetingAddress.create(request.address);
      if (addressOrError.isErr()) return Err(addressOrError.unwrapErr());
      address = addressOrError.unwrap();
    }

    const availableSeatsOrError = await MeetingAvailableSeats.create(request.availableSeats);
    if (availableSeatsOrError.isErr()) {
      return Err(ValidationError.create('Count of available seats is not valid'));
    }

    const meetingOrError = await Meeting.create({
      title: titleOrError.unwrap(),
      description: descOrError.unwrap(),
      category: categoryOrError.unwrap(),
      startsAt: startsAt.toDate(),
      place: placeOrError.unwrap(),
      address,
      createdBy: organizerOrError.unwrap(),
      availableSeats: availableSeatsOrError.unwrap(),
    });
    if (meetingOrError.isErr()) return Err(meetingOrError.unwrapErr());
    const meeting = meetingOrError.unwrap();

    try {
      await this.meetingRepo.save(meeting);
      return Ok<CreateMeetingResponse>({
        id: meeting.id.id.toString(),
      });
    } catch (error) {
      return Err(UnexpectedError.wrap(error));
    }
  }
}
