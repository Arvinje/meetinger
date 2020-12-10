// eslint-disable-next-line max-classes-per-file
import { BaseError } from '@src/shared/core/BaseError';

enum MeetingErrors {
  MeetingNotFoundError = 'MeetingNotFoundError',
  MeetingFullyBooked = 'MeetingFullyBooked',
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

export class MeetingFullyBooked extends BaseError {
  public static readonly type: string = MeetingErrors.MeetingFullyBooked;

  public static create(message?: string): MeetingFullyBooked {
    return new MeetingFullyBooked(this.type, null, message || 'No more seats available');
  }

  public static wrap(error: unknown, message?: string): MeetingFullyBooked {
    return new MeetingFullyBooked(this.type, error, message);
  }
}
