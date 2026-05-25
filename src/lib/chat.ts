import { db } from "./firebase";
import {
  collection,
  doc,
  addDoc,
  setDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  getDoc,
  getDocs,
  writeBatch,
  arrayUnion,
  deleteDoc
} from "firebase/firestore";
import { aiService } from "./ai";
import { AdminUserData } from "./admin";

export interface Message {
  id: string;
  text: string;
  senderId: string;
  timestamp: any;
  read: boolean;
}

export interface Chat {
  id: string;
  participants: string[];
  lastMessage?: string;
  lastMessageTime?: any;
  updatedAt: any;
  deletedBy?: string[];
}

/**
 * Get or create a chat between two users
 */
export async function getOrCreateChat(userId1: string, userId2: string): Promise<string> {
  // Sort user IDs to ensure consistent chat ID
  const [user1, user2] = [userId1, userId2].sort();
  const chatId = `${user1}_${user2}`;

  const chatRef = doc(db, "chats", chatId);

  try {
    const chatDoc = await getDoc(chatRef);
    const exists = chatDoc.exists();

    if (!exists) {
      // Create new chat with the sorted ID
      await setDoc(chatRef, {
        participants: [user1, user2],
        updatedAt: serverTimestamp(),
      });
    }

    return chatId;
  } catch (error: any) {
    throw error;
  }
}

/**
 * Send a message in a chat
 */
export async function sendMessage(chatId: string, senderId: string, text: string) {
  const messagesRef = collection(db, "chats", chatId, "messages");

  await addDoc(messagesRef, {
    text,
    senderId,
    timestamp: serverTimestamp(),
    read: false,
  });

  // Update chat's last message
  const chatRef = doc(db, "chats", chatId);
  await setDoc(chatRef, {
    lastMessage: text,
    lastMessageTime: serverTimestamp(),
    updatedAt: serverTimestamp(),
    deletedBy: [] // Clear deletedBy so it shows up for everyone
  }, { merge: true });

  // Check if recipient is an AI agent and trigger response
  try {
    const chatDoc = await getDoc(chatRef);
    if (chatDoc.exists()) {
      const participants = chatDoc.data().participants || [];
      const recipientId = participants.find((id: string) => id !== senderId);

      if (recipientId) {
        const recipientRef = doc(db, "users", recipientId);
        const recipientDoc = await getDoc(recipientRef);

        if (recipientDoc.exists()) {
          const recipientData = recipientDoc.data() as AdminUserData;

          if (recipientData.isAI) {
            // Trigger AI response (fire and forget to not block UI)
            aiService.generateResponse(text, recipientData).then(async (response) => {
              const aiMessagesRef = collection(db, "chats", chatId, "messages");

              await addDoc(aiMessagesRef, {
                text: response.text,
                senderId: recipientId,
                timestamp: serverTimestamp(),
                read: false,
              });

              // Update chat's last message for AI response
              await setDoc(chatRef, {
                lastMessage: response.text,
                lastMessageTime: serverTimestamp(),
                updatedAt: serverTimestamp(),
                deletedBy: []
              }, { merge: true });
            });
          }
        }
      }
    }
  } catch (error) {
    console.error("Error triggering AI response:", error);
  }
}

/**
 * Get the other participant in a chat
 */
export async function getOtherParticipant(chatId: string, currentUserId: string): Promise<string | null> {
  const chatRef = doc(db, "chats", chatId);
  const chatDoc = await getDoc(chatRef);

  if (chatDoc.exists()) {
    const participants = chatDoc.data().participants || [];
    return participants.find((id: string) => id !== currentUserId) || null;
  }

  return null;
}

/**
 * Mark all messages from the other user as read (seen)
 * Simple: when User B opens chat, mark all User A's messages as read: true
 */
export async function markMessagesAsRead(chatId: string, currentUserId: string) {
  try {
    const messagesRef = collection(db, "chats", chatId, "messages");

    // Get all messages
    const snapshot = await getDocs(messagesRef);

    if (snapshot.empty) {
      return;
    }

    const batch = writeBatch(db);
    let count = 0;

    snapshot.forEach((msgDoc) => {
      const data = msgDoc.data();

      // Mark messages from OTHER user as read (not from current user)
      // When User B opens chat, mark User A's messages as read
      if (data.senderId !== currentUserId) {
        batch.update(msgDoc.ref, { read: true });
        count++;
      }
    });

    if (count > 0) {
      await batch.commit();
    }
  } catch (error) {
    throw error;
  }
}


/**
 * Hard delete a chat and all its messages
 * This removes the chat for BOTH users
 */
export async function deleteChat(chatId: string) {
  try {
    // 1. Delete all messages in the subcollection
    const messagesRef = collection(db, "chats", chatId, "messages");
    const snapshot = await getDocs(messagesRef);

    // Delete messages in batches of 500 (Firestore limit)
    const batchSize = 500;
    const chunks = [];

    for (let i = 0; i < snapshot.docs.length; i += batchSize) {
      chunks.push(snapshot.docs.slice(i, i + batchSize));
    }

    for (const chunk of chunks) {
      const batch = writeBatch(db);
      chunk.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
    }

    // 2. Delete the chat document itself
    const chatRef = doc(db, "chats", chatId);
    await deleteDoc(chatRef);
  } catch (error) {
    console.error("Error deleting chat:", error);
    throw error;
  }
}

