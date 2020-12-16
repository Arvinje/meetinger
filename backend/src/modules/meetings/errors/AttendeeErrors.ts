import { BaseError } from '@src/shared/core/BaseError';

export enum AttendeeErrors {
  AttendeeNotFoundError = 'AttendeeNotFoundError',
}

export class AttendeeNotFoundError extends BaseError {
  type: AttendeeErrors.AttendeeNotFoundError;

  public static create(message?: string): AttendeeNotFoundError {
    return new AttendeeNotFoundError(
      AttendeeErrors.AttendeeNotFoundError,
      null,
      message || 'Such meeting attendee cannot be found'
    );
  }

  public static wrap(error: unknown, message?: string): AttendeeNotFoundError {
    return new AttendeeNotFoundError(AttendeeErrors.AttendeeNotFoundError, error, message);
  }
}
