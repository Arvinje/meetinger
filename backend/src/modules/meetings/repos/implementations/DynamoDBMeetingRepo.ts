import DynamoDB, {
  GetItemInput,
  GetItemOutput,
  PutItemInput,
  QueryInput,
  QueryOutput,
} from 'aws-sdk/clients/dynamodb';
import { DDBConfigProps, DDBTables } from '@src/shared/infra/dynamodb/dynamodb';
import { Meeting } from '@meetings/domain/Meeting';
import { UnexpectedError } from '@src/shared/core/AppError';
import { MeetingID } from '@meetings/domain/MeetingID';
import { MeetingMap } from '@meetings/mappers/MeetingMap';
import { MeetingNotFoundError } from '@meetings/errors/MeetingErrors';
import { MeetingItemView } from '@meetings/domain/MeetingItemView';
import { MeetingCategory } from '@meetings/domain/MeetingCategory';
import { MeetingLocation } from '@meetings/domain/MeetingLocation';
import { MeetingItemViewMap } from '@meetings/mappers/MeetingItemViewMap';
import { MeetingRepo } from '../MeetingRepo';

export class DynamoDBMeetingRepo implements MeetingRepo {
  private client: DynamoDB;

  private tables: DDBTables;

  constructor(config: DDBConfigProps) {
    this.client = config.Client;
    this.tables = config.Tables;
  }

  public async save(meeting: Meeting, currentVersion = 0): Promise<void> {
    const item: PutItemInput = {
      TableName: this.tables.MainTable,
      Item: MeetingMap.toDynamoFull(meeting, currentVersion + 1),
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
    } catch (error) {
      throw UnexpectedError.wrap(
        error,
        `Failed to persist meeting(${meeting.id.id.toString()}@Version-${currentVersion})`
      );
    }
  }

  async fetchMeetingByID(meetingID: MeetingID): Promise<[Meeting, number]> {
    const input: GetItemInput = {
      TableName: this.tables.MainTable,
      Key: {
        PK: { S: meetingID.id.toString() },
        SK: { S: 'META' },
      },
      ConsistentRead: true,
    };

    let queryResult: GetItemOutput;
    try {
      queryResult = await this.client.getItem(input).promise();
    } catch (error) {
      throw UnexpectedError.wrap(error, `Failed to fetch meeting(#${meetingID.id.toString()})`);
    }

    if (!queryResult.Item) throw MeetingNotFoundError.create();

    return [await MeetingMap.dynamoToDomain(queryResult.Item), Number(queryResult.Item.Version.N)];
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
