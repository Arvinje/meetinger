import faker from '@tests/support/faker';
import { MeetingTitle } from '@meetings/domain/MeetingTitle';
import { ValidationError } from '@src/shared/core/AppError';

describe('MeetingTitle Value Object', () => {
  describe('create new MeetingTitle', () => {
    test.each`
      input
      ${faker.random.alphaNumeric(50)}
      ${faker.random.alphaNumeric(3)}
      ${faker.lorem.words(4)}
      ${faker.lorem.words(2)}
    `('should return a valid object given a valid title ($input)', async ({ input }) => {
      const title = await MeetingTitle.create(input);
      expect(title.isErr()).toBe(false);
      expect(title.unwrap()).toBeInstanceOf(MeetingTitle);
      expect(title.unwrap().value).toBe(input);
    });

    test.each`
      input                            | errorClass         | errorType
      ${faker.random.alphaNumeric(2)}  | ${ValidationError} | ${'ValidationError'}
      ${faker.random.alphaNumeric(51)} | ${ValidationError} | ${'ValidationError'}
      ${''}                            | ${ValidationError} | ${'ValidationError'}
      ${null}                          | ${ValidationError} | ${'ValidationError'}
    `(
      'should return an error given invalid title ($input)',
      async ({ input, errorClass, errorType }) => {
        const title = await MeetingTitle.create(input);
        expect(title.isErr()).toBe(true);
        expect(title.unwrapErr()).toBeInstanceOf(errorClass);
        expect(title.unwrapErr().type).toBe(errorType);
      }
    );
  });
});
