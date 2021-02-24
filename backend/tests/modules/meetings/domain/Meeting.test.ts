import dayjs from 'dayjs';
import faker from '@tests/support/faker';
import { Attendees } from '@meetings/domain/Attendees';
import { Meeting } from '@meetings/domain/Meeting';
import { ValidationError } from '@src/shared/core/AppError';
import { UniqueID } from '@src/shared/domain/uniqueId';
import { MeetingAddress } from '@meetings/domain/MeetingAddress';
import { MeetingAvailableSeats } from '@meetings/domain/MeetingAvailableSeats';
import { MeetingCategory } from '@meetings/domain/MeetingCategory';
import { MeetingDescription } from '@meetings/domain/MeetingDescription';
import { MeetingPlace } from '@meetings/domain/MeetingPlace';
import { MeetingRemainingSeats } from '@meetings/domain/MeetingRemainingSeats';
import { MeetingChanged } from '@meetings/domain/events/MeetingChanged';
import { MeetingTitle } from '@meetings/domain/MeetingTitle';
import { UserName } from '@users/domain/UserName';
import {
  MeetingAlreadyStarted,
  MeetingFullyBooked,
  MeetingStartingDateInvalid,
  OrganizerCannotLeaveError,
  RemoteMeetingCannotHaveAddress,
} from '@meetings/errors/MeetingErrors';

describe('Meeting AggregateRoot', () => {
  describe('create new meeting', () => {
    it('should create a new valid remote meeting given all args', async () => {
      expect.hasAssertions();

      const title = (await MeetingTitle.create(faker.random.alphaNumeric(50))).unwrap();
      const description = (await MeetingDescription.create(faker.lorem.paragraphs(6))).unwrap();
      const category = (await MeetingCategory.create('Social')).unwrap();
      const startsAt: Date = dayjs().add(2, 'day').toDate();
      const place = (await MeetingPlace.create('Remote')).unwrap();
      const createdBy = (await UserName.create(faker.random.alphaNumeric(10))).unwrap();
      const attendeesList = [
        createdBy,
        (await UserName.create(faker.random.alphaNumeric(14))).unwrap(),
      ];
      const attendees = Attendees.create(attendeesList).unwrap();
      const createdAt = new Date('2021-02-10T06:11:56+00:00');
      const remainingSeats = (await MeetingRemainingSeats.create(3)).unwrap();
      const availableSeats = (await MeetingAvailableSeats.create(5)).unwrap();

      const meetingRes = await Meeting.create({
        title,
        description,
        category,
        startsAt,
        place,
        attendees,
        createdBy,
        createdAt,
        remainingSeats,
        availableSeats,
      });

      expect(meetingRes.isErr()).toBe(false);
      expect(meetingRes.unwrap()).toBeInstanceOf(Meeting);
      expect(meetingRes.unwrap().id).toBeTruthy();
      expect(meetingRes.unwrap().title).toBe(title);
      expect(meetingRes.unwrap().description).toBe(description);
      expect(meetingRes.unwrap().category).toBe(category);
      expect(meetingRes.unwrap().startsAt).toBe(startsAt);
      expect(meetingRes.unwrap().place).toBe(place);
      expect(meetingRes.unwrap().isPhysical).toBe(false);
      expect(meetingRes.unwrap().isRemote).toBe(true);
      expect(meetingRes.unwrap().createdBy).toBe(createdBy);
      expect(meetingRes.unwrap().attendees).toBe(attendees);
      expect(meetingRes.unwrap().createdAt).toBe(createdAt);
      expect(meetingRes.unwrap().remainingSeats).toBe(remainingSeats);
      expect(meetingRes.unwrap().availableSeats).toBe(availableSeats);

      // Events
      expect(meetingRes.unwrap().domainEvents).toHaveLength(2);
      expect(meetingRes.unwrap().domainEvents).toContainEqual(
        expect.objectContaining({
          meeting: meetingRes.unwrap(),
        })
      );
      expect(meetingRes.unwrap().domainEvents).toContainEqual(
        expect.objectContaining({
          meeting: meetingRes.unwrap(),
          username: createdBy,
          isOrganizer: true,
        })
      );
    });

    it('should create a new valid physical meeting given all args', async () => {
      expect.hasAssertions();

      const title = (await MeetingTitle.create(faker.random.alphaNumeric(50))).unwrap();
      const description = (await MeetingDescription.create(faker.lorem.paragraphs(6))).unwrap();
      const category = (await MeetingCategory.create('Social')).unwrap();
      const startsAt: Date = dayjs().add(2, 'day').toDate();
      const place = (await MeetingPlace.create('Finland, Tampere')).unwrap();
      const address = (await MeetingAddress.create(faker.address.streetAddress(true))).unwrap();
      const createdBy = (await UserName.create(faker.random.alphaNumeric(10))).unwrap();
      const attendeesList = [
        createdBy,
        (await UserName.create(faker.random.alphaNumeric(14))).unwrap(),
      ];
      const attendees = Attendees.create(attendeesList).unwrap();
      const createdAt = new Date('2021-02-10T06:11:56+00:00');
      const remainingSeats = (await MeetingRemainingSeats.create(3)).unwrap();
      const availableSeats = (await MeetingAvailableSeats.create(5)).unwrap();

      const meetingRes = await Meeting.create({
        title,
        description,
        category,
        startsAt,
        place,
        address,
        attendees,
        createdBy,
        createdAt,
        remainingSeats,
        availableSeats,
      });

      expect(meetingRes.isErr()).toBe(false);
      expect(meetingRes.unwrap()).toBeInstanceOf(Meeting);
      expect(meetingRes.unwrap().id).toBeTruthy();
      expect(meetingRes.unwrap().title).toBe(title);
      expect(meetingRes.unwrap().description).toBe(description);
      expect(meetingRes.unwrap().category).toBe(category);
      expect(meetingRes.unwrap().startsAt).toBe(startsAt);
      expect(meetingRes.unwrap().place).toBe(place);
      expect(meetingRes.unwrap().isPhysical).toBe(true);
      expect(meetingRes.unwrap().isRemote).toBe(false);
      expect(meetingRes.unwrap().createdBy).toBe(createdBy);
      expect(meetingRes.unwrap().attendees).toBe(attendees);
      expect(meetingRes.unwrap().createdAt).toBe(createdAt);
      expect(meetingRes.unwrap().remainingSeats).toBe(remainingSeats);
      expect(meetingRes.unwrap().availableSeats).toBe(availableSeats);

      // Events
      expect(meetingRes.unwrap().domainEvents).toHaveLength(2);
      expect(meetingRes.unwrap().domainEvents).toContainEqual(
        expect.objectContaining({
          meeting: meetingRes.unwrap(),
        })
      );
      expect(meetingRes.unwrap().domainEvents).toContainEqual(
        expect.objectContaining({
          meeting: meetingRes.unwrap(),
          username: createdBy,
          isOrganizer: true,
        })
      );
    });

    it('should create a new valid remote meeting given only mandatory args', async () => {
      expect.hasAssertions();

      const title = (await MeetingTitle.create(faker.random.alphaNumeric(50))).unwrap();
      const description = (await MeetingDescription.create(faker.lorem.paragraphs(6))).unwrap();
      const category = (await MeetingCategory.create('Social')).unwrap();
      const startsAt: Date = dayjs().add(2, 'day').toDate();
      const place = (await MeetingPlace.create('Remote')).unwrap();
      const createdBy = (await UserName.create(faker.random.alphaNumeric(10))).unwrap();
      const availableSeats = (await MeetingAvailableSeats.create(5)).unwrap();

      const meetingRes = await Meeting.create({
        title,
        description,
        category,
        startsAt,
        place,
        createdBy,
        availableSeats,
      });

      expect(meetingRes.isErr()).toBe(false);
      expect(meetingRes.unwrap()).toBeInstanceOf(Meeting);
      expect(meetingRes.unwrap().id).toBeTruthy();
      expect(meetingRes.unwrap().title).toBe(title);
      expect(meetingRes.unwrap().description).toBe(description);
      expect(meetingRes.unwrap().category).toBe(category);
      expect(meetingRes.unwrap().startsAt).toBe(startsAt);
      expect(meetingRes.unwrap().place).toBe(place);
      expect(meetingRes.unwrap().isPhysical).toBe(false);
      expect(meetingRes.unwrap().isRemote).toBe(true);
      expect(meetingRes.unwrap().createdBy).toBe(createdBy);
      expect(meetingRes.unwrap().attendees).toBeInstanceOf(Attendees);
      expect(meetingRes.unwrap().attendees.has(createdBy)).toBe(true);
      expect(meetingRes.unwrap().attendees.count).toBe(1);
      expect(meetingRes.unwrap().createdAt).toBeInstanceOf(Date);
      expect(meetingRes.unwrap().remainingSeats.value).toBe(4);
      expect(meetingRes.unwrap().availableSeats).toBe(availableSeats);

      // Events
      expect(meetingRes.unwrap().domainEvents).toHaveLength(2);
      expect(meetingRes.unwrap().domainEvents).toContainEqual(
        expect.objectContaining({
          meeting: meetingRes.unwrap(),
        })
      );
      expect(meetingRes.unwrap().domainEvents).toContainEqual(
        expect.objectContaining({
          meeting: meetingRes.unwrap(),
          username: createdBy,
          isOrganizer: true,
        })
      );
    });

    it('should create a new valid physical meeting given only mandatory args', async () => {
      expect.hasAssertions();

      const title = (await MeetingTitle.create(faker.random.alphaNumeric(50))).unwrap();
      const description = (await MeetingDescription.create(faker.lorem.paragraphs(6))).unwrap();
      const category = (await MeetingCategory.create('Social')).unwrap();
      const startsAt: Date = dayjs().add(2, 'day').toDate();
      const place = (await MeetingPlace.create('Finland, Tampere')).unwrap();
      const address = (await MeetingAddress.create(faker.address.streetAddress(true))).unwrap();
      const createdBy = (await UserName.create(faker.random.alphaNumeric(10))).unwrap();
      const availableSeats = (await MeetingAvailableSeats.create(5)).unwrap();

      const meetingRes = await Meeting.create({
        title,
        description,
        category,
        startsAt,
        place,
        address,
        createdBy,
        availableSeats,
      });

      expect(meetingRes.isErr()).toBe(false);
      expect(meetingRes.unwrap()).toBeInstanceOf(Meeting);
      expect(meetingRes.unwrap().id).toBeTruthy();
      expect(meetingRes.unwrap().title).toBe(title);
      expect(meetingRes.unwrap().description).toBe(description);
      expect(meetingRes.unwrap().category).toBe(category);
      expect(meetingRes.unwrap().startsAt).toBe(startsAt);
      expect(meetingRes.unwrap().place).toBe(place);
      expect(meetingRes.unwrap().isPhysical).toBe(true);
      expect(meetingRes.unwrap().isRemote).toBe(false);
      expect(meetingRes.unwrap().address).toBe(address);
      expect(meetingRes.unwrap().createdBy).toBe(createdBy);
      expect(meetingRes.unwrap().attendees).toBeInstanceOf(Attendees);
      expect(meetingRes.unwrap().attendees.has(createdBy)).toBe(true);
      expect(meetingRes.unwrap().attendees.count).toBe(1);
      expect(meetingRes.unwrap().createdAt).toBeInstanceOf(Date);
      expect(meetingRes.unwrap().remainingSeats.value).toBe(4);
      expect(meetingRes.unwrap().availableSeats).toBe(availableSeats);

      // Events
      expect(meetingRes.unwrap().domainEvents).toHaveLength(2);
      expect(meetingRes.unwrap().domainEvents).toContainEqual(
        expect.objectContaining({
          meeting: meetingRes.unwrap(),
        })
      );
      expect(meetingRes.unwrap().domainEvents).toContainEqual(
        expect.objectContaining({
          meeting: meetingRes.unwrap(),
          username: createdBy,
          isOrganizer: true,
        })
      );
    });

    it('should recreate an existing meeting given mandatory args and an id', async () => {
      expect.hasAssertions();

      const id = new UniqueID();
      const title = (await MeetingTitle.create(faker.random.alphaNumeric(50))).unwrap();
      const description = (await MeetingDescription.create(faker.lorem.paragraphs(6))).unwrap();
      const category = (await MeetingCategory.create('Social')).unwrap();
      const startsAt: Date = dayjs().add(2, 'day').toDate();
      const place = (await MeetingPlace.create('Finland, Tampere')).unwrap();
      const address = (await MeetingAddress.create(faker.address.streetAddress(true))).unwrap();
      const createdBy = (await UserName.create(faker.random.alphaNumeric(10))).unwrap();
      const availableSeats = (await MeetingAvailableSeats.create(5)).unwrap();

      const meetingRes = await Meeting.create(
        {
          title,
          description,
          category,
          startsAt,
          place,
          address,
          createdBy,
          availableSeats,
        },
        id
      );

      expect(meetingRes.isErr()).toBe(false);
      expect(meetingRes.unwrap()).toBeInstanceOf(Meeting);
      expect(meetingRes.unwrap().id.id).toBe(id);
      expect(meetingRes.unwrap().title).toBe(title);
      expect(meetingRes.unwrap().description).toBe(description);
      expect(meetingRes.unwrap().category).toBe(category);
      expect(meetingRes.unwrap().startsAt).toBe(startsAt);
      expect(meetingRes.unwrap().place).toBe(place);
      expect(meetingRes.unwrap().isPhysical).toBe(true);
      expect(meetingRes.unwrap().isRemote).toBe(false);
      expect(meetingRes.unwrap().address).toBe(address);
      expect(meetingRes.unwrap().createdBy).toBe(createdBy);
      expect(meetingRes.unwrap().attendees).toBeInstanceOf(Attendees);
      expect(meetingRes.unwrap().attendees.has(createdBy)).toBe(true);
      expect(meetingRes.unwrap().attendees.count).toBe(1);
      expect(meetingRes.unwrap().createdAt).toBeInstanceOf(Date);
      expect(meetingRes.unwrap().remainingSeats.value).toBe(4);
      expect(meetingRes.unwrap().availableSeats).toBe(availableSeats);
    });

    it('should return a valid already-existing meeting with a startedAt date in the past', async () => {
      expect.hasAssertions();

      const id = new UniqueID();
      const title = (await MeetingTitle.create(faker.random.alphaNumeric(50))).unwrap();
      const description = (await MeetingDescription.create(faker.lorem.paragraphs(6))).unwrap();
      const category = (await MeetingCategory.create('Social')).unwrap();
      const startsAt: Date = dayjs().subtract(1, 'day').toDate();
      const place = (await MeetingPlace.create('Finland, Tampere')).unwrap();
      const address = (await MeetingAddress.create(faker.address.streetAddress(true))).unwrap();
      const createdBy = (await UserName.create(faker.random.alphaNumeric(10))).unwrap();
      const availableSeats = (await MeetingAvailableSeats.create(5)).unwrap();

      const meetingRes = await Meeting.create(
        {
          title,
          description,
          category,
          startsAt,
          place,
          address,
          createdBy,
          availableSeats,
        },
        id
      );

      expect(meetingRes.isErr()).toBe(false);
      expect(meetingRes.unwrap()).toBeInstanceOf(Meeting);
      expect(meetingRes.unwrap().id.id).toBe(id);
      expect(meetingRes.unwrap().title).toBe(title);
      expect(meetingRes.unwrap().description).toBe(description);
      expect(meetingRes.unwrap().category).toBe(category);
      expect(meetingRes.unwrap().startsAt).toBe(startsAt);
      expect(meetingRes.unwrap().place).toBe(place);
      expect(meetingRes.unwrap().isPhysical).toBe(true);
      expect(meetingRes.unwrap().isRemote).toBe(false);
      expect(meetingRes.unwrap().address).toBe(address);
      expect(meetingRes.unwrap().createdBy).toBe(createdBy);
      expect(meetingRes.unwrap().attendees).toBeInstanceOf(Attendees);
      expect(meetingRes.unwrap().attendees.has(createdBy)).toBe(true);
      expect(meetingRes.unwrap().attendees.count).toBe(1);
      expect(meetingRes.unwrap().createdAt).toBeInstanceOf(Date);
      expect(meetingRes.unwrap().remainingSeats.value).toBe(4);
      expect(meetingRes.unwrap().availableSeats).toBe(availableSeats);
    });

    it('should return an error given a startedAt date in the past for a new meeting', async () => {
      expect.hasAssertions();

      const title = (await MeetingTitle.create(faker.random.alphaNumeric(50))).unwrap();
      const description = (await MeetingDescription.create(faker.lorem.paragraphs(6))).unwrap();
      const category = (await MeetingCategory.create('Social')).unwrap();
      const startsAt: Date = dayjs().subtract(1, 'day').toDate();
      const place = (await MeetingPlace.create('Finland, Tampere')).unwrap();
      const address = (await MeetingAddress.create(faker.address.streetAddress(true))).unwrap();
      const createdBy = (await UserName.create(faker.random.alphaNumeric(10))).unwrap();
      const availableSeats = (await MeetingAvailableSeats.create(5)).unwrap();

      const meetingRes = await Meeting.create({
        title,
        description,
        category,
        startsAt,
        place,
        address,
        createdBy,
        availableSeats,
      });

      expect(meetingRes.isErr()).toBe(true);
      expect(meetingRes.unwrapErr()).toBeInstanceOf(MeetingStartingDateInvalid);
      expect(meetingRes.unwrapErr().type).toBe('MeetingStartingDateInvalid');
    });

    it('should return an error object for a remote meeting with an address', async () => {
      expect.hasAssertions();

      const title = (await MeetingTitle.create(faker.random.alphaNumeric(50))).unwrap();
      const description = (await MeetingDescription.create(faker.lorem.paragraphs(6))).unwrap();
      const category = (await MeetingCategory.create('Social')).unwrap();
      const startsAt: Date = dayjs().add(2, 'day').toDate();
      const place = (await MeetingPlace.create('Remote')).unwrap();
      const address = (await MeetingAddress.create(faker.address.streetAddress(true))).unwrap();
      const createdBy = (await UserName.create(faker.random.alphaNumeric(10))).unwrap();
      const availableSeats = (await MeetingAvailableSeats.create(5)).unwrap();

      const meetingRes = await Meeting.create({
        title,
        description,
        category,
        startsAt,
        place,
        address,
        createdBy,
        availableSeats,
      });

      expect(meetingRes.isErr()).toBe(true);
      expect(meetingRes.unwrapErr()).toBeInstanceOf(RemoteMeetingCannotHaveAddress);
      expect(meetingRes.unwrapErr().type).toBe('RemoteMeetingCannotHaveAddress');
    });

    it('should return an error object for a physical meeting without an address', async () => {
      expect.hasAssertions();

      const title = (await MeetingTitle.create(faker.random.alphaNumeric(50))).unwrap();
      const description = (await MeetingDescription.create(faker.lorem.paragraphs(6))).unwrap();
      const category = (await MeetingCategory.create('Social')).unwrap();
      const startsAt: Date = dayjs().add(2, 'day').toDate();
      const place = (await MeetingPlace.create('Finland, Tampere')).unwrap();
      const createdBy = (await UserName.create(faker.random.alphaNumeric(10))).unwrap();
      const availableSeats = (await MeetingAvailableSeats.create(5)).unwrap();

      const meetingRes = await Meeting.create({
        title,
        description,
        category,
        startsAt,
        place,
        createdBy,
        availableSeats,
      });

      expect(meetingRes.isErr()).toBe(true);
      expect(meetingRes.unwrapErr()).toBeInstanceOf(ValidationError);
      expect(meetingRes.unwrapErr().type).toBe('ValidationError');
      expect(meetingRes.unwrapErr().message).toBe(
        'A venue address has to be provided for the meeting'
      );
    });
  });

  describe('add a new attendee', () => {
    it('successfully adds the attendee if seats available', async () => {
      expect.hasAssertions();

      const title = (await MeetingTitle.create(faker.random.alphaNumeric(50))).unwrap();
      const description = (await MeetingDescription.create(faker.lorem.paragraphs(6))).unwrap();
      const category = (await MeetingCategory.create('Social')).unwrap();
      const startsAt: Date = dayjs().add(2, 'day').toDate();
      const place = (await MeetingPlace.create('Remote')).unwrap();
      const createdBy = (await UserName.create(faker.random.alphaNumeric(10))).unwrap();
      const availableSeats = (await MeetingAvailableSeats.create(5)).unwrap();

      const newAttendee = (await UserName.create(faker.random.alphaNumeric(16))).unwrap();

      const meeting = (
        await Meeting.create({
          title,
          description,
          category,
          startsAt,
          place,
          createdBy,
          availableSeats,
        })
      ).unwrap();

      // Simulates transaction taking place by clearing the event queue
      meeting.clearEvents();

      const added = await meeting.addAttendee(newAttendee);

      expect(added.isErr()).toBe(false);
      expect(meeting.attendees.count).toBe(2);
      expect(meeting.attendees.has(newAttendee)).toBe(true);
      expect(meeting.remainingSeats.value).toBe(3);

      // Events
      expect(meeting.domainEvents).toHaveLength(1);
      expect(meeting.domainEvents).toContainEqual(
        expect.objectContaining({
          meeting,
          username: newAttendee,
          isOrganizer: false,
        })
      );
    });

    it('returns an error if the meeting is already started', async () => {
      expect.hasAssertions();

      const id = new UniqueID();
      const title = (await MeetingTitle.create(faker.random.alphaNumeric(50))).unwrap();
      const description = (await MeetingDescription.create(faker.lorem.paragraphs(6))).unwrap();
      const category = (await MeetingCategory.create('Social')).unwrap();
      const startsAt: Date = dayjs().subtract(1, 'day').toDate();
      const place = (await MeetingPlace.create('Remote')).unwrap();
      const createdBy = (await UserName.create(faker.random.alphaNumeric(10))).unwrap();
      const availableSeats = (await MeetingAvailableSeats.create(5)).unwrap();

      const newAttendee = (await UserName.create(faker.random.alphaNumeric(16))).unwrap();

      const meeting = (
        await Meeting.create(
          {
            title,
            description,
            category,
            startsAt,
            place,
            createdBy,
            availableSeats,
          },
          id
        )
      ).unwrap();

      // Simulates transaction taking place by clearing the event queue
      meeting.clearEvents();

      const added = await meeting.addAttendee(newAttendee);

      expect(added.isErr()).toBe(true);
      expect(added.unwrapErr()).toBeInstanceOf(MeetingAlreadyStarted);
      expect(added.unwrapErr().type).toBe('MeetingAlreadyStarted');
      expect(meeting.attendees.count).toBe(1);
      expect(meeting.attendees.has(newAttendee)).toBe(false);
      expect(meeting.remainingSeats.value).toBe(4);

      // Events
      expect(meeting.domainEvents).toHaveLength(0);
    });

    it('returns an error if the meeting is fully booked', async () => {
      expect.hasAssertions();

      const title = (await MeetingTitle.create(faker.random.alphaNumeric(50))).unwrap();
      const description = (await MeetingDescription.create(faker.lorem.paragraphs(6))).unwrap();
      const category = (await MeetingCategory.create('Social')).unwrap();
      const startsAt: Date = dayjs().add(2, 'day').toDate();
      const place = (await MeetingPlace.create('Remote')).unwrap();
      const createdBy = (await UserName.create(faker.random.alphaNumeric(10))).unwrap();
      const availableSeats = (await MeetingAvailableSeats.create(1)).unwrap();
      const remainingSeats = (await MeetingRemainingSeats.create(0)).unwrap(); // Fully booked

      const newAttendee = (await UserName.create(faker.random.alphaNumeric(16))).unwrap();

      const meeting = (
        await Meeting.create({
          title,
          description,
          category,
          startsAt,
          place,
          createdBy,
          availableSeats,
          remainingSeats,
        })
      ).unwrap();

      // Simulates transaction taking place by clearing the event queue
      meeting.clearEvents();

      const added = await meeting.addAttendee(newAttendee);

      expect(added.isErr()).toBe(true);
      expect(added.unwrapErr()).toBeInstanceOf(MeetingFullyBooked);
      expect(added.unwrapErr().type).toBe('MeetingFullyBooked');
      expect(meeting.attendees.count).toBe(1);
      expect(meeting.attendees.has(newAttendee)).toBe(false);
      expect(meeting.remainingSeats.value).toBe(0);

      // Events
      expect(meeting.domainEvents).toHaveLength(0);
    });

    it('returns an error if the attendee is already registered', async () => {
      expect.hasAssertions();

      const title = (await MeetingTitle.create(faker.random.alphaNumeric(50))).unwrap();
      const description = (await MeetingDescription.create(faker.lorem.paragraphs(6))).unwrap();
      const category = (await MeetingCategory.create('Social')).unwrap();
      const startsAt: Date = dayjs().add(2, 'day').toDate();
      const place = (await MeetingPlace.create('Remote')).unwrap();
      const createdBy = (await UserName.create(faker.random.alphaNumeric(10))).unwrap();
      const availableSeats = (await MeetingAvailableSeats.create(5)).unwrap();

      const meeting = (
        await Meeting.create({
          title,
          description,
          category,
          startsAt,
          place,
          createdBy,
          availableSeats,
        })
      ).unwrap();

      // Simulates transaction taking place by clearing the event queue
      meeting.clearEvents();

      const added = await meeting.addAttendee(createdBy);

      expect(added.isErr()).toBe(true);
      expect(added.unwrapErr()).toBeInstanceOf(ValidationError);
      expect(added.unwrapErr().type).toBe('ValidationError');
      expect(added.unwrapErr().message).toBe('attendee already exists');
      expect(meeting.attendees.count).toBe(1);
      expect(meeting.attendees.has(createdBy)).toBe(true);
      expect(meeting.remainingSeats.value).toBe(4);

      // Events
      expect(meeting.domainEvents).toHaveLength(0);
    });
  });

  describe('remove an attendee', () => {
    it('successfully removes the attendee', async () => {
      expect.hasAssertions();

      const title = (await MeetingTitle.create(faker.random.alphaNumeric(50))).unwrap();
      const description = (await MeetingDescription.create(faker.lorem.paragraphs(6))).unwrap();
      const category = (await MeetingCategory.create('Social')).unwrap();
      const startsAt: Date = dayjs().add(2, 'day').toDate();
      const place = (await MeetingPlace.create('Remote')).unwrap();
      const createdBy = (await UserName.create(faker.random.alphaNumeric(10))).unwrap();
      const availableSeats = (await MeetingAvailableSeats.create(5)).unwrap();
      const remainingSeats = (await MeetingRemainingSeats.create(3)).unwrap();

      const attendeetoBeRemoved = (await UserName.create(faker.random.alphaNumeric(16))).unwrap();
      const attendees = Attendees.create([attendeetoBeRemoved, createdBy]).unwrap();

      const meeting = (
        await Meeting.create({
          title,
          description,
          category,
          startsAt,
          place,
          createdBy,
          availableSeats,
          remainingSeats,
          attendees,
        })
      ).unwrap();

      // Simulates transaction taking place by clearing the event queue
      meeting.clearEvents();

      const removed = await meeting.removeAttendee(attendeetoBeRemoved);

      expect(removed.isErr()).toBe(false);
      expect(meeting.attendees.count).toBe(1);
      expect(meeting.attendees.has(attendeetoBeRemoved)).toBe(false);
      expect(meeting.remainingSeats.value).toBe(4);

      // Events
      expect(meeting.domainEvents).toHaveLength(1);
      expect(meeting.domainEvents).toContainEqual(
        expect.objectContaining({
          meeting,
          username: attendeetoBeRemoved,
        })
      );
    });

    it('returns an error if the meeting is already started', async () => {
      expect.hasAssertions();

      const id = new UniqueID();
      const title = (await MeetingTitle.create(faker.random.alphaNumeric(50))).unwrap();
      const description = (await MeetingDescription.create(faker.lorem.paragraphs(6))).unwrap();
      const category = (await MeetingCategory.create('Social')).unwrap();
      const startsAt: Date = dayjs().subtract(2, 'hour').toDate();
      const place = (await MeetingPlace.create('Remote')).unwrap();
      const createdBy = (await UserName.create(faker.random.alphaNumeric(10))).unwrap();
      const availableSeats = (await MeetingAvailableSeats.create(5)).unwrap();
      const remainingSeats = (await MeetingRemainingSeats.create(3)).unwrap();

      const attendeetoBeRemoved = (await UserName.create(faker.random.alphaNumeric(16))).unwrap();
      const attendees = Attendees.create([attendeetoBeRemoved, createdBy]).unwrap();

      const meeting = (
        await Meeting.create(
          {
            title,
            description,
            category,
            startsAt,
            place,
            createdBy,
            availableSeats,
            remainingSeats,
            attendees,
          },
          id
        )
      ).unwrap();

      // Simulates transaction taking place by clearing the event queue
      meeting.clearEvents();

      const removed = await meeting.removeAttendee(attendeetoBeRemoved);

      expect(removed.isErr()).toBe(true);
      expect(removed.unwrapErr()).toBeInstanceOf(MeetingAlreadyStarted);
      expect(removed.unwrapErr().type).toBe('MeetingAlreadyStarted');
      expect(meeting.attendees.count).toBe(2);
      expect(meeting.attendees.has(attendeetoBeRemoved)).toBe(true);
      expect(meeting.remainingSeats.value).toBe(3);

      // Events
      expect(meeting.domainEvents).toHaveLength(0);
    });

    it('returns an error if meeting organizer tries to leave', async () => {
      expect.hasAssertions();

      const id = new UniqueID();
      const title = (await MeetingTitle.create(faker.random.alphaNumeric(50))).unwrap();
      const description = (await MeetingDescription.create(faker.lorem.paragraphs(6))).unwrap();
      const category = (await MeetingCategory.create('Social')).unwrap();
      const startsAt: Date = dayjs().add(2, 'day').toDate();
      const place = (await MeetingPlace.create('Remote')).unwrap();
      const createdBy = (await UserName.create(faker.random.alphaNumeric(10))).unwrap();
      const availableSeats = (await MeetingAvailableSeats.create(5)).unwrap();
      const remainingSeats = (await MeetingRemainingSeats.create(3)).unwrap();

      const attendees = Attendees.create([
        (await UserName.create(faker.random.alphaNumeric(16))).unwrap(),
        createdBy,
      ]).unwrap();

      const meeting = (
        await Meeting.create(
          {
            title,
            description,
            category,
            startsAt,
            place,
            createdBy,
            availableSeats,
            remainingSeats,
            attendees,
          },
          id
        )
      ).unwrap();

      // Simulates transaction taking place by clearing the event queue
      meeting.clearEvents();

      const removed = await meeting.removeAttendee(createdBy);

      expect(removed.isErr()).toBe(true);
      expect(removed.unwrapErr()).toBeInstanceOf(OrganizerCannotLeaveError);
      expect(removed.unwrapErr().type).toBe('OrganizerCannotLeaveError');
      expect(meeting.attendees.count).toBe(2);
      expect(meeting.attendees.has(createdBy)).toBe(true);
      expect(meeting.remainingSeats.value).toBe(3);

      // Events
      expect(meeting.domainEvents).toHaveLength(0);
    });

    it("returns an error if such attendee doesn't exist", async () => {
      expect.hasAssertions();

      const id = new UniqueID();
      const title = (await MeetingTitle.create(faker.random.alphaNumeric(50))).unwrap();
      const description = (await MeetingDescription.create(faker.lorem.paragraphs(6))).unwrap();
      const category = (await MeetingCategory.create('Social')).unwrap();
      const startsAt: Date = dayjs().add(2, 'day').toDate();
      const place = (await MeetingPlace.create('Remote')).unwrap();
      const createdBy = (await UserName.create(faker.random.alphaNumeric(10))).unwrap();
      const availableSeats = (await MeetingAvailableSeats.create(5)).unwrap();

      const attendeetoBeRemoved = (await UserName.create(faker.random.alphaNumeric(16))).unwrap();

      const meeting = (
        await Meeting.create(
          {
            title,
            description,
            category,
            startsAt,
            place,
            createdBy,
            availableSeats,
          },
          id
        )
      ).unwrap();

      // Simulates transaction taking place by clearing the event queue
      meeting.clearEvents();

      const removed = await meeting.removeAttendee(attendeetoBeRemoved);

      expect(removed.isErr()).toBe(true);
      expect(removed.unwrapErr()).toBeInstanceOf(ValidationError);
      expect(removed.unwrapErr().type).toBe('ValidationError');
      expect(removed.unwrapErr().message).toBe('attendee was not found');
      expect(meeting.attendees.count).toBe(1);
      expect(meeting.attendees.has(createdBy)).toBe(true);
      expect(meeting.remainingSeats.value).toBe(4);

      // Events
      expect(meeting.domainEvents).toHaveLength(0);
    });
  });

  describe('update meeting title', () => {
    it('successfully updates MeetingTitle if the meeting has not started yet', async () => {
      expect.hasAssertions();

      const oldTitleString = faker.random.alphaNumeric(50);
      const oldTitle = (await MeetingTitle.create(oldTitleString)).unwrap();
      const description = (await MeetingDescription.create(faker.lorem.paragraphs(6))).unwrap();
      const category = (await MeetingCategory.create('Social')).unwrap();
      const startsAt: Date = dayjs().add(2, 'day').toDate();
      const place = (await MeetingPlace.create('Remote')).unwrap();
      const createdBy = (await UserName.create(faker.random.alphaNumeric(10))).unwrap();
      const availableSeats = (await MeetingAvailableSeats.create(5)).unwrap();

      const meeting = (
        await Meeting.create({
          title: oldTitle,
          description,
          category,
          startsAt,
          place,
          createdBy,
          availableSeats,
        })
      ).unwrap();

      // Simulates transaction taking place by clearing the event queue
      meeting.clearEvents();

      const newTitleString = faker.random.alphaNumeric(30);
      const newTitle = (await MeetingTitle.create(newTitleString)).unwrap();

      const updated = meeting.setTitle(newTitle);

      expect(updated.isErr()).toBe(false);
      expect(meeting.title).toBe(newTitle);

      // Events
      expect(meeting.domainEvents).toHaveLength(1);
      expect(meeting.domainEvents).toContainEqual(
        expect.objectContaining({
          meeting,
        })
      );
    });

    it('registers only a single MeetingChanged event during a transaction', async () => {
      expect.hasAssertions();

      const oldTitleString = faker.random.alphaNumeric(50);
      const oldTitle = (await MeetingTitle.create(oldTitleString)).unwrap();
      const description = (await MeetingDescription.create(faker.lorem.paragraphs(6))).unwrap();
      const category = (await MeetingCategory.create('Social')).unwrap();
      const startsAt: Date = dayjs().add(2, 'day').toDate();
      const place = (await MeetingPlace.create('Remote')).unwrap();
      const createdBy = (await UserName.create(faker.random.alphaNumeric(10))).unwrap();
      const availableSeats = (await MeetingAvailableSeats.create(5)).unwrap();

      const meeting = (
        await Meeting.create({
          title: oldTitle,
          description,
          category,
          startsAt,
          place,
          createdBy,
          availableSeats,
        })
      ).unwrap();

      // Simulates transaction taking place by clearing the event queue
      meeting.clearEvents();

      const newTitleString = faker.random.alphaNumeric(30);
      const newTitle = (await MeetingTitle.create(newTitleString)).unwrap();
      const updated = meeting.setTitle(newTitle);

      expect(updated.isErr()).toBe(false);

      const veryNewTitleString = faker.random.alphaNumeric(20);
      const veryNewTitle = (await MeetingTitle.create(veryNewTitleString)).unwrap();
      const newlyUpdated = meeting.setTitle(veryNewTitle);

      expect(newlyUpdated.isErr()).toBe(false);

      // Events
      expect(meeting.domainEvents).toHaveLength(1);
      expect(meeting.domainEvents[0]).toBeInstanceOf(MeetingChanged);
      expect(meeting.domainEvents).toContainEqual(
        expect.objectContaining({
          meeting,
        })
      );
    });

    it('returns an error if the meeting has already started', async () => {
      expect.hasAssertions();

      const id = new UniqueID();
      const oldTitleString = faker.random.alphaNumeric(50);
      const oldTitle = (await MeetingTitle.create(oldTitleString)).unwrap();
      const description = (await MeetingDescription.create(faker.lorem.paragraphs(6))).unwrap();
      const category = (await MeetingCategory.create('Social')).unwrap();
      const startsAt: Date = dayjs().subtract(2, 'hour').toDate();
      const place = (await MeetingPlace.create('Remote')).unwrap();
      const createdBy = (await UserName.create(faker.random.alphaNumeric(10))).unwrap();
      const availableSeats = (await MeetingAvailableSeats.create(5)).unwrap();

      const meeting = (
        await Meeting.create(
          {
            title: oldTitle,
            description,
            category,
            startsAt,
            place,
            createdBy,
            availableSeats,
          },
          id
        )
      ).unwrap();

      // Simulates transaction taking place by clearing the event queue
      meeting.clearEvents();

      const newTitleString = faker.random.alphaNumeric(30);
      const newTitle = (await MeetingTitle.create(newTitleString)).unwrap();

      const updated = meeting.setTitle(newTitle);

      expect(updated.isErr()).toBe(true);
      expect(updated.unwrapErr()).toBeInstanceOf(MeetingAlreadyStarted);
      expect(meeting.title).toBe(oldTitle);

      // Events
      expect(meeting.domainEvents).toHaveLength(0);
    });
  });

  describe('update meeting description', () => {
    it('successfully updates MeetingDescription if the meeting has not started yet', async () => {
      expect.hasAssertions();

      const oldDescriptionString = faker.lorem.paragraphs(6);
      const title = (await MeetingTitle.create(faker.random.alphaNumeric(50))).unwrap();
      const oldDescription = (await MeetingDescription.create(oldDescriptionString)).unwrap();
      const category = (await MeetingCategory.create('Social')).unwrap();
      const startsAt: Date = dayjs().add(2, 'day').toDate();
      const place = (await MeetingPlace.create('Remote')).unwrap();
      const createdBy = (await UserName.create(faker.random.alphaNumeric(10))).unwrap();
      const availableSeats = (await MeetingAvailableSeats.create(5)).unwrap();

      const meeting = (
        await Meeting.create({
          title,
          description: oldDescription,
          category,
          startsAt,
          place,
          createdBy,
          availableSeats,
        })
      ).unwrap();

      // Simulates transaction taking place by clearing the event queue
      meeting.clearEvents();

      const newDescString = faker.random.alphaNumeric(30);
      const newDesc = (await MeetingDescription.create(newDescString)).unwrap();

      const updated = meeting.setDescription(newDesc);

      expect(updated.isErr()).toBe(false);
      expect(meeting.description).toBe(newDesc);

      // Events
      expect(meeting.domainEvents).toHaveLength(1);
      expect(meeting.domainEvents[0]).toBeInstanceOf(MeetingChanged);
      expect(meeting.domainEvents).toContainEqual(
        expect.objectContaining({
          meeting,
        })
      );
    });

    it('registers only a single MeetingChanged event during a transaction', async () => {
      expect.hasAssertions();

      const oldDescriptionString = faker.lorem.paragraphs(6);
      const title = (await MeetingTitle.create(faker.random.alphaNumeric(50))).unwrap();
      const oldDescription = (await MeetingDescription.create(oldDescriptionString)).unwrap();
      const category = (await MeetingCategory.create('Social')).unwrap();
      const startsAt: Date = dayjs().add(2, 'day').toDate();
      const place = (await MeetingPlace.create('Remote')).unwrap();
      const createdBy = (await UserName.create(faker.random.alphaNumeric(10))).unwrap();
      const availableSeats = (await MeetingAvailableSeats.create(5)).unwrap();

      const meeting = (
        await Meeting.create({
          title,
          description: oldDescription,
          category,
          startsAt,
          place,
          createdBy,
          availableSeats,
        })
      ).unwrap();

      // Simulates transaction taking place by clearing the event queue
      meeting.clearEvents();

      const newDescString = faker.random.alphaNumeric(30);
      const newDesc = (await MeetingDescription.create(newDescString)).unwrap();
      const updated = meeting.setDescription(newDesc);

      expect(updated.isErr()).toBe(false);

      const veryNewDescString = faker.random.alphaNumeric(30);
      const veryNewDesc = (await MeetingDescription.create(veryNewDescString)).unwrap();
      const newlyUpdated = meeting.setDescription(veryNewDesc);

      expect(newlyUpdated.isErr()).toBe(false);

      // Events
      expect(meeting.domainEvents).toHaveLength(1);
      expect(meeting.domainEvents[0]).toBeInstanceOf(MeetingChanged);
      expect(meeting.domainEvents).toContainEqual(
        expect.objectContaining({
          meeting,
        })
      );
    });

    it('returns an error if the meeting has already started', async () => {
      expect.hasAssertions();

      const id = new UniqueID();
      const oldDescriptionString = faker.lorem.paragraphs(6);
      const title = (await MeetingTitle.create(faker.random.alphaNumeric(50))).unwrap();
      const oldDescription = (await MeetingDescription.create(oldDescriptionString)).unwrap();
      const category = (await MeetingCategory.create('Social')).unwrap();
      const startsAt: Date = dayjs().subtract(2, 'hour').toDate();
      const place = (await MeetingPlace.create('Remote')).unwrap();
      const createdBy = (await UserName.create(faker.random.alphaNumeric(10))).unwrap();
      const availableSeats = (await MeetingAvailableSeats.create(5)).unwrap();

      const meeting = (
        await Meeting.create(
          {
            title,
            description: oldDescription,
            category,
            startsAt,
            place,
            createdBy,
            availableSeats,
          },
          id
        )
      ).unwrap();

      // Simulates transaction taking place by clearing the event queue
      meeting.clearEvents();

      const newDescString = faker.random.alphaNumeric(30);
      const newDesc = (await MeetingDescription.create(newDescString)).unwrap();

      const updated = meeting.setDescription(newDesc);

      expect(updated.isErr()).toBe(true);
      expect(updated.unwrapErr()).toBeInstanceOf(MeetingAlreadyStarted);
      expect(meeting.description).toBe(oldDescription);

      // Events
      expect(meeting.domainEvents).toHaveLength(0);
    });
  });

  describe('update meeting category', () => {
    it('successfully updates MeetingCategory if the meeting has not started yet', async () => {
      expect.hasAssertions();

      const title = (await MeetingTitle.create(faker.random.alphaNumeric(50))).unwrap();
      const description = (await MeetingDescription.create(faker.lorem.paragraphs(6))).unwrap();
      const oldCategory = (await MeetingCategory.create('Social')).unwrap();
      const startsAt: Date = dayjs().add(2, 'day').toDate();
      const place = (await MeetingPlace.create('Remote')).unwrap();
      const createdBy = (await UserName.create(faker.random.alphaNumeric(10))).unwrap();
      const availableSeats = (await MeetingAvailableSeats.create(5)).unwrap();

      const meeting = (
        await Meeting.create({
          title,
          description,
          category: oldCategory,
          startsAt,
          place,
          createdBy,
          availableSeats,
        })
      ).unwrap();

      // Simulates transaction taking place by clearing the event queue
      meeting.clearEvents();

      const newCategory = (await MeetingCategory.create('Technology')).unwrap();

      const updated = meeting.setCategory(newCategory);

      expect(updated.isErr()).toBe(false);
      expect(meeting.category).toBe(newCategory);

      // Events
      expect(meeting.domainEvents).toHaveLength(1);
      expect(meeting.domainEvents[0]).toBeInstanceOf(MeetingChanged);
      expect(meeting.domainEvents).toContainEqual(
        expect.objectContaining({
          meeting,
        })
      );
    });

    it('registers only a single MeetingChanged event during a transaction', async () => {
      expect.hasAssertions();

      const title = (await MeetingTitle.create(faker.random.alphaNumeric(50))).unwrap();
      const description = (await MeetingDescription.create(faker.lorem.paragraphs(6))).unwrap();
      const oldCategory = (await MeetingCategory.create('Social')).unwrap();
      const startsAt: Date = dayjs().add(2, 'day').toDate();
      const place = (await MeetingPlace.create('Remote')).unwrap();
      const createdBy = (await UserName.create(faker.random.alphaNumeric(10))).unwrap();
      const availableSeats = (await MeetingAvailableSeats.create(5)).unwrap();

      const meeting = (
        await Meeting.create({
          title,
          description,
          category: oldCategory,
          startsAt,
          place,
          createdBy,
          availableSeats,
        })
      ).unwrap();

      // Simulates transaction taking place by clearing the event queue
      meeting.clearEvents();

      const newCategory = (await MeetingCategory.create('Technology')).unwrap();
      const updated = meeting.setCategory(newCategory);

      expect(updated.isErr()).toBe(false);

      const veryNewCategory = (await MeetingCategory.create('Social')).unwrap();
      const newlyUpdated = meeting.setCategory(veryNewCategory);

      expect(newlyUpdated.isErr()).toBe(false);

      // Events
      expect(meeting.domainEvents).toHaveLength(1);
      expect(meeting.domainEvents[0]).toBeInstanceOf(MeetingChanged);
      expect(meeting.domainEvents).toContainEqual(
        expect.objectContaining({
          meeting,
        })
      );
    });

    it('returns an error if the meeting has already started', async () => {
      expect.hasAssertions();

      const id = new UniqueID();
      const title = (await MeetingTitle.create(faker.random.alphaNumeric(50))).unwrap();
      const description = (await MeetingDescription.create(faker.lorem.paragraphs(6))).unwrap();
      const oldCategory = (await MeetingCategory.create('Social')).unwrap();
      const startsAt: Date = dayjs().subtract(2, 'hour').toDate();
      const place = (await MeetingPlace.create('Remote')).unwrap();
      const createdBy = (await UserName.create(faker.random.alphaNumeric(10))).unwrap();
      const availableSeats = (await MeetingAvailableSeats.create(5)).unwrap();

      const meeting = (
        await Meeting.create(
          {
            title,
            description,
            category: oldCategory,
            startsAt,
            place,
            createdBy,
            availableSeats,
          },
          id
        )
      ).unwrap();

      // Simulates transaction taking place by clearing the event queue
      meeting.clearEvents();

      const newCategory = (await MeetingCategory.create('Technology')).unwrap();

      const updated = meeting.setCategory(newCategory);

      expect(updated.isErr()).toBe(true);
      expect(updated.unwrapErr()).toBeInstanceOf(MeetingAlreadyStarted);
      expect(meeting.category).toBe(oldCategory);

      // Events
      expect(meeting.domainEvents).toHaveLength(0);
    });
  });

  describe('update meeting start time', () => {
    it('successfully updates startsAt if the meeting has not started yet', async () => {
      expect.hasAssertions();

      const title = (await MeetingTitle.create(faker.random.alphaNumeric(50))).unwrap();
      const description = (await MeetingDescription.create(faker.lorem.paragraphs(6))).unwrap();
      const category = (await MeetingCategory.create('Social')).unwrap();
      const oldStartsAt: Date = dayjs().add(2, 'day').toDate();
      const place = (await MeetingPlace.create('Remote')).unwrap();
      const createdBy = (await UserName.create(faker.random.alphaNumeric(10))).unwrap();
      const availableSeats = (await MeetingAvailableSeats.create(5)).unwrap();

      const meeting = (
        await Meeting.create({
          title,
          description,
          category,
          startsAt: oldStartsAt,
          place,
          createdBy,
          availableSeats,
        })
      ).unwrap();

      // Simulates transaction taking place by clearing the event queue
      meeting.clearEvents();

      const newStartsAt = dayjs().add(5, 'day').toDate();

      const updated = meeting.setStartsAt(newStartsAt);

      expect(updated.isErr()).toBe(false);
      expect(meeting.startsAt).toBe(newStartsAt);

      // Events
      expect(meeting.domainEvents).toHaveLength(1);
      expect(meeting.domainEvents[0]).toBeInstanceOf(MeetingChanged);
      expect(meeting.domainEvents).toContainEqual(
        expect.objectContaining({
          meeting,
        })
      );
    });

    it('registers only a single MeetingChanged event during a transaction', async () => {
      expect.hasAssertions();

      const title = (await MeetingTitle.create(faker.random.alphaNumeric(50))).unwrap();
      const description = (await MeetingDescription.create(faker.lorem.paragraphs(6))).unwrap();
      const category = (await MeetingCategory.create('Social')).unwrap();
      const oldStartsAt: Date = dayjs().add(2, 'day').toDate();
      const place = (await MeetingPlace.create('Remote')).unwrap();
      const createdBy = (await UserName.create(faker.random.alphaNumeric(10))).unwrap();
      const availableSeats = (await MeetingAvailableSeats.create(5)).unwrap();

      const meeting = (
        await Meeting.create({
          title,
          description,
          category,
          startsAt: oldStartsAt,
          place,
          createdBy,
          availableSeats,
        })
      ).unwrap();

      // Simulates transaction taking place by clearing the event queue
      meeting.clearEvents();

      const newStartsAt = dayjs().add(5, 'day').toDate();
      const updated = meeting.setStartsAt(newStartsAt);

      expect(updated.isErr()).toBe(false);

      const veryNewStartsAt = dayjs().add(5, 'day').toDate();
      const newlyUpdated = meeting.setStartsAt(veryNewStartsAt);

      expect(newlyUpdated.isErr()).toBe(false);

      // Events
      expect(meeting.domainEvents).toHaveLength(1);
      expect(meeting.domainEvents[0]).toBeInstanceOf(MeetingChanged);
      expect(meeting.domainEvents).toContainEqual(
        expect.objectContaining({
          meeting,
        })
      );
    });

    it('returns an error if the meeting has already started', async () => {
      expect.hasAssertions();

      const id = new UniqueID();
      const title = (await MeetingTitle.create(faker.random.alphaNumeric(50))).unwrap();
      const description = (await MeetingDescription.create(faker.lorem.paragraphs(6))).unwrap();
      const category = (await MeetingCategory.create('Social')).unwrap();
      const oldStartsAt: Date = dayjs().subtract(2, 'hour').toDate();
      const place = (await MeetingPlace.create('Remote')).unwrap();
      const createdBy = (await UserName.create(faker.random.alphaNumeric(10))).unwrap();
      const availableSeats = (await MeetingAvailableSeats.create(5)).unwrap();

      const meeting = (
        await Meeting.create(
          {
            title,
            description,
            category,
            startsAt: oldStartsAt,
            place,
            createdBy,
            availableSeats,
          },
          id
        )
      ).unwrap();

      // Simulates transaction taking place by clearing the event queue
      meeting.clearEvents();

      const newStartsAt = dayjs().add(2, 'hour').toDate();

      const updated = meeting.setStartsAt(newStartsAt);

      expect(updated.isErr()).toBe(true);
      expect(updated.unwrapErr()).toBeInstanceOf(MeetingAlreadyStarted);
      expect(updated.unwrapErr().type).toBe('MeetingAlreadyStarted');
      expect(meeting.startsAt).toBe(oldStartsAt);

      // Events
      expect(meeting.domainEvents).toHaveLength(0);
    });

    it('returns an error if the new start time is invalid', async () => {
      expect.hasAssertions();

      const id = new UniqueID();
      const title = (await MeetingTitle.create(faker.random.alphaNumeric(50))).unwrap();
      const description = (await MeetingDescription.create(faker.lorem.paragraphs(6))).unwrap();
      const category = (await MeetingCategory.create('Social')).unwrap();
      const oldStartsAt: Date = dayjs().add(2, 'day').toDate();
      const place = (await MeetingPlace.create('Remote')).unwrap();
      const createdBy = (await UserName.create(faker.random.alphaNumeric(10))).unwrap();
      const availableSeats = (await MeetingAvailableSeats.create(5)).unwrap();

      const meeting = (
        await Meeting.create(
          {
            title,
            description,
            category,
            startsAt: oldStartsAt,
            place,
            createdBy,
            availableSeats,
          },
          id
        )
      ).unwrap();

      // Simulates transaction taking place by clearing the event queue
      meeting.clearEvents();

      const newStartsAt = dayjs().subtract(2, 'hour').toDate();

      const updated = meeting.setStartsAt(newStartsAt);

      expect(updated.isErr()).toBe(true);
      expect(updated.unwrapErr()).toBeInstanceOf(MeetingStartingDateInvalid);
      expect(updated.unwrapErr().type).toBe('MeetingStartingDateInvalid');
      expect(meeting.startsAt).toBe(oldStartsAt);

      // Events
      expect(meeting.domainEvents).toHaveLength(0);
    });
  });

  describe('update meeting address', () => {
    it('successfully updates MeetingAddress if the meeting has not started yet', async () => {
      expect.hasAssertions();

      const title = (await MeetingTitle.create(faker.random.alphaNumeric(50))).unwrap();
      const description = (await MeetingDescription.create(faker.lorem.paragraphs(6))).unwrap();
      const category = (await MeetingCategory.create('Social')).unwrap();
      const startsAt: Date = dayjs().add(2, 'day').toDate();
      const place = (await MeetingPlace.create('Finland, Tampere')).unwrap();
      const address = (await MeetingAddress.create(faker.address.streetAddress(true))).unwrap();
      const createdBy = (await UserName.create(faker.random.alphaNumeric(10))).unwrap();
      const availableSeats = (await MeetingAvailableSeats.create(5)).unwrap();

      const meeting = (
        await Meeting.create({
          title,
          description,
          category,
          startsAt,
          place,
          address,
          createdBy,
          availableSeats,
        })
      ).unwrap();

      // Simulates transaction taking place by clearing the event queue
      meeting.clearEvents();

      const newAddress = (await MeetingAddress.create(faker.address.streetAddress(true))).unwrap();

      const updated = meeting.setAddress(newAddress);

      expect(updated.isErr()).toBe(false);
      expect(meeting.address).toBe(newAddress);

      // Events
      expect(meeting.domainEvents).toHaveLength(1);
      expect(meeting.domainEvents[0]).toBeInstanceOf(MeetingChanged);
      expect(meeting.domainEvents).toContainEqual(
        expect.objectContaining({
          meeting,
        })
      );
    });

    it('registers only a single MeetingChanged event during a transaction', async () => {
      expect.hasAssertions();

      const title = (await MeetingTitle.create(faker.random.alphaNumeric(50))).unwrap();
      const description = (await MeetingDescription.create(faker.lorem.paragraphs(6))).unwrap();
      const category = (await MeetingCategory.create('Social')).unwrap();
      const startsAt: Date = dayjs().add(2, 'day').toDate();
      const place = (await MeetingPlace.create('Finland, Tampere')).unwrap();
      const address = (await MeetingAddress.create(faker.address.streetAddress(true))).unwrap();
      const createdBy = (await UserName.create(faker.random.alphaNumeric(10))).unwrap();
      const availableSeats = (await MeetingAvailableSeats.create(5)).unwrap();

      const meeting = (
        await Meeting.create({
          title,
          description,
          category,
          startsAt,
          place,
          address,
          createdBy,
          availableSeats,
        })
      ).unwrap();

      // Simulates transaction taking place by clearing the event queue
      meeting.clearEvents();

      const newAddress = (await MeetingAddress.create(faker.address.streetAddress(true))).unwrap();
      const updated = meeting.setAddress(newAddress);

      expect(updated.isErr()).toBe(false);

      const veryNewAddress = (
        await MeetingAddress.create(faker.address.streetAddress(true))
      ).unwrap();
      const newlyUpdated = meeting.setAddress(veryNewAddress);

      expect(newlyUpdated.isErr()).toBe(false);

      // Events
      expect(meeting.domainEvents).toHaveLength(1);
      expect(meeting.domainEvents[0]).toBeInstanceOf(MeetingChanged);
      expect(meeting.domainEvents).toContainEqual(
        expect.objectContaining({
          meeting,
        })
      );
    });

    it('returns an error if the meeting has already started', async () => {
      expect.hasAssertions();

      const id = new UniqueID();
      const title = (await MeetingTitle.create(faker.random.alphaNumeric(50))).unwrap();
      const description = (await MeetingDescription.create(faker.lorem.paragraphs(6))).unwrap();
      const category = (await MeetingCategory.create('Social')).unwrap();
      const startsAt: Date = dayjs().subtract(2, 'hour').toDate();
      const place = (await MeetingPlace.create('Finland, Tampere')).unwrap();
      const oldAddress = (await MeetingAddress.create(faker.address.streetAddress(true))).unwrap();
      const createdBy = (await UserName.create(faker.random.alphaNumeric(10))).unwrap();
      const availableSeats = (await MeetingAvailableSeats.create(5)).unwrap();

      const meeting = (
        await Meeting.create(
          {
            title,
            description,
            category,
            startsAt,
            place,
            address: oldAddress,
            createdBy,
            availableSeats,
          },
          id
        )
      ).unwrap();

      // Simulates transaction taking place by clearing the event queue
      meeting.clearEvents();

      const newAddress = (await MeetingAddress.create(faker.address.streetAddress(true))).unwrap();

      const updated = meeting.setAddress(newAddress);

      expect(updated.isErr()).toBe(true);
      expect(updated.unwrapErr()).toBeInstanceOf(MeetingAlreadyStarted);
      expect(updated.unwrapErr().type).toBe('MeetingAlreadyStarted');
      expect(meeting.address).toBe(oldAddress);

      // Events
      expect(meeting.domainEvents).toHaveLength(0);
    });

    it('returns an error when setting an address for a remote meeting', async () => {
      expect.hasAssertions();

      const title = (await MeetingTitle.create(faker.random.alphaNumeric(50))).unwrap();
      const description = (await MeetingDescription.create(faker.lorem.paragraphs(6))).unwrap();
      const category = (await MeetingCategory.create('Social')).unwrap();
      const startsAt: Date = dayjs().add(2, 'day').toDate();
      const place = (await MeetingPlace.create('Remote')).unwrap();
      const createdBy = (await UserName.create(faker.random.alphaNumeric(10))).unwrap();
      const availableSeats = (await MeetingAvailableSeats.create(5)).unwrap();

      const meeting = (
        await Meeting.create({
          title,
          description,
          category,
          startsAt,
          place,
          createdBy,
          availableSeats,
        })
      ).unwrap();

      // Simulates transaction taking place by clearing the event queue
      meeting.clearEvents();

      const newAddress = (await MeetingAddress.create(faker.address.streetAddress(true))).unwrap();

      const updated = meeting.setAddress(newAddress);

      expect(updated.isErr()).toBe(true);
      expect(updated.unwrapErr()).toBeInstanceOf(RemoteMeetingCannotHaveAddress);
      expect(updated.unwrapErr().type).toBe('RemoteMeetingCannotHaveAddress');

      // Events
      expect(meeting.domainEvents).toHaveLength(0);
    });
  });
});
