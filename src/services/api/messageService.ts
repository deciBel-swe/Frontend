import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  setDoc,
  doc,
  getDocs,
  serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type {
  MessageDTO,
  SendMessageRequest,
  UserSummaryDTO,
} from '@/types/message';
import type { UserMe, UserPublic } from '@/types/user';

export interface MessageService {
  subscribeToInbox(
    userId: number,
    onUpdate: (conversations: unknown[]) => void,
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

  getOrCreateConversation(
    currentUser: UserMe,
    otherUser: UserPublic | UserSummaryDTO
  ): Promise<string>;
}

export class FirebaseMessageService implements MessageService {
  subscribeToInbox(
    userId: number,
    onUpdate: (conversations: unknown[]) => void,
    onError: (error: Error) => void
  ): Unsubscribe {
    // Convert userId to string for Firestore consistency
    const userIdStr = String(userId);
    
    const q = query(
      collection(db, 'conversations'),
      where('participantIds', 'array-contains', userIdStr),
      orderBy('updatedAt', 'desc')
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const conversations = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
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
      sender: {
        id: currentUserSummary.id,
        username: currentUserSummary.username,
        displayName: currentUserSummary.displayName || currentUserSummary.username,
        avatarUrl: currentUserSummary.avatarUrl || null,
      },
      content: payload.body,
      resources: payload.resources || [],
      isRead: false,
      createdAt: new Date().toISOString(),
      serverTimestamp: serverTimestamp(),
    };

    // 1. Add the message to the sub-collection
    await addDoc(
      collection(db, 'conversations', conversationId, 'messages'),
      messageData
    );

    // 2. Update the parent conversation document for the inbox preview
    await setDoc(
      doc(db, 'conversations', conversationId),
      {
        lastMessage: {
          content: payload.body,
          senderId: String(currentUserSummary.id),
          createdAt: new Date().toISOString(),
        },
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  }

  async getOrCreateConversation(
    currentUser: UserMe,
    otherUser: UserPublic | UserSummaryDTO
  ): Promise<string> {
    const myId = String(currentUser.id);
    const theirId = String('profile' in otherUser ? otherUser.profile.id : otherUser.id);
    
    // Ensure IDs are sorted for a deterministic conversation key or just use array-contains
    // Using array-contains-any or multiple where might be complex, 
    // let's search for an existing conversation with these exact participants.
    const q = query(
      collection(db, 'conversations'),
      where('participantIds', 'array-contains', myId)
    );
    
    const snapshot = await getDocs(q);
    const existing = snapshot.docs.find(doc => {
      const ids = doc.data().participantIds as string[];
      return ids.length === 2 && ids.includes(theirId);
    });

    if (existing) {
      return existing.id;
    }

    // Create new conversation
    const otherUserData = 'profile' in otherUser ? {
      id: String(otherUser.profile.id),
      username: otherUser.profile.username,
      displayName: otherUser.profile.displayName || otherUser.profile.username,
      avatarUrl: otherUser.profile.profilePic || null,
    } : {
      id: String(otherUser.id),
      username: otherUser.username,
      displayName: otherUser.displayName || otherUser.username,
      avatarUrl: otherUser.avatarUrl || null,
    };

    const meData = {
      id: String(currentUser.id),
      username: currentUser.username,
      displayName: currentUser.displayName || currentUser.username,
      avatarUrl: currentUser.profile?.profilePic || null,
    };

    const newConv = {
      participantIds: [myId, theirId],
      participants: [meData, otherUserData],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastMessage: null,
    };

    const docRef = await addDoc(collection(db, 'conversations'), newConv);
    return docRef.id;
  }
}

export const messageService = new FirebaseMessageService();
