import faker from '@tests/support/faker';
import { AttendeeDetails } from '@meetings/domain/AttendeeDetails';

describe('AttendeeDetails Read Model', () => {
  describe('create a new AttendeeDetails', () => {
    it('returns a new object given all args', async () => {
      expect.hasAssertions();

      const username = faker.random.alphaNumeric(6);
      const fullName = faker.name.findName();
      const isOrganizer = true;

      const attendeeRes = AttendeeDetails.create({
        username,
        fullName,
        isOrganizer,
      });

      expect(attendeeRes.isErr()).toBe(false);
      expect(attendeeRes.unwrap()).toBeInstanceOf(AttendeeDetails);
      expect(attendeeRes.unwrap().username).toBe(username);
      expect(attendeeRes.unwrap().fullName).toBe(fullName);
      expect(attendeeRes.unwrap().isOrganizer).toBe(isOrganizer);
    });
  });
});
