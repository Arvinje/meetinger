import faker from '@tests/support/faker';
import { MeetingAddress } from '@meetings/domain/MeetingAddress';
import { ValidationError } from '@src/shared/core/AppError';

describe('MeetingAddress Value Object', () => {
  describe('create new MeetingAddress', () => {
    test.each`
      input
      ${faker.address.streetAddress(true)}
      ${faker.address.streetAddress(true)}
      ${faker.address.streetAddress(true)}
    `('should return a valid object given a valid address ($input)', async ({ input }) => {
      const address = await MeetingAddress.create(input);
      expect(address.isErr()).toBe(false);
      expect(address.unwrap()).toBeInstanceOf(MeetingAddress);
      expect(address.unwrap().value).toBe(input);
    });

    test.each`
      input   | errorClass         | errorType
      ${''}   | ${ValidationError} | ${'ValidationError'}
      ${null} | ${ValidationError} | ${'ValidationError'}
    `(
      'should return an error given invalid address ($input)',
      async ({ input, errorClass, errorType }) => {
        const address = await MeetingAddress.create(input);
        expect(address.isErr()).toBe(true);
        expect(address.unwrapErr()).toBeInstanceOf(errorClass);
        expect(address.unwrapErr().type).toBe(errorType);
      }
    );
  });
});
