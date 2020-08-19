import 'source-map-support/register';
import { APIGatewayProxyHandler, APIGatewayProxyResult, APIGatewayProxyEvent } from 'aws-lambda';
import DDBConfig from '@src/shared/infra/dynamodb/dynamodb';
import { DynamoDBConnectionRepo } from '@connection/repos/implementations/dynamoDBConnectionRepo';
import { DeleteConnectionUseCase } from '@connection/usecase/deleteConnection/deleteConnectionUseCase';
import { DeleteConnectionDTO } from '@connection/usecase/deleteConnection/deleteConnectionDTO';

const connectionRepo = new DynamoDBConnectionRepo(DDBConfig);
const connectionUseCase = new DeleteConnectionUseCase(connectionRepo);

export const handle: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const connectionDTO: DeleteConnectionDTO = {
    id: event.requestContext.connectionId,
  };

  const result = await connectionUseCase.execute(connectionDTO);
  if (result.isOk) {
    return {
      statusCode: 200,
      body: '',
    };
  }

  const error = result.unwrapErr();
  // eslint-disable-next-line no-console
  console.error(error);

  return {
    statusCode: 500,
    body: 'server error',
  };
};
