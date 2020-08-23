import DynamoDB, { PutItemInputAttributeMap } from 'aws-sdk/clients/dynamodb';
import { DDBConfigProps, DDBTables } from '@src/shared/infra/dynamodb/dynamodb';
import { DynamoDBError, ValidationError } from '@src/utils/errors';
import { UserRepo } from '@users/repos/UserRepo';
import { User } from '@users/domain/User';

export class DynamoDBUserRepo implements UserRepo {
  private client: DynamoDB;

  private tables: DDBTables;

  constructor(config: DDBConfigProps) {
    this.client = config.Client;
    this.tables = config.Tables;
  }

  async create(user: User): Promise<void> {
    if (user.email === undefined || user.joinedOn === undefined)
      throw new ValidationError('incomplete user object');

    const item: PutItemInputAttributeMap = {
      PK: { S: user.username.value },
      SK: { S: 'META' },
      GSI1PK: { S: user.email.value },
      GSI1SK: { S: 'META' },
      JoinedOn: { S: user.joinedOn.toISOString() },
    };

    try {
      await this.client
        .putItem({
          TableName: this.tables.MainTable,
          Item: item,
          ConditionExpression: 'attribute_not_exists(#PK)',
          ExpressionAttributeNames: {
            '#PK': 'PK',
          },
        })
        .promise();
    } catch (error) {
      throw new DynamoDBError(error, 'failed to create new user item');
    }
  }
}
