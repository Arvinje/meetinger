import SQSClient from 'aws-sdk/clients/sqs';
import { UnexpectedError } from '@src/shared/core/AppError';
import { JobQueue } from './JobQueue';

interface SQSQueueURLs {
  EmailsToSend: string;
}

const Queues: SQSQueueURLs = {
  EmailsToSend: process.env.EMAILS_TO_SEND_SQS_QUEUE_URL,
};

interface Config {
  Client: SQSClient;
  Queues: SQSQueueURLs;
}

export const SQSConfig: Config = {
  Client: new SQSClient(),
  Queues,
};

export class SQSJobQueue implements JobQueue {
  private client: SQSClient;

  private queues: SQSQueueURLs;

  constructor(config: Config) {
    this.client = config.Client;
    this.queues = config.Queues;
  }

  async send(queue: string, payload: string): Promise<void> {
    try {
      await this.client
        .sendMessage({
          QueueUrl: this.queues[queue],
          MessageBody: payload,
        })
        .promise();
    } catch (error) {
      throw UnexpectedError.wrap(
        error,
        `failed to publish message to queue#${this.queues.EmailsToSend}`
      );
    }
  }
}
