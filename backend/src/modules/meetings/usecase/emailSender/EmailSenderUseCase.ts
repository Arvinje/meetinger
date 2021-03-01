import { Err, Ok, Result } from '@hqoss/monads';
import { UseCase } from '@src/shared/core/useCase';
import { UnexpectedError } from '@src/shared/core/AppError';
import { EmailMessage } from '@src/shared/infra/emailService/EmailMessage';
import { EmailService } from '@src/shared/infra/emailService/EmailService';

type Response = Result<void, UnexpectedError>;

export class EmailSenderUseCase implements UseCase<EmailMessage, Promise<Response>> {
  private emailService: EmailService;

  constructor(emailService: EmailService) {
    this.emailService = emailService;
  }

  async execute(message: EmailMessage): Promise<Response> {
    try {
      await this.emailService.send(message);
      return Ok(undefined);
    } catch (error) {
      return Err(UnexpectedError.wrap(error));
    }
  }
}
