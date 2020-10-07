import { v4 as uuidv4 } from 'uuid';
import { WError } from 'verror';

export interface BaseErrorResponse {
  id: string;
  type: string;
  message: string;
}

export abstract class BaseError extends WError {
  public readonly id: string;

  public readonly type: string;

  protected constructor(type: string, error: unknown, message: string) {
    super(error, message);
    // Error.captureStackTrace(this, this.constructor);

    this.id = uuidv4();
    this.type = type;

    // eslint-disable-next-line no-console
    console.error(this);

    // // eslint-disable-next-line no-console
    // console.error(`[${this.type}]: ${this.message}`);
    // // eslint-disable-next-line no-console
    // if (error) console.error(error);
  }

  protected get getBaseResponse(): BaseErrorResponse {
    return {
      id: this.id,
      type: this.type,
      message: this.message,
    };
  }

  public get toResponse(): BaseErrorResponse {
    return this.getBaseResponse;
  }
}
