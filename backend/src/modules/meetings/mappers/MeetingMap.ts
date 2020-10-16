import moment from 'moment';
import { AttributeMap, PutItemInputAttributeMap } from 'aws-sdk/clients/dynamodb';
import { Meeting } from '@meetings/domain/Meeting';
import { UserName } from '@src/modules/users/domain/UserName';
import { UniqueID } from '@src/shared/domain/uniqueId';
import { MeetingAvailableSeats } from '@meetings/domain/MeetingAvailableSeats';
import { MeetingDescription } from '@meetings/domain/MeetingDescription';
import { MeetingRemainingSeats } from '@meetings/domain/MeetingRemainingSeats';
import { MeetingTitle } from '@meetings/domain/MeetingTitle';

export class MeetingMap {
  public static async dynamoToDomain(raw: AttributeMap): Promise<Meeting> {
    const id = new UniqueID(raw.PK.S);
    const title = (await MeetingTitle.create(raw.Title.S)).unwrap();
    const description = (await MeetingDescription.create(raw.Description.S)).unwrap();
    const startsAt = new Date(raw.GSI1SK.S);
    const createdBy = (await UserName.create(raw.GSI2PK.S.split('#')[0])).unwrap();
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
        startsAt,
        createdBy,
        remainingSeats,
        availableSeats,
      },
      id
    );

    return meeting.unwrap();
  }

  public static toDynamoFull(meeting: Meeting): PutItemInputAttributeMap {
    const startsAt = moment(meeting.startsAt);
    return {
      PK: { S: meeting.id.id.toString() },
      SK: { S: 'META' },
      GSI1PK: { S: `${startsAt.year()}-${startsAt.month()}#MEETINGS` },
      GSI1SK: { S: meeting.startsAt.toISOString() },
      GSI2PK: { S: `${meeting.createdBy.value}#MEETINGS` },
      GSI2SK: { S: meeting.startsAt.toISOString() },
      Title: { S: meeting.title.value },
      Description: { S: meeting.description.value },
      RemainingSeats: { N: meeting.remainingSeats.value.toString() },
      AvailableSeats: { N: meeting.availableSeats.value.toString() },
    };
  }
}