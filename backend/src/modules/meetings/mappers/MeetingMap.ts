import { Meeting } from '@meetings/domain/Meeting';
import { UserName } from '@src/modules/users/domain/UserName';
import { UniqueID } from '@src/shared/domain/uniqueId';
import { MeetingAvailableSeats } from '@meetings/domain/MeetingAvailableSeats';
import { MeetingDescription } from '@meetings/domain/MeetingDescription';
import { MeetingRemainingSeats } from '@meetings/domain/MeetingRemainingSeats';
import { MeetingTitle } from '@meetings/domain/MeetingTitle';
import { PutItemInputAttributeMap } from 'aws-sdk/clients/dynamodb';
import moment from 'moment';

export interface RawMeetingProps {
  id: string;
  title: string;
  description: string;
  startsAt: string;
  createdBy: string;
  remainingSeats: number;
  availableSeats: number;
}

export class MeetingMap {
  public static async toDomain(raw: RawMeetingProps): Promise<Meeting> {
    const id = new UniqueID(raw.id);
    const title = (await MeetingTitle.create(raw.title)).unwrap();
    const description = (await MeetingDescription.create(raw.description)).unwrap();
    const startsAt = new Date(raw.startsAt);
    const createdBy = (await UserName.create(raw.createdBy)).unwrap();
    const availableSeats = (await MeetingAvailableSeats.create(raw.availableSeats)).unwrap();
    const remainingSeats = (await MeetingRemainingSeats.create(raw.remainingSeats)).unwrap();

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
