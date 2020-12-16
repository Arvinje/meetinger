import { SNSEvent } from 'aws-lambda';
import { AttendeeJoinedEvent } from '@meetings/integrationEvents/AttendeeJoinedEvent';
import { PersistAttendeeUseCase } from './PersistAttendeeUseCase';

export class PersistAttendeeController {
  private useCase: PersistAttendeeUseCase;

  constructor(useCase: PersistAttendeeUseCase) {
    this.useCase = useCase;
  }

  async execute(event: SNSEvent): Promise<void> {
    const payload: AttendeeJoinedEvent = JSON.parse(
      event.Records[0].Sns.Message
    ) as AttendeeJoinedEvent;

    payload.joinedMeetingOn = new Date(payload.joinedMeetingOn);

    await this.useCase.execute({
      ...payload,
      joinedMeetingOn: new Date(payload.joinedMeetingOn),
    });
  }
}
