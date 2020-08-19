/* eslint-disable max-classes-per-file */
import { VError } from 'verror';

// App-wide error object
export class AppError extends VError {
  public name = 'AppError';
}

// Main error classes, they roughly correlate to one or multiple HTTP status codes
export class UnAuthorizedError extends AppError {
  // 401
  public name = 'UnAuthorizedError';
}
export class NotFoundError extends AppError {
  // 404
  public name = 'NotFoundError';
}
export class InternalError extends AppError {
  // 5**
  public name = 'InternalError';
}
export class ValidationError extends AppError {
  // 422 or 400
  public name = 'ValidationError';
}

// External resources errors
export class DynamoDBError extends InternalError {
  public name = 'DynamoDBError';
}
export class AxiosError extends InternalError {
  public name = 'AxiosError';
}
