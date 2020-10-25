import 'source-map-support/register';
import { APIGatewayAuthorizerHandler } from 'aws-lambda';
import { AuthorizeUserUseCase } from './AuthorizeUserUseCase';
import { AuthorizeUserController } from './AuthorizeUserController';

const useCase = new AuthorizeUserUseCase(process.env.ISS);
const controller = new AuthorizeUserController(useCase);

export const handler: APIGatewayAuthorizerHandler = async (event) => controller.execute(event);
