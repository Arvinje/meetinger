import moment from 'moment';
import { Err, Ok } from '@hqoss/monads';
import { UseCase } from '@src/shared/core/useCase';
import { ValidationError, DynamoDBError, InternalError } from '@src/utils/errors';
import { UserRepo } from '@src/modules/users/repos/UserRepo';
import { UserName } from '@src/modules/users/domain/UserName';
import { MeetingRepo } from '@meetings/repos/MeetingRepo';
import { MeetingTitle } from '@meetings/domain/MeetingTitle';
import { MeetingDescription } from '@meetings/domain/MeetingDescription';
import { Meeting } from '@meetings/domain/Meeting';
import { Attendee } from '@meetings/domain/Attendee';
import { Response } from './CreateMeetingResponse';
import { CreateMeetingRequest } from './CreateMeetingRequest';

export class CreateMeetingUseCase implements UseCase<CreateMeetingRequest, Promise<Response>> {
  private meetingRepo: MeetingRepo;

  private userRepo: UserRepo;

  constructor(userRepo: UserRepo, meetingRepo: MeetingRepo) {
    this.userRepo = userRepo;
    this.meetingRepo = meetingRepo;
  }

  async execute(request: CreateMeetingRequest): Promise<Response> {
    const titleOrError = await MeetingTitle.create(request.title);
    if (titleOrError.isErr()) return Err(titleOrError.unwrapErr());

    const organizerOrError = await UserName.create(request.organizer);
    if (organizerOrError.isErr()) return Err(organizerOrError.unwrapErr());

    const descOrError = await MeetingDescription.create(request.description);
    if (descOrError.isErr()) return Err(descOrError.unwrapErr());

    const startsAtOrError = moment(request.startsAt);
    if (!startsAtOrError.isValid()) return Err(new ValidationError('startsAt is not valid'));

    const meeting = Meeting.create({
      title: titleOrError.unwrap(),
      organizer: organizerOrError.unwrap(),
      description: descOrError.unwrap(),
      startsAt: startsAtOrError.toDate(),
    }).unwrap();

    try {
      const organizer = await this.userRepo.find(organizerOrError.unwrap());
      const organizerAsAttendee = Attendee.create({
        username: organizer.username,
        fullName: organizer.fullName,
        meetingID: meeting.id,
        joinedMeetingOn: new Date(),
      }).unwrap();

      meeting.addAttendee(organizerAsAttendee);

      await this.meetingRepo.create(meeting);
      return Ok({
        id: meeting.id.id.toString(),
      });
    } catch (error) {
      if (error instanceof DynamoDBError) return Err(error);
      return Err(new InternalError(error, 'unknown error detected'));
    }
  }
}
