import api from "./axios";

export const messagesApi = {
  getInbox: (recipientId: number): Promise<any[]> =>
    api.get(`/messages/inbox/${recipientId}`),

  getSent: (senderId: number): Promise<any[]> =>
    api.get(`/messages/sent/${senderId}`),

  getById: (id: number): Promise<any> =>
    api.get(`/messages/${id}`),

  send: (data: {
    senderId: number;
    recipientIds: number[];
    subject: string;
    body: string;
    type?: "MESSAGE" | "CIRCULAIRE";
  }): Promise<any> =>
    api.post("/messages", { type: "MESSAGE", ...data }),

  markAsRead: (messageId: number, recipientId: number): Promise<void> =>
    api.put(`/messages/${messageId}/read/${recipientId}`),
};
