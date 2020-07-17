import 'source-map-support/register';
import { APIGatewayProxyHandler, APIGatewayProxyResult, APIGatewayProxyEvent } from 'aws-lambda';
import { DDB, MainTable } from '@src/utils/dynamodb';
import { PutItemInputAttributeMap } from 'aws-sdk/clients/dynamodb';
import { DynamoDBError } from '@src/utils/errors';

export const handle: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const connectionAttrValue = `Connection#${event.requestContext.connectionId}`;
    const newConnectionItem: PutItemInputAttributeMap = {
      PK: {
        S: connectionAttrValue,
      },
      SK: {
        S: 'Connection',
      },
      GSI1PK: {
        S: `User#${event.requestContext.authorizer.principalId}`,
      },
      GSI1SK: {
        S: connectionAttrValue,
      },
      Username: {
        S: event.requestContext.authorizer.username,
      },
    };

    await DDB.putItem({
      TableName: MainTable,
      Item: newConnectionItem,
    }).promise()
      .catch((error) => { throw new DynamoDBError(error, 'failed to put connection item'); });

    return {
      statusCode: 200,
      body: '',
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);

    return {
      statusCode: 500,
      body: 'server error',
    };
  }
};
