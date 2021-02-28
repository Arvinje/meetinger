import { UserEmail } from '@users/domain/UserEmail';
import { UnexpectedError } from '@src/shared/core/AppError';
import SESClient, { SendTemplatedEmailRequest } from 'aws-sdk/clients/ses';
import { EmailService } from './EmailService';

interface EmailTemplates {
  AttendeeJoined: string;
}

export const Templates: EmailTemplates = {
  AttendeeJoined: process.env.ATTENDEE_JOINED_SES_TEMPLATE,
};

interface Config {
  Client: SESClient;
  Source: string;
  Templates: EmailTemplates;
}

export const SESConfig: Config = {
  Client: new SESClient(),
  Source: process.env.SOURCE_EMAIL_ADDRESS,
  Templates,
};

export class SESService implements EmailService {
  private client: SESClient;

  private source: string;

  private templates: EmailTemplates;

  constructor(config: Config) {
    this.client = config.Client;
    this.source = config.Source;
    this.templates = config.Templates;
  }

  async send(template: string, toAddress: UserEmail, payload: unknown): Promise<void> {
    const request: SendTemplatedEmailRequest = {
      Source: this.source,
      Destination: {
        ToAddresses: [toAddress.value],
      },
      Template: this.templates[template],
      TemplateData: JSON.stringify(payload),
    };

    try {
      await this.client.sendTemplatedEmail(request).promise();
    } catch (error) {
      throw UnexpectedError.wrap(error, `failed to send ${template} email`);
    }
  }
}
