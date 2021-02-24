import faker from '@tests/support/faker';
import { MeetingCategory } from '@meetings/domain/MeetingCategory';
import { ValidationError } from '@src/shared/core/AppError';

describe('MeetingCategory Value Object', () => {
  describe('create new MeetingCategory', () => {
    test.each`
      input
      ${'Social'}
      ${'Technology'}
    `('should return a valid object given a valid category ($input)', async ({ input }) => {
      const category = await MeetingCategory.create(input);
      expect(category.isErr()).toBe(false);
      expect(category.unwrap()).toBeInstanceOf(MeetingCategory);
      expect(category.unwrap().value).toBe(input);
    });

    test.each`
      input                            | errorClass         | errorType
      ${faker.random.alphaNumeric(6)}  | ${ValidationError} | ${'ValidationError'}
      ${faker.random.alphaNumeric(10)} | ${ValidationError} | ${'ValidationError'}
      ${''}                            | ${ValidationError} | ${'ValidationError'}
      ${null}                          | ${ValidationError} | ${'ValidationError'}
    `(
      'should return an error given invalid category ($input)',
      async ({ input, errorClass, errorType }) => {
        const category = await MeetingCategory.create(input);
        expect(category.isErr()).toBe(true);
        expect(category.unwrapErr()).toBeInstanceOf(errorClass);
        expect(category.unwrapErr().type).toBe(errorType);
      }
    );
  });
});
