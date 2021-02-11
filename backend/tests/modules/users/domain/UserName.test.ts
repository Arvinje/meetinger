import faker from '@tests/support/faker';
import { UserName } from '@users/domain/UserName';
import { ValidationError } from '@src/shared/core/AppError';

describe('UserName Value Object', () => {
  describe('create new UserName', () => {
    test.each`
      input
      ${faker.fake('{{random.alphaNumeric(5)}}_{{random.alphaNumeric(3)}}')}
      ${faker.random.alphaNumeric(10).toUpperCase()}
    `('should return a valid object given a valid username ($input)', async ({ input }) => {
      const username = await UserName.create(input);
      expect(username.isErr()).toBe(false);
      expect(username.unwrap().value).toBe(input.toLowerCase());
    });

    test.each`
      input                                                                | errorClass         | errorType
      ${`${faker.random.alphaNumeric(6)}.${faker.random.alphaNumeric(5)}`} | ${ValidationError} | ${'ValidationError'}
      ${faker.random.alphaNumeric(41)}                                     | ${ValidationError} | ${'ValidationError'}
      ${''}                                                                | ${ValidationError} | ${'ValidationError'}
      ${null}                                                              | ${ValidationError} | ${'ValidationError'}
      ${'this%StringI$Invalid'}                                            | ${ValidationError} | ${'ValidationError'}
    `(
      'should return an error given invalid username ($input)',
      async ({ input, errorClass, errorType }) => {
        const username = await UserName.create(input);
        expect(username.isErr()).toBe(true);
        expect(username.unwrapErr()).toBeInstanceOf(errorClass);
        expect(username.unwrapErr().type).toBe(errorType);
      }
    );
  });
});
