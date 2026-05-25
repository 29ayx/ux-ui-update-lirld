/**
 * Format a timestamp as a relative time string (e.g., "5m ago", "2h ago")
 * @param timestamp - Timestamp in milliseconds
 * @returns Formatted relative time string
 */
export function formatDistanceToNow(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
}
