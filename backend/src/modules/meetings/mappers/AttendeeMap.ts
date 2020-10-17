import { AttributeMap, PutItemInputAttributeMap } from 'aws-sdk/clients/dynamodb';
import { Attendee } from '@meetings/domain/Attendee';
import { Meeting } from '@meetings/domain/Meeting';
import { UserFullName } from '@src/modules/users/domain/UserFullName';
import { UniqueID } from '@src/shared/domain/uniqueId';
import { UserName } from '@src/modules/users/domain/UserName';
import { MeetingID } from '@meetings/domain/MeetingID';

export class AttendeeMap {
  public static async dynamoToDomain(raw: AttributeMap): Promise<Attendee> {
    const rawUserName = raw.GSI1PK?.S.split('#')[0] || raw.GSI2SK?.S.split('#')[1];
    const username = (await UserName.create(rawUserName)).unwrap();

    const rawMeetingID = raw.PK?.S || raw.GSI2PK?.S;
    const meetingID = MeetingID.create(new UniqueID(rawMeetingID));

    const fullName = (await UserFullName.create(raw.FullName.S)).unwrap();
    const joinedMeetingOn = new Date(raw.SK.S.split('#')[1]);
    const isOrganizer = raw.IsOrganizer ? !!raw.IsOrganizer.BOOL : false;

    return Attendee.create({
      username,
      meetingID,
      joinedMeetingOn,
      fullName,
      isOrganizer,
    }).unwrap();
  }

  public static toDynamoFull(attendee: Attendee, meeting: Meeting): PutItemInputAttributeMap {
    return {
      PK: { S: meeting.id.id.toString() },
      SK: { S: `ATTENDEE#${attendee.joinedMeetingOn.toISOString()}` },
      GSI1PK: { S: `${attendee.username.value}#MEETINGS` },
      GSI1SK: { S: meeting.startsAt.toISOString() },
      GSI2PK: { S: meeting.id.id.toString() },
      GSI2SK: { S: `ATTENDEE#${attendee.username.value}` },
      Title: { S: meeting.title.value },
      FullName: { S: attendee.fullName.value },
      IsOrganizer: { BOOL: attendee.isOrganizer },
    };
  }
}
