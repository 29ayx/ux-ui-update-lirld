# Security Fix: Server-Side Token Generation

## Issue Identified

When testing the LiveKit integration, the browser console showed a critical security warning:

```
You should not include your API secret in your web client bundle.
Your web client should request a token from your backend server.
```

## Root Cause

The initial implementation included `livekit-server-sdk` in the client-side code (`src/lib/livekit.ts`), which exposed the API secret in the browser bundle. This is a **critical security vulnerability**.

## Solution Implemented

### 1. Created Server-Side Token Generation

**New file**: `src/server/livekit.ts`
- Marked with `"use server"` directive
- Uses `livekit-server-sdk` safely on the server
- Generates JWT tokens securely without exposing secrets

### 2. Updated Client Code

**Modified files**:
- `src/lib/livekit.ts` - Removed token generation, kept only client utilities
- `src/components/CallModal.tsx` - Now calls server function for tokens
- `src/routes/call/[callId].tsx` - Now calls server function for tokens

### 3. Fixed Environment Variables

**Updated**: `.env.example`

Server-side (secure):
```bash
LIVEKIT_API_KEY=xxx        # NO VITE_ prefix
LIVEKIT_API_SECRET=xxx     # NO VITE_ prefix
```

Client-side (safe to expose):
```bash
VITE_LIVEKIT_URL=wss://... # VITE_ prefix required
```

### 4. Fixed TypeScript Errors

Corrected audio track handling to use `track.mediaStreamTrack` instead of trying to access `getAudioTracks()` on the wrong type.

## Security Impact

✅ **Before**: API secret exposed in browser bundle (HIGH RISK)
✅ **After**: API secret stays on server, tokens generated securely (SECURE)

## Testing

The LiveKit integration is now working correctly with:
- Secure server-side token generation
- Proper audio/video track handling
- No security warnings in console
