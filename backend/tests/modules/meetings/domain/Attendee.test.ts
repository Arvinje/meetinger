import faker from '@tests/support/faker';
import { UserName } from '@users/domain/UserName';
import { UserFullName } from '@users/domain/UserFullName';
import { MeetingID } from '@meetings/domain/MeetingID';
import dayjs from 'dayjs';
import { Attendee } from '@meetings/domain/Attendee';
import { MeetingTitle } from '@meetings/domain/MeetingTitle';
import { UserEmail } from '@src/modules/users/domain/UserEmail';

describe('Attendee AggregateRoot', () => {
  describe('create a new Attendee', () => {
    it('returns a new attendee given all args', async () => {
      expect.hasAssertions();

      const username = (await UserName.create(faker.random.alphaNumeric(6))).unwrap();
      const email = (await UserEmail.create(faker.internet.email())).unwrap();
      const fullName = (await UserFullName.create(faker.name.findName())).unwrap();
      const meetingID = MeetingID.create();
      const joinedMeetingOn = dayjs().subtract(1, 'minute').toDate();
      const meetingStartsAt = dayjs().add(2, 'day').toDate();
      const meetingTitle = (await MeetingTitle.create(faker.random.alphaNumeric(50))).unwrap();
      const isOrganizer = true;

      const attendeeRes = Attendee.create({
        username,
        fullName,
        email,
        meetingID,
        joinedMeetingOn,
        meetingStartsAt,
        meetingTitle,
        isOrganizer,
      });
      expect(attendeeRes.isErr()).toBe(false);
      expect(attendeeRes.unwrap()).toBeInstanceOf(Attendee);
      expect(attendeeRes.unwrap().username).toBe(username);
      expect(attendeeRes.unwrap().email).toBe(email);
      expect(attendeeRes.unwrap().fullName).toBe(fullName);
      expect(attendeeRes.unwrap().meetingID).toBe(meetingID);
      expect(attendeeRes.unwrap().joinedMeetingOn).toBe(joinedMeetingOn);
      expect(attendeeRes.unwrap().meetingStartsAt).toBe(meetingStartsAt);
      expect(attendeeRes.unwrap().meetingTitle).toBe(meetingTitle);
      expect(attendeeRes.unwrap().isOrganizer).toBe(isOrganizer);
    });

    it('return a new attendee given mandatory args only', async () => {
      expect.hasAssertions();

      const username = (await UserName.create(faker.random.alphaNumeric(6))).unwrap();
      const email = (await UserEmail.create(faker.internet.email())).unwrap();
      const fullName = (await UserFullName.create(faker.name.findName())).unwrap();
      const meetingID = MeetingID.create();
      const joinedMeetingOn = dayjs().subtract(1, 'minute').toDate();
      const meetingStartsAt = dayjs().add(2, 'day').toDate();
      const meetingTitle = (await MeetingTitle.create(faker.random.alphaNumeric(50))).unwrap();

      const attendeeRes = Attendee.create({
        username,
        email,
        fullName,
        meetingID,
        joinedMeetingOn,
        meetingStartsAt,
        meetingTitle,
      });
      expect(attendeeRes.isErr()).toBe(false);
      expect(attendeeRes.unwrap()).toBeInstanceOf(Attendee);
      expect(attendeeRes.unwrap().username).toBe(username);
      expect(attendeeRes.unwrap().fullName).toBe(fullName);
      expect(attendeeRes.unwrap().meetingID).toBe(meetingID);
      expect(attendeeRes.unwrap().joinedMeetingOn).toBe(joinedMeetingOn);
      expect(attendeeRes.unwrap().meetingStartsAt).toBe(meetingStartsAt);
      expect(attendeeRes.unwrap().meetingTitle).toBe(meetingTitle);
      expect(attendeeRes.unwrap().isOrganizer).toBe(false);
    });
  });

  describe('update meeting start time', () => {
    it('successfully updates the start time', async () => {
      expect.hasAssertions();

      const username = (await UserName.create(faker.random.alphaNumeric(6))).unwrap();
      const email = (await UserEmail.create(faker.internet.email())).unwrap();
      const fullName = (await UserFullName.create(faker.name.findName())).unwrap();
      const meetingID = MeetingID.create();
      const joinedMeetingOn = dayjs().subtract(1, 'minute').toDate();
      const oldMeetingStartsAt = dayjs().add(2, 'day').toDate();
      const meetingTitle = (await MeetingTitle.create(faker.random.alphaNumeric(50))).unwrap();
      const isOrganizer = true;

      const attendee = Attendee.create({
        username,
        email,
        fullName,
        meetingID,
        joinedMeetingOn,
        meetingStartsAt: oldMeetingStartsAt,
        meetingTitle,
        isOrganizer,
      }).unwrap();

      const newMeetingStartsAt = dayjs().add(4, 'day').toDate();
      const updated = attendee.setMeetingStartsAt(newMeetingStartsAt);
      expect(updated.isErr()).toBe(false);
      expect(attendee.meetingStartsAt).toBe(newMeetingStartsAt);
    });
  });

  describe('update meeting title', () => {
    it('successfully updates the title', async () => {
      expect.hasAssertions();

      const username = (await UserName.create(faker.random.alphaNumeric(6))).unwrap();
      const email = (await UserEmail.create(faker.internet.email())).unwrap();
      const fullName = (await UserFullName.create(faker.name.findName())).unwrap();
      const meetingID = MeetingID.create();
      const joinedMeetingOn = dayjs().subtract(1, 'minute').toDate();
      const meetingStartsAt = dayjs().add(2, 'day').toDate();
      const oldMeetingTitle = (await MeetingTitle.create(faker.random.alphaNumeric(50))).unwrap();
      const isOrganizer = true;

      const attendee = Attendee.create({
        username,
        email,
        fullName,
        meetingID,
        joinedMeetingOn,
        meetingStartsAt,
        meetingTitle: oldMeetingTitle,
        isOrganizer,
      }).unwrap();

      const newMeetingTitle = (await MeetingTitle.create(faker.random.alphaNumeric(30))).unwrap();
      const updated = attendee.setMeetingTitle(newMeetingTitle);
      expect(updated.isErr()).toBe(false);
      expect(attendee.meetingTitle).toBe(newMeetingTitle);
    });
  });
});
