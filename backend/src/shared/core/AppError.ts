/* eslint-disable max-classes-per-file */
import { BaseError } from './BaseError';

enum AppErrors {
  UnexpectedError = 'UnexpectedError',
  ValidationError = 'ValidationError',
  UnAuthorizedError = 'UnAuthorizedError',
}

export class UnexpectedError extends BaseError {
  public static readonly type: string = AppErrors.UnexpectedError;

  public static create(message = 'An unexpected error occurred'): UnexpectedError {
    return new UnexpectedError(this.type, null, message);
  }

  public static wrap(error: unknown, message = 'An unexpected error occurred'): UnexpectedError {
    return new UnexpectedError(this.type, error, message);
  }
}

export class UnAuthorizedError extends BaseError {
  public static readonly type: string = AppErrors.UnAuthorizedError;

  public static create(message: string): UnAuthorizedError {
    return new UnAuthorizedError(this.type, null, message);
  }

  public static wrap(error: unknown, message: string): UnexpectedError {
    return new UnexpectedError(this.type, error, message);
  }
}

export class ValidationError extends BaseError {
  public static readonly type: string = AppErrors.ValidationError;

  public static create(message: string): ValidationError {
    return new ValidationError(this.type, null, message);
  }

  public static wrap(error: unknown, message: string): UnexpectedError {
    return new UnexpectedError(this.type, error, message);
  }
}
