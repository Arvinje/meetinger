import faker from '@tests/support/faker';
import { User } from '@users/domain/User';
import { UserEmail } from '@users/domain/UserEmail';
import { UserFullName } from '@users/domain/UserFullName';
import { UserIntroduction } from '@users/domain/UserIntroduction';
import { UserName } from '@users/domain/UserName';

describe('User Domain Object', () => {
  describe('create new user', () => {
    it('should create a new user with given joinedOn date', async () => {
      expect.hasAssertions();

      const username = (await UserName.create(faker.random.alphaNumeric(15))).unwrap();
      const email = (await UserEmail.create(faker.internet.email())).unwrap();
      const fullName = (await UserFullName.create(faker.name.findName())).unwrap();
      const introduction = (await UserIntroduction.create(faker.lorem.paragraph(2))).unwrap();

      const joinedOn = new Date();
      const validUser = User.create({
        username,
        email,
        fullName,
        introduction,
        joinedOn,
      });

      expect(validUser.isErr()).toBe(false);
      expect(validUser.unwrap().username).toBe(username);
      expect(validUser.unwrap().email).toBe(email);
      expect(validUser.unwrap().fullName).toBe(fullName);
      expect(validUser.unwrap().introduction).toBe(introduction);
      expect(validUser.unwrap().joinedOn).toBe(joinedOn);
    });

    it('should create a new user with default joinedOn date', async () => {
      expect.hasAssertions();

      const username = (await UserName.create(faker.random.alphaNumeric(15))).unwrap();
      const email = (await UserEmail.create(faker.internet.email())).unwrap();
      const fullName = (await UserFullName.create(faker.name.findName())).unwrap();
      const introduction = (await UserIntroduction.create(faker.lorem.paragraph(1))).unwrap();

      const validUser = User.create({
        username,
        email,
        fullName,
        introduction,
      });

      expect(validUser.isErr()).toBe(false);
      expect(validUser.unwrap().username).toBe(username);
      expect(validUser.unwrap().email).toBe(email);
      expect(validUser.unwrap().fullName).toBe(fullName);
      expect(validUser.unwrap().introduction).toBe(introduction);
      expect(validUser.unwrap().joinedOn).toBeInstanceOf(Date);
    });
  });
});
