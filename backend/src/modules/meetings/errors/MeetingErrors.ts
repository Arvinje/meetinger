// eslint-disable-next-line max-classes-per-file
import { BaseError } from '@src/shared/core/BaseError';

export enum MeetingErrors {
  MeetingNotFoundError = 'MeetingNotFoundError',
  MeetingFullyBooked = 'MeetingFullyBooked',
}

export class MeetingNotFoundError extends BaseError {
  type: MeetingErrors.MeetingNotFoundError;

  public static create(message?: string): MeetingNotFoundError {
    return new MeetingNotFoundError(
      MeetingErrors.MeetingNotFoundError,
      null,
      message || 'Such meeting cannot be found'
    );
  }

  public static wrap(error: unknown, message?: string): MeetingNotFoundError {
    return new MeetingNotFoundError(MeetingErrors.MeetingNotFoundError, error, message);
  }
}

export class MeetingFullyBooked extends BaseError {
  type: MeetingErrors.MeetingFullyBooked;

  public static create(message?: string): MeetingFullyBooked {
    return new MeetingFullyBooked(
      MeetingErrors.MeetingFullyBooked,
      null,
      message || 'No more seats available'
    );
  }

  public static wrap(error: unknown, message?: string): MeetingFullyBooked {
    return new MeetingFullyBooked(MeetingErrors.MeetingFullyBooked, error, message);
  }
}
