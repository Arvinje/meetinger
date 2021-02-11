import faker from '@tests/support/faker';
import { UserFullName } from '@users/domain/UserFullName';
import { ValidationError } from '@src/shared/core/AppError';

describe('UserFullName Value Object', () => {
  describe('create new UserFullName', () => {
    test.each`
      input
      ${faker.name.findName()}
      ${faker.name.findName()}
      ${faker.name.findName().toUpperCase()}
      ${faker.name.findName().toUpperCase()}
    `('should return a valid object given a valid email ($input)', async ({ input }) => {
      const fullname = await UserFullName.create(input);
      expect(fullname.isErr()).toBe(false);
      expect(fullname.unwrap().value).toBe(input);
    });

    test.each`
      input                                 | errorClass         | errorType
      ${faker.random.alpha({ count: 301 })} | ${ValidationError} | ${'ValidationError'}
      ${''}                                 | ${ValidationError} | ${'ValidationError'}
      ${null}                               | ${ValidationError} | ${'ValidationError'}
    `(
      'should return an error given invalid email ($input)',
      async ({ input, errorClass, errorType }) => {
        const fullname = await UserFullName.create(input);
        expect(fullname.isErr()).toBe(true);
        expect(fullname.unwrapErr()).toBeInstanceOf(errorClass);
        expect(fullname.unwrapErr().type).toBe(errorType);
      }
    );
  });
});
