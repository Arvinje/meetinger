import 'source-map-support/register';
import { APIGatewayProxyHandler } from 'aws-lambda';

export const handle: APIGatewayProxyHandler = async () => ({
  statusCode: 200,
  body: '',
});
