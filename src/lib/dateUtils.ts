import { type Timestamp } from "firebase/firestore";

export const toDate = (timestamp: Timestamp | Date | undefined): Date | null => {
    if (!timestamp) return null;
    if (timestamp instanceof Date) return timestamp;
    if (typeof (timestamp as Timestamp).toDate === "function") {
        return (timestamp as Timestamp).toDate();
    }
    // Handle other timestamp formats
    if (typeof timestamp === "number") {
        return new Date(timestamp);
    }
    if (typeof timestamp === "object" && "seconds" in timestamp) {
        return new Date((timestamp as { seconds: number }).seconds * 1000);
    }
    return null;
};

export const formatTime = (timestamp: Timestamp | Date | undefined): string => {
    const date = toDate(timestamp);
    if (!date) return "";

    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
        return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    } else if (days === 1) {
        return "Yesterday";
    } else if (days < 7) {
        return date.toLocaleDateString("en-US", { weekday: "short" });
    } else {
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }
};
