import { SNSEvent } from 'aws-lambda';
import { AttendeeLeftEvent } from '@meetings/integrationEvents/AttendeeLeftEvent';
import { RemoveAttendeeUseCase } from './RemoveAttendeeUseCase';

export class RemoveAttendeeController {
  private useCase: RemoveAttendeeUseCase;

  constructor(useCase: RemoveAttendeeUseCase) {
    this.useCase = useCase;
  }

  async execute(event: SNSEvent): Promise<void> {
    const payload: AttendeeLeftEvent = JSON.parse(
      event.Records[0].Sns.Message
    ) as AttendeeLeftEvent;

    await this.useCase.execute(payload);
  }
}
