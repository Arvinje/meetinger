import moment from 'moment';
import { Err, Ok, Result } from '@hqoss/monads';
import { UseCase } from '@src/shared/core/useCase';
import { UserRepo } from '@users/repos/UserRepo';
import { UserName } from '@users/domain/UserName';
import { MeetingRepo } from '@meetings/repos/MeetingRepo';
import { MeetingTitle } from '@meetings/domain/MeetingTitle';
import { MeetingDescription } from '@meetings/domain/MeetingDescription';
import { Meeting } from '@meetings/domain/Meeting';
import { Attendee } from '@meetings/domain/Attendee';
import { UnexpectedError, ValidationError } from '@src/shared/core/AppError';
import { MeetingAvailableSeats } from '@meetings/domain/MeetingAvailableSeats';
import { User } from '@users/domain/User';
import { MeetingLocation } from '@meetings/domain/MeetingLocation';
import { MeetingCategory } from '@meetings/domain/MeetingCategory';
import { AttendeeRepo } from '@meetings/repos/AttendeeRepo';
import { CreateMeetingResponse } from './CreateMeetingResponse';
import { CreateMeetingRequest } from './CreateMeetingRequest';

type Response = Result<CreateMeetingResponse, ValidationError | UnexpectedError>;

export class CreateMeetingUseCase implements UseCase<CreateMeetingRequest, Promise<Response>> {
  private meetingRepo: MeetingRepo;

  private userRepo: UserRepo;

  private attendeeRepo: AttendeeRepo;

  constructor(userRepo: UserRepo, meetingRepo: MeetingRepo, attendeeRepo: AttendeeRepo) {
    this.userRepo = userRepo;
    this.meetingRepo = meetingRepo;
    this.attendeeRepo = attendeeRepo;
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

    const startsAtOrError = moment(request.startsAt);
    if (!startsAtOrError.isValid())
      return Err(ValidationError.create('Meeting start time is not valid'));

    const locationOrError = await MeetingLocation.create(request.location);
    if (locationOrError.isErr()) return Err(locationOrError.unwrapErr());

    const availableSeatsOrError = await MeetingAvailableSeats.create(request.availableSeats);
    if (availableSeatsOrError.isErr()) {
      return Err(ValidationError.create('Count of available seats is not valid'));
    }

    const meeting = (
      await Meeting.create({
        title: titleOrError.unwrap(),
        description: descOrError.unwrap(),
        category: categoryOrError.unwrap(),
        startsAt: startsAtOrError.toDate(),
        location: locationOrError.unwrap(),
        createdBy: organizerOrError.unwrap(),
        availableSeats: availableSeatsOrError.unwrap(),
      })
    ).unwrap();

    let organizer: User;
    try {
      [organizer] = await Promise.all<User, void>([
        this.userRepo.findByUserName(organizerOrError.unwrap()),
        this.meetingRepo.save(meeting),
      ]);
    } catch (error) {
      return Err(UnexpectedError.wrap(error));
    }

    const organizerAsAttendee = Attendee.create({
      username: organizer.username,
      fullName: organizer.fullName,
      meetingID: meeting.id,
      joinedMeetingOn: new Date(),
      meetingStartsAt: meeting.startsAt,
      meetingTitle: meeting.title,
      isOrganizer: true,
    }).unwrap();

    try {
      await this.attendeeRepo.save(organizerAsAttendee);
      return Ok<CreateMeetingResponse>({
        id: meeting.id.id.toString(),
      });
    } catch (error) {
      return Err(UnexpectedError.wrap(error));
    }
  }
}
