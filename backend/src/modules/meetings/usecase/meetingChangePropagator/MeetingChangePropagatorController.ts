import { SNSEvent } from 'aws-lambda';
import { MeetingChangedEvent } from '@meetings/integrationEvents/MeetingChangedEvent';
import { MeetingChangePropagatorUseCase } from './MeetingChangePropagatorUseCase';

export class MeetingChangePropagatorController {
  private useCase: MeetingChangePropagatorUseCase;

  constructor(useCase: MeetingChangePropagatorUseCase) {
    this.useCase = useCase;
  }

  async execute(event: SNSEvent): Promise<void> {
    const payload: MeetingChangedEvent = JSON.parse(
      event.Records[0].Sns.Message
    ) as MeetingChangedEvent;

    await this.useCase.execute(payload);
  }
}
