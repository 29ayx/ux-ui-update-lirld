"use server";

import { AccessToken } from 'livekit-server-sdk';

/**
 * LiveKit Cloud configuration from environment variables
 * These should be set on the server side only
 */
const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY || '';
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET || '';

/**
 * Server-side function to generate LiveKit access tokens
 * This keeps the API secret secure on the server
 * 
 * @param roomName - Name of the room to join
 * @param participantName - Display name of the participant
 * @param participantIdentity - Unique identifier for the participant (user ID)
 * @returns Access token string
 */
export async function generateLiveKitToken(
    roomName: string,
    participantName: string,
    participantIdentity: string
): Promise<string> {
    if (!LIVEKIT_API_KEY || !LIVEKIT_API_SECRET) {
        throw new Error('LiveKit API credentials not configured on server. Please set LIVEKIT_API_KEY and LIVEKIT_API_SECRET environment variables.');
    }

    const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
        identity: participantIdentity,
        name: participantName,
    });

    // Grant permissions to publish and subscribe to audio/video
    at.addGrant({
        roomJoin: true,
        room: roomName,
        canPublish: true,
        canSubscribe: true,
        canPublishData: true,
    });

    return await at.toJwt();
}
