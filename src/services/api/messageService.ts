import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type {
  MessageDTO,
  SendMessageRequest,
  UserSummaryDTO,
} from '@/types/message';

export interface MessageService {
  subscribeToInbox(
    userId: number,
    onUpdate: (conversations: MessageDTO[]) => void,
    onError: (error: Error) => void
  ): Unsubscribe;

  subscribeToChat(
    conversationId: string,
    onUpdate: (messages: MessageDTO[]) => void,
    onError: (error: Error) => void
  ): Unsubscribe;

  sendMessage(
    conversationId: string,
    payload: SendMessageRequest,
    currentUserSummary: UserSummaryDTO
  ): Promise<void>;
}

export class FirebaseMessageService implements MessageService {
  subscribeToInbox(
    userId: number,
    onUpdate: (conversations: MessageDTO[]) => void,
    onError: (error: Error) => void
  ): Unsubscribe {
    // Query conversations where the current user is a participant
    const q = query(
      collection(db, 'conversations'),
      where('participantIds', 'array-contains', userId),
      orderBy('lastMessageCreatedAt', 'desc')
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const conversations = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            ...data,
            conversationId: doc.id,
            // Map last message to MessageDTO structure if needed
            messageId: data.lastMessageId || doc.id,
          } as unknown as MessageDTO;
        });
        onUpdate(conversations);
      },
      onError
    );
  }

  subscribeToChat(
    conversationId: string,
    onUpdate: (messages: MessageDTO[]) => void,
    onError: (error: Error) => void
  ): Unsubscribe {
    const q = query(
      collection(db, 'conversations', conversationId, 'messages'),
      orderBy('createdAt', 'asc')
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const messages = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            ...data,
            messageId: doc.id,
            conversationId,
          } as unknown as MessageDTO;
        });
        onUpdate(messages);
      },
      onError
    );
  }

  async sendMessage(
    conversationId: string,
    payload: SendMessageRequest,
    currentUserSummary: UserSummaryDTO
  ): Promise<void> {
    const messageData = {
      conversationId,
      sender: currentUserSummary,
      content: payload.body,
      resources: payload.resources || [],
      isRead: false,
      createdAt: new Date().toISOString(),
      serverTimestamp: serverTimestamp(),
    };

    await addDoc(
      collection(db, 'conversations', conversationId, 'messages'),
      messageData
    );

    // Note: In a production app, we would also update the parent conversation doc
    // with the lastMessage and lastMessageCreatedAt using a write batch or transaction.
  }
}

export const messageService = new FirebaseMessageService();
