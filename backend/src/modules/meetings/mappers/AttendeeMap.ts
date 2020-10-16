import { PutItemInputAttributeMap } from 'aws-sdk/clients/dynamodb';
import { Attendee } from '@meetings/domain/Attendee';
import { Meeting } from '@meetings/domain/Meeting';

export class AttendeeMap {
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
