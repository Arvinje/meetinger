import { Err, Ok, Result } from '@hqoss/monads';
import { UseCase } from '@src/shared/core/useCase';
import { UnexpectedError } from '@src/shared/core/AppError';
import { UniqueID } from '@src/shared/domain/uniqueId';
import { MeetingRepo } from '@meetings/repos/MeetingRepo';
import { MeetingID } from '@meetings/domain/MeetingID';
import { MeetingViewDTO } from '@meetings/dtos/MeetingViewDTO';
import { MeetingNotFoundError } from '@meetings/errors/MeetingErrors';
import { Meeting } from '@meetings/domain/Meeting';
import { AttendeeDetails } from '@meetings/domain/AttendeeDetails';
import { AttendeeRepo } from '@meetings/repos/AttendeeRepo';
import { AttendeeDetailsMap } from '@meetings/mappers/AttendeeDetailsMap';
import { GetMeetingRequest } from './GetMeetingRequest';

type Response = Result<MeetingViewDTO, MeetingNotFoundError | UnexpectedError>;

export class GetMeetingUseCase implements UseCase<GetMeetingRequest, Promise<Response>> {
  private meetingRepo: MeetingRepo;

  private attendeeRepo: AttendeeRepo;

  constructor(meetingRepo: MeetingRepo, attendeeRepo: AttendeeRepo) {
    this.meetingRepo = meetingRepo;
    this.attendeeRepo = attendeeRepo;
  }

  async execute(request: GetMeetingRequest): Promise<Response> {
    const meetingID = MeetingID.create(new UniqueID(request.meetingID));

    let meeting: Meeting;
    let attendees: AttendeeDetails[];
    try {
      [[meeting], attendees] = await Promise.all<[Meeting, number], AttendeeDetails[]>([
        this.meetingRepo.fetchMeetingByID(meetingID),
        this.attendeeRepo.fetchAllByMeetingID(meetingID),
      ]);
    } catch (error) {
      if (error instanceof MeetingNotFoundError) return Err(error);
      return Err(UnexpectedError.wrap(error));
    }

    const meetingView: MeetingViewDTO = {
      id: meeting.id.id.toString(),
      title: meeting.title.value,
      description: meeting.description.value,
      category: meeting.category.value,
      startsAt: meeting.startsAt.toISOString(),
      location: meeting.location.value,
      remainingSeats: meeting.remainingSeats.value,
      availableSeats: meeting.availableSeats.value,
      createdBy: meeting.createdBy.value,
      attendees: attendees.map((item) => AttendeeDetailsMap.toDTO(item)),
    };
    return Ok(meetingView);
  }
}
