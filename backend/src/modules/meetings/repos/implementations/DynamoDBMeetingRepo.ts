import moment from 'moment';
import DynamoDB, {
  GetItemInput,
  GetItemOutput,
  Key,
  PutItemInputAttributeMap,
  TransactWriteItemList,
} from 'aws-sdk/clients/dynamodb';
import { DDBConfigProps, DDBTables } from '@src/shared/infra/dynamodb/dynamodb';
import { Meeting } from '@meetings/domain/Meeting';
import { Attendee } from '@meetings/domain/Attendee';
import { UnexpectedError } from '@src/shared/core/AppError';
import { MeetingID } from '@meetings/domain/MeetingID';
import { MeetingMap } from '@meetings/mappers/MeetingMap';
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
    items.push({
      Put: {
        TableName: this.tables.MainTable,
        Item: MeetingMap.toDynamoFull(meeting),
        ConditionExpression: 'attribute_not_exists(#PK)',
        ExpressionAttributeNames: {
          '#PK': 'PK',
        },
      },
    });

    // Attendees item(s)
    meeting.attendees.getNewItems().forEach((attendee: Attendee) => {
      const attendeeItem: PutItemInputAttributeMap = {
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
      throw UnexpectedError.wrap(error, 'Failed to create new meeting item(s)');
    }
  }

  async updateAttendees(meeting: Meeting): Promise<void> {
    const items: TransactWriteItemList = [];

    // a negative number indicates seats getting reserved while a positive number indicates seats getting freed
    const changeInSeats: number =
      meeting.attendees.getRemovedItems().length - meeting.attendees.getNewItems().length;

    // Meeting item
    const meetingKey: PutItemInputAttributeMap = {
      PK: { S: meeting.id.id.toString() },
      SK: { S: 'META' },
    };
    items.push({
      Update: {
        TableName: this.tables.MainTable,
        Key: meetingKey,
        UpdateExpression: 'SET #RemainingSeats = #RemainingSeats + :ChangeInSeats',
        ConditionExpression:
          '#PK = :PK AND #SK = :SK AND (:IncreaseInSeats = :TRUEVAL OR (#RemainingSeats >= :RequiredCapacity))',
        ExpressionAttributeValues: {
          ':PK': meetingKey.PK,
          ':SK': meetingKey.SK,
          ':TRUEVAL': {
            BOOL: true,
          },
          ':RequiredCapacity': {
            N: (-changeInSeats).toString(),
          },
          ':IncreaseInSeats': {
            BOOL: changeInSeats > 0,
          },
          ':ChangeInSeats': {
            N: changeInSeats.toString(),
          },
        },
        ExpressionAttributeNames: {
          '#PK': 'PK',
          '#SK': 'SK',
          '#RemainingSeats': 'RemainingSeats',
        },
      },
    });

    // Attendees to add
    meeting.attendees.getNewItems().forEach((attendee: Attendee) => {
      const attendeeItem: PutItemInputAttributeMap = {
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

    // Attendees to remove
    meeting.attendees.getRemovedItems().forEach((attendee: Attendee) => {
      const attendeeKey: Key = {
        PK: { S: meeting.id.id.toString() },
        SK: { S: `ATTENDEE#${attendee.joinedMeetingOn.toISOString()}` },
      };
      items.push({
        Delete: {
          TableName: this.tables.MainTable,
          Key: attendeeKey,
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
      throw UnexpectedError.wrap(error, 'Failed to update new meeting with latest attendees');
    }
  }

  async fetchMeetingByID(meetingID: MeetingID): Promise<Meeting> {
    const input: GetItemInput = {
      TableName: this.tables.MainTable,
      Key: {
        PK: { S: meetingID.id.toString() },
        SK: { S: 'META' },
      },
    };

    let queryResult: GetItemOutput;
    try {
      queryResult = await this.client.getItem(input).promise();
    } catch (error) {
      throw UnexpectedError.wrap(error, `Failed to fetch meeting(#${meetingID.id.toString()})`);
    }

    return MeetingMap.toDomain({
      id: meetingID.id.toString(),
      title: queryResult.Item.Title.S,
      description: queryResult.Item.Description.S,
      startsAt: queryResult.Item.GSI1SK.S,
      createdBy: queryResult.Item.GSI2PK.S.split('#')[0],
      remainingSeats: Number(queryResult.Item.RemainingSeats.N),
      availableSeats: Number(queryResult.Item.AvailableSeats.N),
    });
  }
}
