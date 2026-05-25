import { useParams, useNavigate } from "@solidjs/router";
import { createSignal, createEffect, onCleanup, Show } from "solid-js";
import { useAuth } from "~/lib/auth";
import { subscribeToCall, acceptCall, declineCall, endCall, type Call } from "~/lib/calls";
import { doc, getDoc } from "firebase/firestore";
import { db } from "~/lib/firebase";
import { Room, RoomEvent, Track, RemoteTrack, RemoteParticipant } from "livekit-client";
import { getLiveKitUrl } from "~/lib/livekit";
import { generateLiveKitToken } from "~/server/livekit";

export default function CallPage() {
  const params = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [call, setCall] = createSignal<Call | null>(null);
  const [otherUserName, setOtherUserName] = createSignal("User");
  const [otherUserPhoto, setOtherUserPhoto] = createSignal<string | null>(null);
  const [duration, setDuration] = createSignal(0);
  const [connectionState, setConnectionState] = createSignal<'new' | 'connecting' | 'connected' | 'disconnected'>('new');
  const [isMuted, setIsMuted] = createSignal(false);

  let room: Room | null = null;
  let remoteAudio: HTMLAudioElement | undefined;
  let durationInterval: number | undefined;
  let livekitInitialized = false;

  const isInitiator = () => call()?.callerId === user()?.uid;
  const otherUserId = () => {
    const c = call();
    if (!c) return null;
    return c.callerId === user()?.uid ? c.calleeId : c.callerId;
  };

  // Subscribe to call
  createEffect(() => {
    const unsub = subscribeToCall(params.callId, (c) => {
      setCall(c);
      if (c?.status === 'ended' || c?.status === 'declined' || c?.status === 'failed') {
        cleanup();
        navigate('/');
      }
    });
    onCleanup(unsub);
  });

  // Fetch other user info
  createEffect(async () => {
    const uid = otherUserId();
    if (!uid) return;
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      setOtherUserName(data.name || 'User');
      // Use the new photos array format (Cloudinary)
      const photoUrl = Array.isArray(data.photos) && data.photos.length > 0
        ? data.photos[0]
        : (data.photoURL || null);
      setOtherUserPhoto(photoUrl);
    }
  });

  // Initialize LiveKit when active
  createEffect(async () => {
    const currentCall = call();
    if (livekitInitialized || !currentCall || currentCall.status !== 'active' || !currentCall.roomName) return;
    livekitInitialized = true;

    try {
      const currentUser = user();
      if (!currentUser) return;

      // Create LiveKit room
      room = new Room({
        adaptiveStream: true,
        dynacast: true,
      });

      // Set up event listeners
      room.on(RoomEvent.TrackSubscribed, (track: RemoteTrack, publication, participant: RemoteParticipant) => {
        if (track.kind === Track.Kind.Audio) {
          // Create a MediaStream from the track's MediaStreamTrack
          const mediaStream = new MediaStream([track.mediaStreamTrack]);
          if (remoteAudio) {
            remoteAudio.srcObject = mediaStream;
            remoteAudio.play().catch(err => console.error('Error playing remote audio:', err));
          }
        }
      });

      room.on(RoomEvent.ConnectionStateChanged, (state) => {
        switch (state) {
          case 'connected':
            setConnectionState('connected');
            break;
          case 'connecting':
          case 'reconnecting':
            setConnectionState('connecting');
            break;
          case 'disconnected':
            setConnectionState('disconnected');
            break;
          default:
            setConnectionState('new');
        }
      });

      // Generate access token from server
      const token = await generateLiveKitToken(
        currentCall.roomName,
        currentUser.displayName || 'User',
        currentUser.uid
      );

      // Connect to room
      setConnectionState('connecting');
      await room.connect(getLiveKitUrl(), token);
      setConnectionState('connected');

      // Enable microphone
      await room.localParticipant.setMicrophoneEnabled(true);

      durationInterval = window.setInterval(() => setDuration(d => d + 1), 1000);
    } catch (err) {
      console.error('LiveKit error:', err);
      alert('Failed to connect. Please check microphone permissions.');
    }
  });

  const cleanup = () => {
    if (durationInterval) clearInterval(durationInterval);
    if (room) {
      room.disconnect();
      room = null;
    }
    if (remoteAudio) {
      remoteAudio.pause();
      remoteAudio.srcObject = null;
    }
  };

  const handleAccept = async () => {
    await acceptCall(params.callId, user()!.uid);
  };

  const handleDecline = async () => {
    await declineCall(params.callId, user()!.uid);
    navigate('/');
  };

  const handleEnd = async () => {
    const c = call();
    if (c?.status === 'ringing') {
      await declineCall(params.callId, user()!.uid);
    } else if (c?.status === 'active') {
      await endCall(params.callId, user()!.uid);
    }
    navigate('/');
  };

  const toggleMute = async () => {
    if (room) {
      const enabled = !isMuted();
      await room.localParticipant.setMicrophoneEnabled(enabled);
      setIsMuted(!enabled);
    }
  };

  const formatDuration = () => {
    const m = Math.floor(duration() / 60);
    const s = duration() % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div class="fixed inset-0 bg-black flex flex-col items-center justify-center p-8">
      <div class="max-w-md w-full space-y-8">
        {/* User Avatar */}
        <div class="flex flex-col items-center">
          <div class="w-32 h-32 rounded-full overflow-hidden mb-4 border-4 border-white/20">
            <Show when={otherUserPhoto()}
            >
              <img src={otherUserPhoto()!} alt={otherUserName()} class="w-full h-full object-cover" />
            </Show>
          </div>
          <h1 class="text-3xl font-bold text-white mb-2">{otherUserName()}</h1>
          <Show when={call()?.status === 'ringing'}>
            <p class="text-white/60">{isInitiator() ? 'Calling...' : 'Incoming Call'}</p>
          </Show>
          <Show when={call()?.status === 'active'}>
            <p class="text-2xl font-mono text-white">{formatDuration()}</p>
            <p class="text-sm text-green-400">Connected</p>
          </Show>
        </div>

        {/* Controls */}
        <Show when={!isInitiator() && call()?.status === 'ringing'} fallback={
          <div class="flex justify-center gap-4">
            <Show when={call()?.status === 'active'}>
              <button onClick={toggleMute} class="w-16 h-16 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center">
                <span class="text-2xl">{isMuted() ? '🔇' : '🎤'}</span>
              </button>
            </Show>
            <button onClick={handleEnd} class="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center">
              <span class="text-2xl">📞</span>
            </button>
          </div>
        }>
          <div class="flex gap-4">
            <button onClick={handleDecline} class="flex-1 h-14 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold">
              Decline
            </button>
            <button onClick={handleAccept} class="flex-1 h-14 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold">
              Accept
            </button>
          </div>
        </Show>
      </div>
      <audio ref={remoteAudio} autoplay />
    </div>
  );
}
