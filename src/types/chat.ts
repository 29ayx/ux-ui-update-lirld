import { type Timestamp } from "firebase/firestore";

export interface ChatData {
    id: string;
    participants: string[];
    lastMessage?: string;
    lastMessageTime?: Timestamp | Date;
    updatedAt: Timestamp | Date;
    deletedBy?: string[];
    clearedAt?: Record<string, Timestamp | Date>;
}

export interface UserProfile {
    name?: string;
    photos?: string[];
    [key: string]: unknown;
}

export interface ChatMetadata {
    unreadCount: number;
    lastSenderId: string;
    lastMessageRead: boolean;
}

export interface ChatListItemData extends ChatData {
    otherUser: UserProfile | null;
    metadata: ChatMetadata;
}
