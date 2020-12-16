import { BaseError } from '@src/shared/core/BaseError';

export enum LeaveMeetingErrors {
  OrganizerCannotLeaveError = 'OrganizerCannotLeaveError',
}

export class OrganizerCannotLeaveError extends BaseError {
  type: LeaveMeetingErrors.OrganizerCannotLeaveError;

  public static create(message?: string): OrganizerCannotLeaveError {
    return new OrganizerCannotLeaveError(
      LeaveMeetingErrors.OrganizerCannotLeaveError,
      null,
      message || 'The meeting organizer cannot leave the meeting'
    );
  }

  public static wrap(error: unknown, message?: string): OrganizerCannotLeaveError {
    return new OrganizerCannotLeaveError(
      LeaveMeetingErrors.OrganizerCannotLeaveError,
      error,
      message
    );
  }
}
