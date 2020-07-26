import DynamoDB from 'aws-sdk/clients/dynamodb';

export interface DDBConfigProps {
  Client: DynamoDB;
  Tables: DDBTables;
}

export interface DDBTables {
  MainTable: string;
}

const MainTable = process.env.MAIN_TABLE_NAME;
const Client = new DynamoDB();

const Tables: DDBTables = {
  MainTable,
};

export default {
  Client,
  Tables,
} as DDBConfigProps;
