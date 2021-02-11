import faker from '@tests/support/faker';
import { UserIntroduction } from '@users/domain/UserIntroduction';
import { ValidationError } from '@src/shared/core/AppError';

describe('UserIntroduction Value Object', () => {
  describe('create new UserIntroduction', () => {
    test.each`
      input
      ${faker.random.alpha({ count: 300 })}
      ${''}
    `('should return a valid object given a valid intro ($input)', async ({ input }) => {
      const intro = await UserIntroduction.create(input);
      expect(intro.isErr()).toBe(false);
      expect(intro.unwrap().value).toBe(input);
    });

    test.each`
      input                                 | errorClass         | errorType
      ${faker.random.alpha({ count: 301 })} | ${ValidationError} | ${'ValidationError'}
      ${null}                               | ${ValidationError} | ${'ValidationError'}
    `(
      'should return an error given invalid intro ($input)',
      async ({ input, errorClass, errorType }) => {
        const intro = await UserIntroduction.create(input);
        expect(intro.isErr()).toBe(true);
        expect(intro.unwrapErr()).toBeInstanceOf(errorClass);
        expect(intro.unwrapErr().type).toBe(errorType);
      }
    );
  });
});
