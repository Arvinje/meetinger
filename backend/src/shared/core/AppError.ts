/* eslint-disable max-classes-per-file */
import { BaseError } from './BaseError';

export enum AppErrors {
  UnexpectedError = 'UnexpectedError',
  ValidationError = 'ValidationError',
  UnAuthorizedError = 'UnAuthorizedError',
  ForbiddenError = 'ForbiddenError',
}

export class UnexpectedError extends BaseError {
  type: AppErrors.UnexpectedError;

  public static create(message = 'An unexpected error occurred'): UnexpectedError {
    return new UnexpectedError(AppErrors.UnexpectedError, null, message);
  }

  public static wrap(error: unknown, message = 'An unexpected error occurred'): UnexpectedError {
    return new UnexpectedError(AppErrors.UnexpectedError, error, message);
  }
}

export class UnAuthorizedError extends BaseError {
  type: AppErrors.UnAuthorizedError;

  public static create(message: string): UnAuthorizedError {
    return new UnAuthorizedError(AppErrors.UnAuthorizedError, null, message);
  }

  public static wrap(error: unknown, message: string): UnAuthorizedError {
    return new UnAuthorizedError(AppErrors.UnAuthorizedError, error, message);
  }
}

export class ForbiddenError extends BaseError {
  type: AppErrors.ForbiddenError;

  public static create(message: string): ForbiddenError {
    return new ForbiddenError(AppErrors.ForbiddenError, null, message);
  }

  public static wrap(error: unknown, message: string): ForbiddenError {
    return new ForbiddenError(AppErrors.ForbiddenError, error, message);
  }
}

export class ValidationError extends BaseError {
  type: AppErrors.ValidationError;

  public static create(message: string): ValidationError {
    return new ValidationError(AppErrors.ValidationError, null, message);
  }

  public static wrap(error: unknown, message: string): ValidationError {
    return new ValidationError(AppErrors.ValidationError, error, message);
  }
}
