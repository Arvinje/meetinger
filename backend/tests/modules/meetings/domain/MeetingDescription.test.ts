import faker from '@tests/support/faker';
import { MeetingDescription } from '@meetings/domain/MeetingDescription';
import { ValidationError } from '@src/shared/core/AppError';

describe('MeetingDescription Value Object', () => {
  describe('create new MeetingDescription', () => {
    test.each`
      input
      ${faker.lorem.paragraphs(6)}
      ${faker.lorem.paragraph()}
      ${faker.lorem.words(3)}
    `('should return a valid object given a valid description ($input)', async ({ input }) => {
      const desc = await MeetingDescription.create(input);
      expect(desc.isErr()).toBe(false);
      expect(desc.unwrap()).toBeInstanceOf(MeetingDescription);
      expect(desc.unwrap().value).toBe(input);
    });

    test.each`
      input                              | errorClass         | errorType
      ${faker.random.alphaNumeric(2)}    | ${ValidationError} | ${'ValidationError'}
      ${faker.random.alphaNumeric(2001)} | ${ValidationError} | ${'ValidationError'}
      ${''}                              | ${ValidationError} | ${'ValidationError'}
      ${null}                            | ${ValidationError} | ${'ValidationError'}
    `(
      'should return an error given invalid description ($input)',
      async ({ input, errorClass, errorType }) => {
        const desc = await MeetingDescription.create(input);
        expect(desc.isErr()).toBe(true);
        expect(desc.unwrapErr()).toBeInstanceOf(errorClass);
        expect(desc.unwrapErr().type).toBe(errorType);
      }
    );
  });
});
