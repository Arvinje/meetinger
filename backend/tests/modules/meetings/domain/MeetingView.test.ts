import faker from '@tests/support/faker';
import { MeetingView } from '@meetings/domain/MeetingView';
import { AttendeeDetails } from '@meetings/domain/AttendeeDetails';

describe('MeetingView Read Model', () => {
  describe('create a new MeetingView', () => {
    it('returns a new object given all args', async () => {
      expect.hasAssertions();

      const id = faker.random.alphaNumeric(15);
      const title = faker.random.alphaNumeric(20);
      const description = faker.lorem.paragraphs(2);
      const category = 'Technology';
      const startsAt = new Date();
      const place = 'Finland, Tampere';
      const address = faker.address.streetAddress(true);
      const remainingSeats = 3;
      const availableSeats = 5;
      const createdBy = faker.random.alphaNumeric(15);
      const attendees = [
        AttendeeDetails.create({
          username: createdBy,
          fullName: faker.name.findName(),
          isOrganizer: true,
        }).unwrap(),
        AttendeeDetails.create({
          username: faker.random.alphaNumeric(13),
          fullName: faker.name.findName(),
          isOrganizer: false,
        }).unwrap(),
      ];

      const mv = MeetingView.create({
        id,
        title,
        description,
        category,
        startsAt,
        place,
        address,
        remainingSeats,
        availableSeats,
        createdBy,
        attendees,
      });

      expect(mv.isErr()).toBe(false);
      expect(mv.unwrap()).toBeInstanceOf(MeetingView);
      expect(mv.unwrap().id).toBe(id);
      expect(mv.unwrap().title).toBe(title);
      expect(mv.unwrap().description).toBe(description);
      expect(mv.unwrap().category).toBe(category);
      expect(mv.unwrap().startsAt).toBe(startsAt);
      expect(mv.unwrap().place).toBe(place);
      expect(mv.unwrap().address).toBe(address);
      expect(mv.unwrap().remainingSeats).toBe(remainingSeats);
      expect(mv.unwrap().availableSeats).toBe(availableSeats);
      expect(mv.unwrap().createdBy).toBe(createdBy);
      expect(mv.unwrap().attendees).toBe(attendees);
    });
  });
});
