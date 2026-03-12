export interface MessageItem {
  id: number;
  senderId: number;
  senderName?: string;
  subject: string;
  body: string;
  type: 'MESSAGE' | 'CIRCULAIRE';
  createdAt: string;
  readAt?: string;
}

export interface SendMessageRequest {
  recipientIds: number[];
  subject: string;
  body: string;
  type: 'MESSAGE' | 'CIRCULAIRE';
}
