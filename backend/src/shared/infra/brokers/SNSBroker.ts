import SNSClient from 'aws-sdk/clients/sns';
import { UnexpectedError } from '@src/shared/core/AppError';
import { MessageBroker } from './MessageBroker';

interface SNSTopics {
  MeetingCreated: string;
  AttendeeJoined: string;
  AttendeeLeft: string;
}

const Topics: SNSTopics = {
  MeetingCreated: process.env.EVENT_MEETING_CREATED_ARN,
  AttendeeJoined: process.env.EVENT_ATTENDEE_JOINED_ARN,
  AttendeeLeft: process.env.EVENT_ATTENDEE_LEFT_ARN,
};

interface Config {
  Client: SNSClient;
  Topics: SNSTopics;
}

export const SNSConfig: Config = {
  Client: new SNSClient(),
  Topics,
};

export class SNSBroker implements MessageBroker {
  private client: SNSClient;

  private topics: SNSTopics;

  constructor(config: Config) {
    this.client = config.Client;
    this.topics = config.Topics;
  }

  async publish(topic: string, payload: unknown): Promise<void> {
    try {
      await this.client
        .publish({
          Message: JSON.stringify(payload),
          TopicArn: this.topics[topic],
        })
        .promise();
    } catch (error) {
      throw UnexpectedError.wrap(
        error,
        `failed to publish message to topic#${this.topics.MeetingCreated}`
      );
    }
  }
}
