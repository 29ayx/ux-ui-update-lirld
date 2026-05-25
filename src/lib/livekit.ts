/**
 * Get the LiveKit server URL from environment
 * @returns LiveKit WebSocket URL
 */
export function getLiveKitUrl(): string {
    const url = import.meta.env.VITE_LIVEKIT_URL || '';
    if (!url) {
        throw new Error('LiveKit URL not configured. Please set VITE_LIVEKIT_URL environment variable.');
    }
    return url;
}

/**
 * Generate a room name for a call
 * @param callId - The unique call ID
 * @returns Room name string
 */
export function generateRoomName(callId: string): string {
    return `call-${callId}`;
}
