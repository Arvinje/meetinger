import faker from '@tests/support/faker';
import { UserEmail } from '@users/domain/UserEmail';
import { ValidationError } from '@src/shared/core/AppError';

describe('UserEmail Value Object', () => {
  describe('create new UserEmail', () => {
    test.each`
      input
      ${faker.internet.email()}
      ${faker.internet.email()}
      ${faker.internet.email().toUpperCase()}
      ${faker.internet.email().toUpperCase()}
    `('should return a valid object given a valid email ($input)', async ({ input }) => {
      const email = await UserEmail.create(input);
      expect(email.isErr()).toBe(false);
      expect(email.unwrap().value).toBe(input.toLowerCase());
    });

    test.each`
      input                   | errorClass         | errorType
      ${faker.internet.url()} | ${ValidationError} | ${'ValidationError'}
      ${faker.internet.url()} | ${ValidationError} | ${'ValidationError'}
      ${''}                   | ${ValidationError} | ${'ValidationError'}
      ${null}                 | ${ValidationError} | ${'ValidationError'}
    `(
      'should return an error given invalid email ($input)',
      async ({ input, errorClass, errorType }) => {
        const email = await UserEmail.create(input);
        expect(email.isErr()).toBe(true);
        expect(email.unwrapErr()).toBeInstanceOf(errorClass);
        expect(email.unwrapErr().type).toBe(errorType);
      }
    );
  });
});
