import { Show, createSignal, createEffect, onCleanup } from "solid-js";
import { useAuth } from "~/lib/auth";
import { subscribeToCall, endCall, declineCall, acceptCall, type Call } from "~/lib/calls";
import { getUserBalance } from "~/lib/billing";
import { doc, getDoc } from "firebase/firestore";
import { db } from "~/lib/firebase";
import VideoContainer from "~/components/call/VideoContainer";
import LocalVideoPreview from "~/components/call/LocalVideoPreview";
import CallInfoOverlay from "~/components/call/CallInfoOverlay";
import CallControls from "~/components/call/CallControls";
import { Room, RoomEvent, Track, RemoteTrack, RemoteParticipant, LocalParticipant } from "livekit-client";
import { getLiveKitUrl } from "~/lib/livekit";
import { generateLiveKitToken } from "~/server/livekit";

interface CallModalProps {
  callId: string;
  isInitiator: boolean;
  onEnd: () => void;
}

export default function CallModal(props: CallModalProps) {
  const { user } = useAuth();
  const [call, setCall] = createSignal<Call | null>(null);
  const [duration, setDuration] = createSignal(0);
  const [cost, setCost] = createSignal(0);
  const [balance, setBalance] = createSignal(0);
  const [isMuted, setIsMuted] = createSignal(false);
  const [connectionState, setConnectionState] = createSignal<'new' | 'connecting' | 'connected' | 'disconnected' | 'failed'>('new');
  const [error, setError] = createSignal<string | null>(null);
  const [isEnding, setIsEnding] = createSignal(false);

  // Video state management
  const [isCameraEnabled, setIsCameraEnabled] = createSignal(false);
  const [isRemoteVideoEnabled, setIsRemoteVideoEnabled] = createSignal(false);
  const [localVideoStream, setLocalVideoStream] = createSignal<MediaStream | null>(null);
  const [remoteVideoStream, setRemoteVideoStream] = createSignal<MediaStream | null>(null);
  const [videoSwapped, setVideoSwapped] = createSignal(false);
  const [cameraError, setCameraError] = createSignal<string | null>(null);
  const [isCameraLoading, setIsCameraLoading] = createSignal(false);

  // Other user information
  const [otherUserName, setOtherUserName] = createSignal<string>('User');
  const [otherUserPhoto, setOtherUserPhoto] = createSignal<string | null>(null);

  let room: Room | null = null;
  let remoteAudio: HTMLAudioElement | undefined;
  let durationInterval: number | undefined;
  let balanceInterval: number | undefined;

  // Get other participant info
  const otherUserId = () => {
    const currentCall = call();
    if (!currentCall) return null;
    const currentUser = user();
    return currentCall.callerId === currentUser?.uid
      ? currentCall.calleeId
      : currentCall.callerId;
  };

  // Fetch other user's information
  createEffect(async () => {
    const userId = otherUserId();
    if (!userId) return;

    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setOtherUserName(userData.name || 'User');
        // Use the new photos array format (Cloudinary)
        const photoUrl = Array.isArray(userData.photos) && userData.photos.length > 0
          ? userData.photos[0]
          : (userData.photoURL || null);
        setOtherUserPhoto(photoUrl);
      }
    } catch (error) {
      console.error('Error fetching other user info:', error);
    }
  });

  // Subscribe to call updates
  createEffect(() => {
    const unsubscribe = subscribeToCall(props.callId, (updatedCall) => {
      console.log('[CallModal] Call status update:', updatedCall?.status);
      setCall(updatedCall);

      // Handle call end
      if (updatedCall?.status === 'ended' || updatedCall?.status === 'declined' || updatedCall?.status === 'failed') {
        cleanup();
        props.onEnd();
      }
    });

    onCleanup(() => unsubscribe());
  });

  // Initialize LiveKit when call becomes active
  createEffect(async () => {
    const currentCall = call();
    console.log('[CallModal] LiveKit check - call status:', currentCall?.status);
    if (!currentCall || currentCall.status !== 'active' || !currentCall.roomName) return;

    console.log('[CallModal] Initializing LiveKit...');

    try {
      const currentUser = user();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      // Create LiveKit room
      room = new Room({
        adaptiveStream: true,
        dynacast: true,
        videoCaptureDefaults: {
          resolution: {
            width: 1280,
            height: 720,
            frameRate: 30,
          },
        },
      });

      // Set up event listeners
      room.on(RoomEvent.TrackSubscribed, (track: RemoteTrack, publication, participant: RemoteParticipant) => {
        console.log('[CallModal] Track subscribed:', track.kind);

        if (track.kind === Track.Kind.Audio) {
          // Create a MediaStream from the track's MediaStreamTrack
          const mediaStream = new MediaStream([track.mediaStreamTrack]);
          if (remoteAudio) {
            remoteAudio.srcObject = mediaStream;
            remoteAudio.play().catch(err => console.error('Error playing remote audio:', err));
          }
        } else if (track.kind === Track.Kind.Video) {
          const videoElement = track.attach();
          const stream = videoElement.srcObject as MediaStream;
          setRemoteVideoStream(stream);
          setIsRemoteVideoEnabled(true);
        }
      });

      room.on(RoomEvent.TrackUnsubscribed, (track: RemoteTrack) => {
        console.log('[CallModal] Track unsubscribed:', track.kind);
        if (track.kind === Track.Kind.Video) {
          setRemoteVideoStream(null);
          setIsRemoteVideoEnabled(false);
        }
      });

      room.on(RoomEvent.ConnectionStateChanged, (state) => {
        console.log('[CallModal] Connection state changed:', state);

        switch (state) {
          case 'connected':
            setConnectionState('connected');
            setError(null);
            break;
          case 'connecting':
          case 'reconnecting':
            setConnectionState('connecting');
            break;
          case 'disconnected':
            setConnectionState('disconnected');
            setError('Connection lost. Attempting to reconnect...');
            break;
          default:
            setConnectionState('new');
        }
      });

      room.on(RoomEvent.Disconnected, () => {
        console.log('[CallModal] Disconnected from room');
        setConnectionState('disconnected');
      });

      // Generate access token from server
      const token = await generateLiveKitToken(
        currentCall.roomName,
        currentUser.displayName || 'User',
        currentUser.uid
      );

      // Connect to room
      console.log('[CallModal] Connecting to LiveKit room:', currentCall.roomName);
      setConnectionState('connecting');

      await room.connect(getLiveKitUrl(), token);

      console.log('[CallModal] Connected to LiveKit room');
      setConnectionState('connected');

      // Enable microphone by default
      await room.localParticipant.setMicrophoneEnabled(true);

      // Get local audio stream for UI
      const localAudioTrack = room.localParticipant.getTrackPublication(Track.Source.Microphone);
      if (localAudioTrack?.track) {
        console.log('[CallModal] Local audio track enabled');
      }

      // Start duration timer
      startDurationTimer();

      // Start balance updates (if not free)
      if (!currentCall.isFree) {
        startBalanceUpdates();
      }

      console.log('[CallModal] LiveKit initialization complete');

    } catch (err: any) {
      console.error('[CallModal] Error initializing LiveKit:', err);
      const errorMsg = err.message || 'Failed to establish connection';
      setError(errorMsg);
      setConnectionState('failed');

      // Show alert for permission errors
      if (errorMsg.includes('microphone') || errorMsg.includes('Permission') || errorMsg.includes('NotAllowedError')) {
        alert('Microphone access is required for calls. Please allow microphone access in your browser settings and try again.');
      }
    }
  });

  // Listen for insufficient balance events
  createEffect(() => {
    const handleInsufficientBalance = (event: CustomEvent) => {
      if (event.detail.callId === props.callId) {
        setError('Balance depleted. Call ending...');
        setTimeout(() => handleEndCall(), 2000);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('billing:insufficient-balance', handleInsufficientBalance as EventListener);
      onCleanup(() => {
        window.removeEventListener('billing:insufficient-balance', handleInsufficientBalance as EventListener);
      });
    }
  });

  // Auto-dismiss camera error after 5 seconds
  createEffect(() => {
    const error = cameraError();
    if (error) {
      const timeout = setTimeout(() => {
        setCameraError(null);
      }, 5000);

      onCleanup(() => clearTimeout(timeout));
    }
  });

  // Start duration timer
  const startDurationTimer = () => {
    durationInterval = window.setInterval(() => {
      setDuration(d => d + 1);

      // Update cost if not free
      const currentCall = call();
      if (currentCall && !currentCall.isFree && currentCall.pricePerMinute) {
        const minutes = (duration() + 1) / 60;
        setCost(minutes * currentCall.pricePerMinute);
      }
    }, 1000);
  };

  // Start balance updates
  const startBalanceUpdates = () => {
    const updateBalance = async () => {
      const currentUser = user();
      if (currentUser) {
        try {
          const newBalance = await getUserBalance(currentUser.uid);
          setBalance(newBalance);
        } catch (err) {
          console.error('Error updating balance:', err);
        }
      }
    };

    // Initial update
    updateBalance();

    // Update every 6 seconds
    balanceInterval = window.setInterval(updateBalance, 6000);
  };

  // Toggle mute
  const toggleMute = async () => {
    if (room) {
      const enabled = !isMuted();
      await room.localParticipant.setMicrophoneEnabled(enabled);
      setIsMuted(!enabled);
    }
  };

  // Start camera and add video track
  const startCamera = async () => {
    setIsCameraLoading(true);
    try {
      if (!room) {
        throw new Error('Room not initialized');
      }

      await room.localParticipant.setCameraEnabled(true);

      // Get local video track
      const videoTrack = room.localParticipant.getTrackPublication(Track.Source.Camera);
      if (videoTrack?.track) {
        const videoElement = videoTrack.track.attach();
        const stream = videoElement.srcObject as MediaStream;
        setLocalVideoStream(stream);
      }

      setIsCameraEnabled(true);
      setCameraError(null);
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to access camera. Please try again.';
      setCameraError(errorMessage);
      console.error('Camera error:', error);
      setIsCameraEnabled(false);
    } finally {
      setIsCameraLoading(false);
    }
  };

  // Stop camera and remove video track
  const stopCamera = async () => {
    if (room) {
      await room.localParticipant.setCameraEnabled(false);
    }

    setLocalVideoStream(null);
    setIsCameraEnabled(false);
  };

  // Toggle camera on/off
  const toggleCamera = async () => {
    if (isCameraEnabled()) {
      await stopCamera();
    } else {
      await startCamera();
    }
  };

  // Swap local and remote video positions
  const swapVideos = () => {
    setVideoSwapped(!videoSwapped());
  };

  // Handle accept call
  const handleAcceptCall = async () => {
    const currentUser = user();
    if (!currentUser) return;

    try {
      console.log('[CallModal] Accepting call:', props.callId);
      await acceptCall(props.callId, currentUser.uid);
      console.log('[CallModal] Call accepted successfully');
    } catch (err) {
      console.error('[CallModal] Error accepting call:', err);
      setError(err instanceof Error ? err.message : 'Failed to accept call');
    }
  };

  // Handle decline call
  const handleDeclineCall = async () => {
    if (isEnding()) return;

    setIsEnding(true);
    const currentUser = user();

    if (currentUser) {
      try {
        await declineCall(props.callId, currentUser.uid);
      } catch (err) {
        console.error('Error declining call:', err);
      }
    }

    cleanup();
    props.onEnd();
  };

  // Handle end call
  const handleEndCall = async () => {
    if (isEnding()) return;

    setIsEnding(true);
    const currentUser = user();

    if (currentUser) {
      try {
        const currentCall = call();

        // If call is ringing, decline it instead of ending
        if (currentCall?.status === 'ringing') {
          await declineCall(props.callId, currentUser.uid);
        } else if (currentCall?.status === 'active') {
          await endCall(props.callId, currentUser.uid);
        }
      } catch (err) {
        console.error('Error ending call:', err);
      }
    }

    cleanup();
    props.onEnd();
  };

  // Cleanup function
  const cleanup = () => {
    // Clear intervals
    if (durationInterval) {
      clearInterval(durationInterval);
    }
    if (balanceInterval) {
      clearInterval(balanceInterval);
    }

    // Disconnect from LiveKit room
    if (room) {
      room.disconnect();
      room = null;
    }

    // Stop remote audio
    if (remoteAudio) {
      remoteAudio.pause();
      remoteAudio.srcObject = null;
    }
  };

  // Cleanup on unmount
  onCleanup(() => {
    cleanup();
  });

  // Format duration as MM:SS
  const formatDuration = () => {
    const mins = Math.floor(duration() / 60);
    const secs = duration() % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Format cost
  const formatCost = () => {
    return cost().toFixed(2);
  };

  // Connection status display
  const connectionStatus = () => {
    switch (connectionState()) {
      case 'connected':
        return { text: 'Connected', color: 'text-green-400' };
      case 'connecting':
        return { text: 'Connecting...', color: 'text-yellow-400' };
      case 'disconnected':
        return { text: 'Disconnected', color: 'text-red-400' };
      case 'failed':
        return { text: 'Connection Failed', color: 'text-red-400' };
      default:
        return { text: 'Initializing...', color: 'text-gray-400' };
    }
  };

  return (
    <div
      class="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="call-modal-title"
    >
      {/* Video Mode */}
      <Show when={isCameraEnabled() || isRemoteVideoEnabled()}>
        <div class="fixed inset-0 bg-black">
          {/* Remote Video (full screen) or Local if swapped */}
          <VideoContainer
            stream={videoSwapped() ? localVideoStream() : remoteVideoStream()}
            isMirrored={videoSwapped()}
            isLocal={videoSwapped()}
          />

          {/* Local Video Preview (PiP) */}
          <Show when={isCameraEnabled()}>
            <LocalVideoPreview
              stream={videoSwapped() ? remoteVideoStream() : localVideoStream()}
              onTap={swapVideos}
              isMirrored={!videoSwapped()}
            />
          </Show>

          {/* Call Info Overlay */}
          <CallInfoOverlay
            duration={formatDuration()}
            cost={formatCost()}
            isFree={call()?.isFree}
            connectionState={connectionState()}
          />

          {/* Camera Error Display */}
          <Show when={cameraError()}>
            <div class="absolute top-24 left-4 right-4 mx-auto max-w-md z-10">
              <div class="p-4 bg-red-500/95 border border-red-400/50 rounded-lg shadow-2xl backdrop-blur-sm">
                <div class="flex items-start gap-3">
                  <svg class="w-5 h-5 text-white flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div class="flex-1">
                    <p class="text-sm text-white font-medium leading-relaxed">
                      {cameraError()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Show>

          {/* Call Controls */}
          <CallControls
            isMuted={isMuted()}
            isCameraEnabled={isCameraEnabled()}
            isCameraLoading={isCameraLoading()}
            onToggleMute={toggleMute}
            onToggleCamera={toggleCamera}
            onEndCall={handleEndCall}
            isEnding={isEnding()}
          />
        </div>
      </Show>

      {/* Audio-Only Mode */}
      <Show when={!isCameraEnabled() && !isRemoteVideoEnabled()}>
        <div class="flex items-center justify-center p-4 h-full">
          {/* Backdrop */}
          <div class="absolute inset-0 bg-black/90 backdrop-blur-sm" />

          {/* Modal Card */}
          <div class="relative bg-[#111] border border-white/10 rounded-2xl shadow-2xl max-w-md w-full p-6">

            {/* Connection Status */}
            <div class="flex items-center justify-center gap-2 mb-4">
              <div class={`w-2 h-2 rounded-full ${connectionState() === 'connected' ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
              <span class={`text-sm ${connectionStatus().color}`}>
                {connectionStatus().text}
              </span>
            </div>

            {/* Call Duration */}
            <div class="text-center mb-6">
              <h2 id="call-modal-title" class="text-4xl font-bold text-white mb-2 font-mono">
                {formatDuration()}
              </h2>
              <Show when={!call()?.isFree}>
                <p class="text-sm text-white/60">
                  Cost: <span class="text-white font-semibold">{formatCost()}</span> credits
                </p>
                <Show when={balance() > 0}>
                  <p class="text-xs text-white/40 mt-1">
                    Balance: {balance().toFixed(2)} credits
                  </p>
                </Show>
              </Show>
              <Show when={call()?.isFree}>
                <p class="text-sm text-green-400 font-semibold">
                  Free Call
                </p>
              </Show>
            </div>

            {/* Error Message */}
            <Show when={error()}>
              <div class="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                <p class="text-sm text-red-300 text-center">
                  {error()}
                </p>
              </div>
            </Show>

            {/* Camera Error Message */}
            <Show when={cameraError()}>
              <div class="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                <p class="text-sm text-red-300 text-center">
                  {cameraError()}
                </p>
              </div>
            </Show>

            {/* Participant Info */}
            <div class="flex flex-col items-center mb-6">
              <div class="w-24 h-24 rounded-full overflow-hidden mb-3 border-2 border-white/20">
                <Show
                  when={otherUserPhoto()}

                >
                  <img
                    src={otherUserPhoto()!}
                    alt={otherUserName()}
                    class="w-full h-full object-cover"
                  />
                </Show>
              </div>
              <p class="text-lg font-semibold text-white mb-1">
                {otherUserName()}
              </p>
              <p class="text-sm text-white/60">
                {props.isInitiator ? 'Calling...' : 'Incoming Call'}
              </p>
            </div>

            {/* Call Controls or Accept/Decline Buttons */}
            <Show
              when={!props.isInitiator && call()?.status === 'ringing'}
              fallback={
                <CallControls
                  isMuted={isMuted()}
                  isCameraEnabled={isCameraEnabled()}
                  isCameraLoading={isCameraLoading()}
                  onToggleMute={toggleMute}
                  onToggleCamera={toggleCamera}
                  onEndCall={handleEndCall}
                  isEnding={isEnding()}
                />
              }
            >
              {/* Accept/Decline Buttons for Incoming Call */}
              <div class="flex gap-4">
                <button
                  onClick={handleDeclineCall}
                  disabled={isEnding()}
                  class="flex-1 h-14 rounded-xl bg-red-500/90 hover:bg-red-500 text-white font-semibold text-base flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Decline
                </button>
                <button
                  onClick={handleAcceptCall}
                  class="flex-1 h-14 rounded-xl bg-green-500/90 hover:bg-green-500 text-white font-semibold text-base flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Accept
                </button>
              </div>
            </Show>

            {/* Call Quality Indicator */}
            <Show when={connectionState() === 'connected'}>
              <div class="flex items-center justify-center gap-1 mt-4">
                <div class="w-1 h-3 bg-green-400 rounded-full" />
                <div class="w-1 h-4 bg-green-400 rounded-full" />
                <div class="w-1 h-5 bg-green-400 rounded-full" />
                <div class="w-1 h-4 bg-green-400 rounded-full" />
                <div class="w-1 h-3 bg-green-400 rounded-full" />
              </div>
            </Show>
          </div>
        </div>
      </Show>

      {/* Hidden audio element for remote stream */}
      <audio ref={remoteAudio} autoplay />
    </div>
  );
}
