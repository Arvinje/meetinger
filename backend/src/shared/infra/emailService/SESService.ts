import { UnexpectedError } from '@src/shared/core/AppError';
import SESClient, { SendTemplatedEmailRequest } from 'aws-sdk/clients/ses';
import { EmailService } from './EmailService';
import { EmailMessage } from './EmailMessage';

interface EmailTemplates {
  AttendeeJoined: string;
}

export const Templates: EmailTemplates = {
  AttendeeJoined: process.env.ATTENDEE_JOINED_SES_TEMPLATE,
};

interface Config {
  Client: SESClient;
  SourceEmailDomain: string;
  Templates: EmailTemplates;
}

export const SESConfig: Config = {
  Client: new SESClient(),
  SourceEmailDomain: process.env.SOURCE_EMAIL_DOMAIN,
  Templates,
};

export class SESService implements EmailService {
  private client: SESClient;

  private sourceEmailDomain: string;

  private templates: EmailTemplates;

  constructor(config: Config) {
    this.client = config.Client;
    this.sourceEmailDomain = config.SourceEmailDomain;
    this.templates = config.Templates;
  }

  async send(message: EmailMessage): Promise<void> {
    const template = this.templates[message.template];
    if (template === undefined) {
      throw UnexpectedError.create(`the template (${message.template}) is not valid`);
    }

    const request: SendTemplatedEmailRequest = {
      Source: `${message.sender}@${this.sourceEmailDomain}`,
      Destination: {
        ToAddresses: message.toAddresses,
      },
      Template: template,
      TemplateData: message.templateData,
    };

    try {
      await this.client.sendTemplatedEmail(request).promise();
    } catch (error) {
      throw UnexpectedError.wrap(error, `failed to send ${message.template} email`);
    }
  }
}
