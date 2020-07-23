import 'source-map-support/register';
import { APIGatewayProxyHandler, APIGatewayProxyResult, APIGatewayProxyEvent } from 'aws-lambda';
import { DDB, MainTable } from '@src/utils/dynamodb';
import { Key } from 'aws-sdk/clients/dynamodb';
import { DynamoDBError } from '@src/utils/errors';

export const handle: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const connectionAttrValue = `Connection#${event.requestContext.connectionId}`;
    const connectionKey: Key = {
      PK: {
        S: connectionAttrValue,
      },
      SK: {
        S: 'Connection',
      },
    };

    await DDB.deleteItem({
      TableName: MainTable,
      Key: connectionKey,
    }).promise()
      .catch((error) => {
        throw new DynamoDBError(error, 'failed to delete the connection item');
      });

    return {
      statusCode: 200,
      body: '',
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(error);

    return {
      statusCode: 500,
      body: 'server error',
    };
  }
};
