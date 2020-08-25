import moment from 'moment';
import DynamoDB, {
  PutItemInputAttributeMap,
  TransactWriteItemList,
} from 'aws-sdk/clients/dynamodb';
import { DDBConfigProps, DDBTables } from '@src/shared/infra/dynamodb/dynamodb';
import { DynamoDBError } from '@src/utils/errors';
import { Meeting } from '@meetings/domain/Meeting';
import { Attendee } from '@meetings/domain/Attendee';
import { MeetingRepo } from '../MeetingRepo';

export class DynamoDBMeetingRepo implements MeetingRepo {
  private client: DynamoDB;

  private tables: DDBTables;

  constructor(config: DDBConfigProps) {
    this.client = config.Client;
    this.tables = config.Tables;
  }

  async create(meeting: Meeting): Promise<void> {
    const items: TransactWriteItemList = [];

    // Meeting item
    const startsAt = moment(meeting.startsAt);
    const meetingItem: PutItemInputAttributeMap = {
      PK: { S: meeting.id.id.toString() },
      SK: { S: 'META' },
      GSI1PK: { S: `${startsAt.year}-${startsAt.month}#MEETINGS` },
      GSI1SK: { S: meeting.startsAt.toISOString() },
      Title: { S: meeting.title.value },
    };
    items.push({
      Put: {
        TableName: this.tables.MainTable,
        Item: meetingItem,
        ConditionExpression: 'attribute_not_exists(#PK)',
        ExpressionAttributeNames: {
          '#PK': 'PK',
        },
      },
    });

    // Attendees item(s)
    meeting.attendees.forEach((attendee: Attendee) => {
      const attendeeItem: PutItemInputAttributeMap = {
        PK: { S: meeting.id.id.toString() },
        SK: { S: `USER#${attendee.joinedMeetingOn.toISOString()}` },
        GSI1PK: { S: `USER#${attendee.username.value}#MEETINGS` },
        GSI1SK: { S: meeting.startsAt.toISOString() },
        Title: { S: meeting.title.value },
      };
      items.push({
        Put: {
          TableName: this.tables.MainTable,
          Item: attendeeItem,
          ConditionExpression: 'attribute_not_exists(#PK)',
          ExpressionAttributeNames: {
            '#PK': 'PK',
          },
        },
      });
    });

    try {
      await this.client
        .transactWriteItems({
          TransactItems: items,
        })
        .promise();
    } catch (error) {
      throw new DynamoDBError(error, 'failed to create new meeting item(s)');
    }
  }
}
