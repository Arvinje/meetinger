import faker from '@tests/support/faker';
import { MeetingPlace } from '@meetings/domain/MeetingPlace';
import { ValidationError } from '@src/shared/core/AppError';

describe('MeetingPlace Value Object', () => {
  describe('create new MeetingPlace', () => {
    test.each`
      input
      ${'Remote'}
      ${'Finland, Tampere'}
      ${'Finland, Helsinki'}
    `('should return a valid object given a valid place ($input)', async ({ input }) => {
      const place = await MeetingPlace.create(input);
      expect(place.isErr()).toBe(false);
      expect(place.unwrap()).toBeInstanceOf(MeetingPlace);
      expect(place.unwrap().value).toBe(input);
    });

    test.each`
      input                            | errorClass         | errorType
      ${faker.random.alphaNumeric(6)}  | ${ValidationError} | ${'ValidationError'}
      ${faker.random.alphaNumeric(10)} | ${ValidationError} | ${'ValidationError'}
      ${''}                            | ${ValidationError} | ${'ValidationError'}
      ${null}                          | ${ValidationError} | ${'ValidationError'}
    `(
      'should return an error given invalid place ($input)',
      async ({ input, errorClass, errorType }) => {
        const place = await MeetingPlace.create(input);
        expect(place.isErr()).toBe(true);
        expect(place.unwrapErr()).toBeInstanceOf(errorClass);
        expect(place.unwrapErr().type).toBe(errorType);
      }
    );
  });
});
