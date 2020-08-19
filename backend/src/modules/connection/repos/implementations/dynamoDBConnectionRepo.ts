import DynamoDB, { PutItemInputAttributeMap } from 'aws-sdk/clients/dynamodb';
import { ConnectionRepo } from '@connection/repos/connectionRepo';
import { Connection } from '@connection/domain/connection';
import { DDBConfigProps, DDBTables } from '@src/shared/infra/dynamodb/dynamodb';
import { DynamoDBError } from '@src/utils/errors';

export class DynamoDBConnectionRepo implements ConnectionRepo {
  private client: DynamoDB;

  private tables: DDBTables;

  constructor(config: DDBConfigProps) {
    this.client = config.Client;
    this.tables = config.Tables;
  }

  async create(connection: Connection): Promise<void> {
    const newConnectionItem: PutItemInputAttributeMap = {
      PK: { S: connection.id },
      SK: { S: 'Connection' },
      GSI1PK: { S: connection.userId },
      GSI1SK: { S: connection.id },
      Username: { S: connection.username },
    };

    try {
      await this.client
        .putItem({
          TableName: this.tables.MainTable,
          Item: newConnectionItem,
        })
        .promise();
    } catch (error) {
      throw new DynamoDBError(error, 'failed to create new connection item');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.client
        .deleteItem({
          TableName: this.tables.MainTable,
          Key: {
            PK: { S: id },
            SK: { S: 'Connection' },
          },
        })
        .promise();
    } catch (error) {
      throw new DynamoDBError(error, 'failed to delete the connection item');
    }
  }
}
