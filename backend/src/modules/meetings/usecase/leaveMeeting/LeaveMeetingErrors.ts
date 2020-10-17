import { BaseError } from '@src/shared/core/BaseError';

enum LeaveMeetingErrors {
  OrganizerCannotLeaveError = 'OrganizerCannotLeaveError',
}

export class OrganizerCannotLeaveError extends BaseError {
  public static readonly type: string = LeaveMeetingErrors.OrganizerCannotLeaveError;

  public static create(message?: string): OrganizerCannotLeaveError {
    return new OrganizerCannotLeaveError(
      this.type,
      null,
      message || 'The meeting organizer cannot leave the meeting'
    );
  }

  public static wrap(error: unknown, message?: string): OrganizerCannotLeaveError {
    return new OrganizerCannotLeaveError(this.type, error, message);
  }
}
