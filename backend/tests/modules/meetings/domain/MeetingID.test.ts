import { MeetingID } from '@meetings/domain/MeetingID';
import { UniqueID } from '@src/shared/domain/uniqueId';

describe('MeetingID Entity', () => {
  describe('create new MeetingID', () => {
    it('should return a unique MeetingID', async () => {
      expect.hasAssertions();

      const id = MeetingID.create();
      expect(id).toBeInstanceOf(MeetingID);
      expect(id.id).toBeInstanceOf(UniqueID);
      expect(id.id.toValue()).toBeTruthy();
      expect(id.id.toValue()).toHaveLength(21);
    });

    it('should return a MeetingID for the given UniqueID', async () => {
      expect.hasAssertions();

      const uniqueID = new UniqueID();
      const id = MeetingID.create(uniqueID);
      expect(id).toBeInstanceOf(MeetingID);
      expect(id.id).toBe(uniqueID);
      expect(id.id.toValue()).toBe(uniqueID.toValue());
    });
  });
});
