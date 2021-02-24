import faker from '@tests/support/faker';
import { MeetingItemView } from '@meetings/domain/MeetingItemView';

describe('MeetingItemView Read Model', () => {
  describe('create a new MeetingItemView', () => {
    it('returns a new object given all args', async () => {
      expect.hasAssertions();

      const id = faker.random.alphaNumeric(15);
      const title = faker.random.alphaNumeric(20);
      const category = 'Technology';
      const startsAt = new Date();
      const remainingSeats = 3;
      const availableSeats = 5;

      const miv = MeetingItemView.create({
        id,
        title,
        category,
        startsAt,
        remainingSeats,
        availableSeats,
      });

      expect(miv.isErr()).toBe(false);
      expect(miv.unwrap()).toBeInstanceOf(MeetingItemView);
      expect(miv.unwrap().id).toBe(id);
      expect(miv.unwrap().title).toBe(title);
      expect(miv.unwrap().category).toBe(category);
      expect(miv.unwrap().startsAt).toBe(startsAt);
      expect(miv.unwrap().remainingSeats).toBe(remainingSeats);
      expect(miv.unwrap().availableSeats).toBe(availableSeats);
    });
  });
});
