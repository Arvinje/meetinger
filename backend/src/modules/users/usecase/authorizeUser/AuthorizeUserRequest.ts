export interface AuthorizeUserRequest {
  apiType: 'REST' | 'WebSocket';
  authorizationToken: string;
  methodArn: string;
}
