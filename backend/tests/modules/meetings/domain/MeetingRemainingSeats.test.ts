import { MeetingRemainingSeats } from '@meetings/domain/MeetingRemainingSeats';
import { ValidationError } from '@src/shared/core/AppError';

describe('MeetingRemainingSeats Value Object', () => {
  describe('create new MeetingRemainingSeats', () => {
    test.each`
      input
      ${0}
      ${100}
      ${999}
      ${10000}
    `(
      'should return a valid object given a valid MeetingRemainingSeats ($input)',
      async ({ input }) => {
        const rs = await MeetingRemainingSeats.create(input);
        expect(rs.isErr()).toBe(false);
        expect(rs.unwrap()).toBeInstanceOf(MeetingRemainingSeats);
        expect(rs.unwrap().value).toBe(input);
      }
    );

    test.each`
      input    | errorClass         | errorType
      ${-1}    | ${ValidationError} | ${'ValidationError'}
      ${-200}  | ${ValidationError} | ${'ValidationError'}
      ${'400'} | ${ValidationError} | ${'ValidationError'}
      ${'10'}  | ${ValidationError} | ${'ValidationError'}
      ${''}    | ${ValidationError} | ${'ValidationError'}
      ${null}  | ${ValidationError} | ${'ValidationError'}
    `(
      'should return an error given invalid MeetingRemainingSeats ($input)',
      async ({ input, errorClass, errorType }) => {
        const rs = await MeetingRemainingSeats.create(input);
        expect(rs.isErr()).toBe(true);
        expect(rs.unwrapErr()).toBeInstanceOf(errorClass);
        expect(rs.unwrapErr().type).toBe(errorType);
      }
    );
  });
});
