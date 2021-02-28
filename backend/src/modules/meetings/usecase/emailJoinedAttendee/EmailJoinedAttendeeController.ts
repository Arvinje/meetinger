import { SNSEvent } from 'aws-lambda';
import { AttendeeJoinedEvent } from '@meetings/integrationEvents/AttendeeJoinedEvent';
import { EmailJoinedAttendeeUseCase } from './EmailJoinedAttendeeUseCase';

export class EmailJoinedAttendeeController {
  private useCase: EmailJoinedAttendeeUseCase;

  constructor(useCase: EmailJoinedAttendeeUseCase) {
    this.useCase = useCase;
  }

  async execute(event: SNSEvent): Promise<void> {
    const payload: AttendeeJoinedEvent = JSON.parse(
      event.Records[0].Sns.Message
    ) as AttendeeJoinedEvent;

    await this.useCase.execute(payload);
  }
}
