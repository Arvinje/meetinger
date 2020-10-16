import DynamoDB, { PutItemInputAttributeMap, Key } from 'aws-sdk/clients/dynamodb';
import { DDBConfigProps, DDBTables } from '@src/shared/infra/dynamodb/dynamodb';
import { UserRepo } from '@users/repos/UserRepo';
import { User, UserProps } from '@users/domain/User';
import { UserName } from '@users/domain/UserName';
import { UserEmail } from '@users/domain/UserEmail';
import { UnexpectedError } from '@src/shared/core/AppError';
import { UserFullName } from '@users/domain/UserFullName';
import { UserIntroduction } from '@users/domain/UserIntroduction';

export class DynamoDBUserRepo implements UserRepo {
  private client: DynamoDB;

  private tables: DDBTables;

  constructor(config: DDBConfigProps) {
    this.client = config.Client;
    this.tables = config.Tables;
  }

  async create(user: User): Promise<void> {
    const item: PutItemInputAttributeMap = {
      PK: { S: `USER#${user.username.value}` },
      SK: { S: 'META' },
      GSI1PK: { S: `USER#${user.email.value}` },
      GSI1SK: { S: 'META' },
      JoinedOn: { S: user.joinedOn.toISOString() },
      FullName: { S: user.fullName.value },
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
      throw UnexpectedError.wrap(error, 'failed to create new user item');
    }
  }

  async findByUserName(username: UserName): Promise<User> {
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
      const fullName = (await UserFullName.create(Item.FullName.S)).unwrap();
      const introduction = (await UserIntroduction.create('')).unwrap();
      const props: UserProps = { username, email, joinedOn, fullName, introduction };

      const userOrError = User.create(props);
      if (userOrError.isErr()) throw userOrError.unwrapErr();

      return userOrError.unwrap();
    } catch (error) {
      throw UnexpectedError.wrap(error, `failed to fetch user(${username.value})`);
    }
  }
}
