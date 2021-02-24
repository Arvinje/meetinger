import faker from '@tests/support/faker';
import { RegisteredMeetingView } from '@meetings/domain/RegisteredMeetingView';

describe('RegisteredMeetingView Read Model', () => {
  describe('create a new RegisteredMeetingView', () => {
    it('returns a new object given all args', async () => {
      expect.hasAssertions();

      const id = faker.random.alphaNumeric(15);
      const title = faker.random.alphaNumeric(20);
      const startsAt = new Date();
      const organizedByMe = true;

      const mv = RegisteredMeetingView.create({
        id,
        title,
        startsAt,
        organizedByMe,
      });

      expect(mv).toBeInstanceOf(RegisteredMeetingView);
      expect(mv.id).toBe(id);
      expect(mv.title).toBe(title);
      expect(mv.startsAt).toBe(startsAt);
      expect(mv.organizedByMe).toBe(organizedByMe);
    });
  });
});
