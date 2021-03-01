export interface EmailMessage {
  sender: string;
  template: string;
  templateData: string;
  toAddresses: string[];
}
