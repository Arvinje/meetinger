/* eslint-disable max-classes-per-file */
export class AppError extends Error {
    cause: Error;

    constructor(cause: Error, message = '') {
      super(message);
      this.cause = cause;
    }
}

export class ValidationError extends AppError {}
export class DynamoDBError extends AppError {}
export class AxiosError extends AppError {}
export class AuthError extends AppError {}
export class NotFoundError extends AppError {}
