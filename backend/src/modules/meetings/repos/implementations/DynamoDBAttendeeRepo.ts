import DynamoDB, {
  DeleteItemInput,
  PutItemInput,
  QueryInput,
  QueryOutput,
} from 'aws-sdk/clients/dynamodb';
import { DDBConfigProps, DDBTables } from '@src/shared/infra/dynamodb/dynamodb';
import { UnexpectedError } from '@src/shared/core/AppError';
import { UserName } from '@users/domain/UserName';
import { MeetingID } from '@meetings/domain/MeetingID';
import { Attendee } from '@meetings/domain/Attendee';
import { AttendeeMap } from '@meetings/mappers/AttendeeMap';
import { AttendeeNotFoundError } from '@meetings/errors/AttendeeErrors';
import { AttendeeDetails } from '@meetings/domain/AttendeeDetails';
import { AttendeeDetailsMap } from '@meetings/mappers/AttendeeDetailsMap';
import { EventPublisher } from '@src/shared/domain/EventPublisher';
import { AttendeeRepo } from '../AttendeeRepo';

export class DynamoDBAttendeeRepo implements AttendeeRepo {
  private client: DynamoDB;

  private tables: DDBTables;

  constructor(config: DDBConfigProps) {
    this.client = config.Client;
    this.tables = config.Tables;
  }

  async save(attendee: Attendee, currentVersion = 0): Promise<void> {
    const item: PutItemInput = {
      TableName: this.tables.MainTable,
      Item: AttendeeMap.toDynamoFull(attendee, currentVersion + 1),
      ConditionExpression: 'attribute_not_exists(#PK) OR #Version = :CurVersion',
      ExpressionAttributeNames: {
        '#PK': 'PK',
        '#Version': 'Version',
      },
      ExpressionAttributeValues: {
        ':CurVersion': { N: currentVersion.toString() },
      },
    };

    try {
      await this.client.putItem(item).promise();
      await EventPublisher.dispatchAggregateEvents(attendee);
    } catch (error) {
      throw UnexpectedError.wrap(
        error,
        `Failed to persist Attendee(${
          attendee.username.value
        }@Version-${currentVersion}) for Meeting(${attendee.meetingID.id.toString()})`
      );
    }
  }

  async remove(username: UserName, meetingID: MeetingID): Promise<void> {
    const item: DeleteItemInput = {
      TableName: this.tables.MainTable,
      Key: {
        PK: { S: `${meetingID.id.toString()}#ATTENDEES` },
        SK: { S: username.value },
      },
    };

    try {
      await this.client.deleteItem(item).promise();
    } catch (error) {
      throw UnexpectedError.wrap(
        error,
        `Failed to remove Attendee(${username.value}) for Meeting(${meetingID.id.toString()})`
      );
    }
  }

  async exists(username: UserName, meetingID: MeetingID): Promise<boolean> {
    const input: QueryInput = {
      TableName: this.tables.MainTable,
      Select: 'COUNT',
      Limit: 1,
      KeyConditionExpression: '#PK = :PK AND begins_with(#SK, :SK)',
      ExpressionAttributeNames: {
        '#PK': 'PK',
        '#SK': 'SK',
      },
      ExpressionAttributeValues: {
        ':PK': {
          S: `${meetingID.id.toString()}#ATTENDEES`,
        },
        ':SK': {
          S: username.value,
        },
      },
    };

    let queryResult: QueryOutput;
    try {
      queryResult = await this.client.query(input).promise();
    } catch (error) {
      throw UnexpectedError.wrap(
        error,
        `Failed to fetch attendee(${username.value}) of meeting(${meetingID.id.toString()})`
      );
    }

    return queryResult.Count === 1;
  }

  async fetch(username: UserName, meetingID: MeetingID): Promise<[Attendee, number]> {
    const input: QueryInput = {
      TableName: this.tables.MainTable,
      Limit: 1,
      KeyConditionExpression: '#PK = :PK AND #SK = :SK',
      ExpressionAttributeNames: {
        '#PK': 'PK',
        '#SK': 'SK',
      },
      ExpressionAttributeValues: {
        ':PK': {
          S: `${meetingID.id.toString()}#ATTENDEES`,
        },
        ':SK': {
          S: username.value,
        },
      },
      ConsistentRead: true,
    };

    let queryResult: QueryOutput;
    try {
      queryResult = await this.client.query(input).promise();
    } catch (error) {
      throw UnexpectedError.wrap(
        error,
        `Failed to fetch attendee(${username.value}) of meeting(${meetingID.id.toString()})`
      );
    }

    if (queryResult.Count !== 1) throw AttendeeNotFoundError.create();

    return [
      await AttendeeMap.dynamoToDomain(queryResult.Items[0]),
      Number(queryResult.Items[0].Version.N),
    ];
  }

  async fetchAllByMeetingID(meetingID: MeetingID): Promise<AttendeeDetails[]> {
    const input: QueryInput = {
      TableName: this.tables.MainTable,
      Limit: 12,
      KeyConditionExpression: '#PK = :PK',
      ExpressionAttributeNames: {
        '#PK': 'PK',
      },
      ExpressionAttributeValues: {
        ':PK': {
          S: `${meetingID.id.toString()}#ATTENDEES`,
        },
      },
    };

    let queryResult: QueryOutput;
    try {
      queryResult = await this.client.query(input).promise();
    } catch (error) {
      throw UnexpectedError.wrap(
        error,
        `Failed to fetch attendees of meeting(${meetingID.id.toString()})`
      );
    }

    return queryResult.Items.map((item) => AttendeeDetailsMap.dynamoToDomain(item));
  }
}
