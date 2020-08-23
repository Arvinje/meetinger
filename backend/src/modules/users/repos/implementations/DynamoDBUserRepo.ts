import DynamoDB, { PutItemInputAttributeMap } from 'aws-sdk/clients/dynamodb';
import { DDBConfigProps, DDBTables } from '@src/shared/infra/dynamodb/dynamodb';
import { DynamoDBError } from '@src/utils/errors';
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
    const newUserItem: PutItemInputAttributeMap = {
      PK: { S: user.username.value },
      SK: { S: 'META' },
      GSI1PK: { S: user.email.value },
      GSI1SK: { S: 'META' },
      FullName: { S: user.fullName.value },
      Intro: { S: user.introduction.value },
      JoinedOn: { S: user.joinedOn.toISOString() },
    };

    try {
      await this.client
        .putItem({
          TableName: this.tables.MainTable,
          Item: newUserItem,
        })
        .promise();
    } catch (error) {
      throw new DynamoDBError(error, 'failed to create new user item');
    }
  }
}
