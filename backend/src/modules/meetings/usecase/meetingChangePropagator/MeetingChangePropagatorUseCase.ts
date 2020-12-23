import { Err, Ok, Result } from '@hqoss/monads';
import { UseCase } from '@src/shared/core/useCase';
import { UnexpectedError } from '@src/shared/core/AppError';
import { UniqueID } from '@src/shared/domain/uniqueId';
import { MeetingRepo } from '@meetings/repos/MeetingRepo';
import { MeetingID } from '@meetings/domain/MeetingID';
import { Meeting } from '@meetings/domain/Meeting';
import { AttendeeRepo } from '@meetings/repos/AttendeeRepo';
import { MeetingChangedEvent } from '@meetings/integrationEvents/MeetingChangedEvent';
import { UserName } from '@users/domain/UserName';
import { MeetingTitle } from '@meetings/domain/MeetingTitle';
import { Attendee } from '@meetings/domain/Attendee';
import { AttendeeErrors } from '@meetings/errors/AttendeeErrors';

type Response = Result<void, UnexpectedError>;

export class MeetingChangePropagatorUseCase
  implements UseCase<MeetingChangedEvent, Promise<Response>> {
  private meetingRepo: MeetingRepo;

  private attendeeRepo: AttendeeRepo;

  constructor(meetingRepo: MeetingRepo, attendeeRepo: AttendeeRepo) {
    this.meetingRepo = meetingRepo;
    this.attendeeRepo = attendeeRepo;
  }

  async execute(payload: MeetingChangedEvent): Promise<Response> {
    const meetingID = MeetingID.create(new UniqueID(payload.id));

    let meeting: Meeting;
    try {
      [meeting] = await this.meetingRepo.fetchMeetingByID(meetingID);
    } catch (error) {
      return Err(UnexpectedError.wrap(error));
    }

    const promises = meeting.attendees.value.map((username: UserName) =>
      this.applyToAttendee(username, meetingID, meeting.title, meeting.startsAt)
    );

    try {
      await Promise.all(promises);
      return Ok(undefined);
    } catch (error) {
      return Err(UnexpectedError.wrap(error));
    }
  }

  private async applyToAttendee(
    username: UserName,
    meetingID: MeetingID,
    title: MeetingTitle,
    startsAt: Date
  ): Promise<void> {
    let attendee: Attendee;
    let version: number;
    try {
      [attendee, version] = await this.attendeeRepo.fetch(username, meetingID);
    } catch (error) {
      switch (error.type) {
        case AttendeeErrors.AttendeeNotFoundError:
          return;

        default:
          throw UnexpectedError.wrap(
            error,
            `Failed to fetch attendee(${username.value}) for meeting(${meetingID.id})`
          );
      }
    }

    attendee.setMeetingTitle(title);
    attendee.setMeetingStartsAt(startsAt);

    try {
      await this.attendeeRepo.save(attendee, version);
    } catch (error) {
      throw UnexpectedError.wrap(
        error,
        `Failed to persist attendee(${username.value}) for meeting(${meetingID.id})`
      );
    }
  }
}
