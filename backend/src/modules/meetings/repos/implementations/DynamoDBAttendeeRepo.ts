import DynamoDB, { QueryInput, QueryOutput } from 'aws-sdk/clients/dynamodb';
import { DDBConfigProps, DDBTables } from '@src/shared/infra/dynamodb/dynamodb';
import { UnexpectedError } from '@src/shared/core/AppError';
import { UserName } from '@src/modules/users/domain/UserName';
import { MeetingID } from '@meetings/domain/MeetingID';
import { AttendeeRepo } from '../AttendeeRepo';

export class DynamoDBAttendeeRepo implements AttendeeRepo {
  private client: DynamoDB;

  private tables: DDBTables;

  constructor(config: DDBConfigProps) {
    this.client = config.Client;
    this.tables = config.Tables;
  }

  async exists(username: UserName, meetingID: MeetingID): Promise<boolean> {
    const input: QueryInput = {
      TableName: this.tables.MainTable,
      IndexName: 'GSI2',
      Select: 'COUNT',
      Limit: 1,
      KeyConditionExpression: '#GSI2PK = :GSI2PK AND begins_with(#GSI2SK, :GSI2SK)',
      ExpressionAttributeNames: {
        '#GSI2PK': 'GSI2PK',
        '#GSI2SK': 'GSI2SK',
      },
      ExpressionAttributeValues: {
        ':GSI2PK': {
          S: meetingID.id.toString(),
        },
        ':GSI2SK': {
          S: `ATTENDEE#${username.value}`,
        },
      },
    };

    let queryResult: QueryOutput;
    try {
      queryResult = await this.client.query(input).promise();
    } catch (error) {
      throw UnexpectedError.wrap(error, 'Failed to create new meeting item(s)');
    }

    return queryResult.Count === 1;
  }
}
