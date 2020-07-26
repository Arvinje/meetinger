import 'source-map-support/register';
import { APIGatewayProxyHandler, APIGatewayProxyResult, APIGatewayProxyEvent } from 'aws-lambda';
import DDBConfig from '@src/shared/infra/dynamodb/dynamodb';
import { DynamoDBConnectionRepo } from '@connection/repos/implementations/dynamoDBConnectionRepo';
import { CreateConnectionUseCase } from '@connection/usecase/createConnection/createConnectionUseCase';
import { CreateConnectionDTO } from '@connection/usecase/createConnection/createConnectionDTO';

const connectionRepo = new DynamoDBConnectionRepo(DDBConfig);
const connectionUseCase = new CreateConnectionUseCase(connectionRepo);

export const handle: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const connectionDTO: CreateConnectionDTO = {
    id: event.requestContext.connectionId,
    userId: event.requestContext.authorizer.principalId,
    username: event.requestContext.authorizer.username,
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
