import { MeetingAvailableSeats } from '@meetings/domain/MeetingAvailableSeats';
import { ValidationError } from '@src/shared/core/AppError';

describe('MeetingAvailableSeats Value Object', () => {
  describe('create new MeetingAvailableSeats', () => {
    test.each`
      input
      ${1}
      ${100}
      ${999}
      ${10000}
    `(
      'should return a valid object given a valid MeetingAvailableSeats ($input)',
      async ({ input }) => {
        const as = await MeetingAvailableSeats.create(input);
        expect(as.isErr()).toBe(false);
        expect(as.unwrap()).toBeInstanceOf(MeetingAvailableSeats);
        expect(as.unwrap().value).toBe(input);
      }
    );

    test.each`
      input    | errorClass         | errorType
      ${0}     | ${ValidationError} | ${'ValidationError'}
      ${'0'}   | ${ValidationError} | ${'ValidationError'}
      ${-1}    | ${ValidationError} | ${'ValidationError'}
      ${-200}  | ${ValidationError} | ${'ValidationError'}
      ${'400'} | ${ValidationError} | ${'ValidationError'}
      ${'10'}  | ${ValidationError} | ${'ValidationError'}
      ${''}    | ${ValidationError} | ${'ValidationError'}
      ${null}  | ${ValidationError} | ${'ValidationError'}
    `(
      'should return an error given invalid MeetingAvailableSeats ($input)',
      async ({ input, errorClass, errorType }) => {
        const as = await MeetingAvailableSeats.create(input);
        expect(as.isErr()).toBe(true);
        expect(as.unwrapErr()).toBeInstanceOf(errorClass);
        expect(as.unwrapErr().type).toBe(errorType);
      }
    );
  });
});
