import dayjs from 'dayjs';
import { AttributeMap, PutItemInputAttributeMap } from 'aws-sdk/clients/dynamodb';
import { Meeting } from '@meetings/domain/Meeting';
import { UniqueID } from '@src/shared/domain/uniqueId';
import { UserName } from '@users/domain/UserName';
import { MeetingAvailableSeats } from '@meetings/domain/MeetingAvailableSeats';
import { MeetingDescription } from '@meetings/domain/MeetingDescription';
import { MeetingTitle } from '@meetings/domain/MeetingTitle';
import { MeetingPlace } from '@meetings/domain/MeetingPlace';
import { MeetingCategory } from '@meetings/domain/MeetingCategory';
import { MeetingRemainingSeats } from '@meetings/domain/MeetingRemainingSeats';
import { Attendees } from '@meetings/domain/Attendees';
import { MeetingAddress } from '@meetings/domain/MeetingAddress';

export class MeetingMap {
  public static async dynamoToDomain(raw: AttributeMap): Promise<Meeting> {
    const id = new UniqueID(raw.PK.S);
    const title = (await MeetingTitle.create(raw.Title.S)).unwrap();
    const description = (await MeetingDescription.create(raw.Description.S)).unwrap();

    const [rawCategory, rawStartsAt] = raw.GSI1SK.S.split('#');
    const category = (await MeetingCategory.create(rawCategory)).unwrap();

    const startsAt = new Date(rawStartsAt);
    const place = (await MeetingPlace.create(raw.GSI1PK.S.split('#')[0])).unwrap();
    const createdBy = (await UserName.create(raw.GSI2PK.S.split('#')[0])).unwrap();

    let address: MeetingAddress;
    if (place.isPhysical) {
      address = (await MeetingAddress.create(raw.Address.S)).unwrap();
    }

    const usernames = await Promise.all(
      raw.Attendees.SS.map(async (us: string) => (await UserName.create(us)).unwrap())
    );
    const attendees = Attendees.create(usernames).unwrap();

    const availableSeats = (
      await MeetingAvailableSeats.create(Number(raw.AvailableSeats.N))
    ).unwrap();
    const remainingSeats = (
      await MeetingRemainingSeats.create(Number(raw.RemainingSeats.N))
    ).unwrap();

    const meeting = await Meeting.create(
      {
        title,
        description,
        category,
        startsAt,
        place,
        address,
        createdBy,
        attendees,
        remainingSeats,
        availableSeats,
      },
      id
    );

    return meeting.unwrap();
  }

  public static toDynamoFull(meeting: Meeting, version: number): PutItemInputAttributeMap {
    const startsAt = dayjs(meeting.startsAt);
    let input: PutItemInputAttributeMap = {
      PK: { S: meeting.id.id.toString() },
      SK: { S: 'META' },
      GSI1PK: { S: `${meeting.place.value}#${startsAt.format('YYYY-MM')}#MEETINGS` },
      GSI1SK: { S: `${meeting.category.value}#${meeting.startsAt.toISOString()}` },
      GSI2PK: { S: `${meeting.createdBy.value}#MEETINGS` },
      GSI2SK: { S: meeting.startsAt.toISOString() },
      Title: { S: meeting.title.value },
      Description: { S: meeting.description.value },
      Attendees: { SS: meeting.attendees.value.map((u: UserName) => u.value) },
      RemainingSeats: { N: meeting.remainingSeats.value.toString() },
      AvailableSeats: { N: meeting.availableSeats.value.toString() },
      Version: { N: version.toString() },
    };

    if (meeting.address) {
      input = { ...input, Address: { S: meeting.address.value } };
    }

    return input;
  }
}
