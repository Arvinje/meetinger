import faker from '@tests/support/faker';
import { Attendees } from '@meetings/domain/Attendees';
import { ValidationError } from '@src/shared/core/AppError';
import { UserName } from '@users/domain/UserName';

describe('Attendees Value Object', () => {
  describe('create new Attendees', () => {
    it('returns a valid object given a list of valid attendees', async () => {
      expect.hasAssertions();

      const toBeSearchedFor = (await UserName.create(faker.random.alphaNumeric(6))).unwrap();
      const notInTheList = (await UserName.create(faker.random.alphaNumeric(17))).unwrap();
      const attendeesList = [
        (await UserName.create(faker.random.alphaNumeric(10))).unwrap(),
        toBeSearchedFor,
        (await UserName.create(faker.random.alphaNumeric(14))).unwrap(),
      ];

      const attendeesRes = Attendees.create(attendeesList);
      expect(attendeesRes.isErr()).toBe(false);
      expect(attendeesRes.unwrap()).toBeInstanceOf(Attendees);
      expect(attendeesRes.unwrap().count).toBe(3);
      expect(attendeesRes.unwrap().value).toBe(attendeesList);
      expect(attendeesRes.unwrap().has(toBeSearchedFor)).toBe(true);
      expect(attendeesRes.unwrap().has(notInTheList)).toBe(false);
    });

    it('returns an error object given a an empty list', async () => {
      expect.hasAssertions();

      const attendeesList = [];

      const attendeesRes = Attendees.create(attendeesList);
      expect(attendeesRes.isErr()).toBe(true);
      expect(attendeesRes.unwrapErr()).toBeInstanceOf(ValidationError);
      expect(attendeesRes.unwrapErr().type).toBe('ValidationError');
      expect(attendeesRes.unwrapErr().message).toBe('at least one attendee is required');
    });

    it('returns an error object given a list with duplicate attendees', async () => {
      expect.hasAssertions();

      const duplicated = (await UserName.create(faker.random.alphaNumeric(6))).unwrap();
      const attendeesList = [
        (await UserName.create(faker.random.alphaNumeric(10))).unwrap(),
        duplicated,
        (await UserName.create(faker.random.alphaNumeric(14))).unwrap(),
        duplicated,
      ];

      const attendeesRes = Attendees.create(attendeesList);
      expect(attendeesRes.isErr()).toBe(true);
      expect(attendeesRes.unwrapErr()).toBeInstanceOf(ValidationError);
      expect(attendeesRes.unwrapErr().type).toBe('ValidationError');
      expect(attendeesRes.unwrapErr().message).toBe('attendee is already added');
    });
  });

  describe('add a new attendee', () => {
    it('returns a new Attendees object given a non-attending UserName', async () => {
      expect.hasAssertions();

      const attendeesList = [
        (await UserName.create(faker.random.alphaNumeric(10))).unwrap(),
        (await UserName.create(faker.random.alphaNumeric(14))).unwrap(),
      ];
      const newUser = (await UserName.create(faker.random.alphaNumeric(6))).unwrap();

      const oldAttendees = Attendees.create(attendeesList).unwrap();
      const attendeesRes = oldAttendees.add(newUser);
      expect(attendeesRes.isErr()).toBe(false);
      expect(attendeesRes.unwrap()).toBeInstanceOf(Attendees);
      expect(attendeesRes.unwrap().count).toBe(3);
      expect(attendeesRes.unwrap().has(newUser)).toBe(true);
    });

    it('returns an error object given a duplicated UserName', async () => {
      expect.hasAssertions();

      const duplicated = (await UserName.create(faker.random.alphaNumeric(6))).unwrap();
      const attendeesList = [
        (await UserName.create(faker.random.alphaNumeric(10))).unwrap(),
        (await UserName.create(faker.random.alphaNumeric(14))).unwrap(),
        duplicated,
      ];

      const oldAttendees = Attendees.create(attendeesList).unwrap();
      const attendeesRes = oldAttendees.add(duplicated);
      expect(attendeesRes.isErr()).toBe(true);
      expect(attendeesRes.unwrapErr()).toBeInstanceOf(ValidationError);
      expect(attendeesRes.unwrapErr().type).toBe('ValidationError');
      expect(attendeesRes.unwrapErr().message).toBe('attendee already exists');
    });
  });

  describe('remove an attendee', () => {
    it('returns a new Attendees object without the given UserName included', async () => {
      expect.hasAssertions();

      const toBeRemoved = (await UserName.create(faker.random.alphaNumeric(6))).unwrap();
      const attendeesList = [
        (await UserName.create(faker.random.alphaNumeric(10))).unwrap(),
        (await UserName.create(faker.random.alphaNumeric(14))).unwrap(),
        toBeRemoved,
      ];

      const oldAttendees = Attendees.create(attendeesList).unwrap();
      const attendeesRes = oldAttendees.remove(toBeRemoved);
      expect(attendeesRes.isErr()).toBe(false);
      expect(attendeesRes.unwrap()).toBeInstanceOf(Attendees);
      expect(attendeesRes.unwrap().count).toBe(2);
      expect(attendeesRes.unwrap().has(toBeRemoved)).toBe(false);
    });

    it('returns an error object given a non-existent UserName', async () => {
      expect.hasAssertions();

      const nonExistent = (await UserName.create(faker.random.alphaNumeric(6))).unwrap();
      const attendeesList = [
        (await UserName.create(faker.random.alphaNumeric(10))).unwrap(),
        (await UserName.create(faker.random.alphaNumeric(14))).unwrap(),
      ];

      const oldAttendees = Attendees.create(attendeesList).unwrap();
      const attendeesRes = oldAttendees.remove(nonExistent);
      expect(attendeesRes.isErr()).toBe(true);
      expect(attendeesRes.unwrapErr()).toBeInstanceOf(ValidationError);
      expect(attendeesRes.unwrapErr().type).toBe('ValidationError');
      expect(attendeesRes.unwrapErr().message).toBe('attendee was not found');
    });
  });
});
