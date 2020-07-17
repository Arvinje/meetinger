import DynamoDB from 'aws-sdk/clients/dynamodb';

export const MainTable = process.env.MAIN_TABLE_NAME;
export const DDB = new DynamoDB();
