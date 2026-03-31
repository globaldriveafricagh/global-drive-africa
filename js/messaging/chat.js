import { dbInstance } from '../database/db.js';
import { Session } from '../security/crypto.js';

export const ChatAPI = {
  async sendMessage(toUserId, text, carId = null) {
    const session = Session.getSession();
    if (!session) throw new Error("Not logged in");

    const message = {
      senderId: session.userId,
      senderName: session.name,
      receiverId: toUserId,
      text,
      carId,
      timestamp: new Date().toISOString(),
      read: false
    };

    await dbInstance.insert('messages', message);
  },

  async getUserMessages() {
    const session = Session.getSession();
    if (!session) return [];

    // Get all messages where user is sender or receiver
    const allMessages = await dbInstance.getAll('messages');
    return allMessages.filter(m => m.senderId === session.userId || m.receiverId === session.userId);
  },
  
  async getAdminMessages() {
    const session = Session.getSession();
    if (!session || session.role !== 'admin') return [];
    
    // In our simplified system, admin receiverId can be considered 'admin' or finding all messages sent to an admin.
    // Let's assume admin responds to all users. Let's just bundle all unreplied/all messages.
    const allMessages = await dbInstance.getAll('messages');
    return allMessages;
  }
};
