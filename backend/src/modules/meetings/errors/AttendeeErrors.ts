import { BaseError } from '@src/shared/core/BaseError';

enum AttendeeErrors {
  AttendeeNotFoundError = 'AttendeeNotFoundError',
}

export class AttendeeNotFoundError extends BaseError {
  public static readonly type: string = AttendeeErrors.AttendeeNotFoundError;

  public static create(message?: string): AttendeeNotFoundError {
    return new AttendeeNotFoundError(
      this.type,
      null,
      message || 'Such meeting attendee cannot be found'
    );
  }

  public static wrap(error: unknown, message?: string): AttendeeNotFoundError {
    return new AttendeeNotFoundError(this.type, error, message);
  }
}
