import DynamoDB, {
  GetItemInput,
  GetItemOutput,
  Key,
  QueryInput,
  QueryOutput,
  TransactWriteItemList,
} from 'aws-sdk/clients/dynamodb';
import { DDBConfigProps, DDBTables } from '@src/shared/infra/dynamodb/dynamodb';
import { Meeting } from '@meetings/domain/Meeting';
import { Attendee } from '@meetings/domain/Attendee';
import { UnexpectedError } from '@src/shared/core/AppError';
import { MeetingID } from '@meetings/domain/MeetingID';
import { MeetingMap } from '@meetings/mappers/MeetingMap';
import { AttendeeMap } from '@meetings/mappers/AttendeeMap';
import { MeetingView } from '@meetings/domain/MeetingView';
import { MeetingViewMap } from '@meetings/mappers/MeetingViewMap';
import { MeetingNotFoundError } from '@meetings/errors/MeetingErrors';
import { MeetingRepo } from '../MeetingRepo';
import { MeetingItemView } from '../../domain/MeetingItemView';
import { MeetingCategory } from '../../domain/MeetingCategory';
import { MeetingLocation } from '../../domain/MeetingLocation';
import { MeetingItemViewMap } from '../../mappers/MeetingItemViewMap';

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
      items.push({
        Put: {
          TableName: this.tables.MainTable,
          Item: AttendeeMap.toDynamoFull(attendee, meeting),
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
    const meetingKey: Key = {
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
      items.push({
        Put: {
          TableName: this.tables.MainTable,
          Item: AttendeeMap.toDynamoFull(attendee, meeting),
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

    if (!queryResult.Item) throw MeetingNotFoundError.create();

    return MeetingMap.dynamoToDomain(queryResult.Item);
  }

  async fetchMeetingView(meetingID: MeetingID): Promise<MeetingView> {
    const input: QueryInput = {
      TableName: this.tables.MainTable,
      KeyConditionExpression: '#PK = :PK',
      ScanIndexForward: false,
      ExpressionAttributeNames: {
        '#PK': 'PK',
      },
      ExpressionAttributeValues: {
        ':PK': {
          S: meetingID.id.toString(),
        },
      },
    };

    let queryResult: QueryOutput;
    try {
      queryResult = await this.client.query(input).promise();
    } catch (error) {
      throw UnexpectedError.wrap(error, `Failed to fetch meeting(#${meetingID.id.toString()})`);
    }

    if (queryResult.Count < 2) throw MeetingNotFoundError.create();

    return MeetingViewMap.dynamoToDomain(queryResult.Items);
  }

  async fetchMeetingItemViews(
    location: MeetingLocation,
    month: string,
    category?: MeetingCategory
  ): Promise<MeetingItemView[]> {
    const input: QueryInput = {
      TableName: this.tables.MainTable,
      IndexName: 'GSI1',
      KeyConditionExpression: '#GSI1PK = :GSI1PK',
      ScanIndexForward: true,
      ExpressionAttributeNames: {
        '#GSI1PK': 'GSI1PK',
      },
      ExpressionAttributeValues: {
        ':GSI1PK': {
          S: `${location.value}#${month}#MEETINGS`,
        },
      },
    };

    if (category) {
      input.KeyConditionExpression += ' AND begins_with(#GSI1SK, :CATEGORY)';
      input.ExpressionAttributeNames = {
        ...input.ExpressionAttributeNames,
        '#GSI1SK': 'GSI1SK',
      };
      input.ExpressionAttributeValues = {
        ...input.ExpressionAttributeValues,
        ':CATEGORY': {
          S: category.value,
        },
      };
    }

    let queryResult: QueryOutput;
    try {
      queryResult = await this.client.query(input).promise();
    } catch (error) {
      throw UnexpectedError.wrap(
        error,
        `Failed to list meetings at ${location.value} in ${month}${
          category ? ` tagged ${category.value}` : ''
        }`
      );
    }

    return queryResult.Items.map((item) => MeetingItemViewMap.dynamoToDomain(item));
  }
}
