import { EmailMessage } from './EmailMessage';

export interface EmailService {
  send(message: EmailMessage): Promise<void>;
}
