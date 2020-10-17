import { BaseError } from '@src/shared/core/BaseError';

enum MeetingErrors {
  MeetingNotFoundError = 'MeetingNotFoundError',
}

export class MeetingNotFoundError extends BaseError {
  public static readonly type: string = MeetingErrors.MeetingNotFoundError;

  public static create(message?: string): MeetingNotFoundError {
    return new MeetingNotFoundError(this.type, null, message || 'Such meeting cannot be found');
  }

  public static wrap(error: unknown, message?: string): MeetingNotFoundError {
    return new MeetingNotFoundError(this.type, error, message);
  }
}
