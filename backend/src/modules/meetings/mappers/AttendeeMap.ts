import { AttributeMap, PutItemInputAttributeMap } from 'aws-sdk/clients/dynamodb';
import { Attendee } from '@meetings/domain/Attendee';
import { UserFullName } from '@users/domain/UserFullName';
import { UniqueID } from '@src/shared/domain/uniqueId';
import { UserName } from '@users/domain/UserName';
import { MeetingID } from '@meetings/domain/MeetingID';
import { MeetingTitle } from '@meetings/domain/MeetingTitle';
import { UserEmail } from '@src/modules/users/domain/UserEmail';

export class AttendeeMap {
  public static async dynamoToDomain(raw: AttributeMap): Promise<Attendee> {
    const rawUserName = raw.GSI1PK?.S.split('#')[0] || raw.SK?.S.split('#')[1];
    const username = (await UserName.create(rawUserName)).unwrap();

    const email = (await UserEmail.create(raw.Email.S)).unwrap();

    const rawMeetingID = raw.PK.S.split('#')[0];
    const meetingID = MeetingID.create(new UniqueID(rawMeetingID));

    const fullName = (await UserFullName.create(raw.FullName.S)).unwrap();
    const joinedMeetingOn = new Date(raw.GSI2SK.S);
    const meetingStartsAt = new Date(raw.GSI1SK.S);
    const meetingTitle = (await MeetingTitle.create(raw.Title.S)).unwrap();
    const isOrganizer = raw.IsOrganizer ? !!raw.IsOrganizer.BOOL : false;

    return Attendee.create({
      username,
      email,
      meetingID,
      joinedMeetingOn,
      fullName,
      isOrganizer,
      meetingStartsAt,
      meetingTitle,
    }).unwrap();
  }

  public static toDynamoFull(attendee: Attendee, version: number): PutItemInputAttributeMap {
    return {
      PK: { S: `${attendee.meetingID.id.toString()}#ATTENDEES` },
      SK: { S: attendee.username.value },
      GSI1PK: { S: `${attendee.username.value}#MEETINGS` },
      GSI1SK: { S: attendee.meetingStartsAt.toISOString() },
      GSI2PK: { S: attendee.meetingID.id.toString() },
      GSI2SK: { S: attendee.joinedMeetingOn.toISOString() },
      Title: { S: attendee.meetingTitle.value },
      FullName: { S: attendee.fullName.value },
      Email: { S: attendee.email.value },
      IsOrganizer: { BOOL: attendee.isOrganizer },
      Version: { N: version.toString() },
    };
  }
}
