import DynamoDB, { PutItemInputAttributeMap, Key } from 'aws-sdk/clients/dynamodb';
import { DDBConfigProps, DDBTables } from '@src/shared/infra/dynamodb/dynamodb';
import { DynamoDBError, ValidationError } from '@src/utils/errors';
import { UserRepo } from '@users/repos/UserRepo';
import { User, UserProps } from '@users/domain/User';
import { UserName } from '@users/domain/UserName';
import { UserEmail } from '@users/domain/UserEmail';

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

  async find(username: UserName): Promise<User> {
    const key: Key = {
      PK: {
        S: `USER#${username.value}`,
      },
      SK: {
        S: 'META',
      },
    };

    try {
      const { Item } = await this.client
        .getItem({
          TableName: this.tables.MainTable,
          Key: key,
          ConsistentRead: true,
        })
        .promise();

      const email = (await UserEmail.create(Item.GSI1PK.S)).unwrap();
      const joinedOn = new Date(Item.JoinedOn.S);
      const props: UserProps = { username, email, joinedOn };
      return User.create(props);
    } catch (error) {
      throw new DynamoDBError(error, `failed to fetch user(${username.value})`);
    }
  }
}
