export interface JobQueue {
  send(queue: 'EmailsToSend', payload: string): Promise<void>;
}
