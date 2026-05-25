import { Show, createSignal, createMemo } from "solid-js";
import { useAuth } from "~/lib/auth";
import { getOrCreateChat, sendMessage } from "~/lib/chat";
import { IoMale, IoFemale, IoPerson, IoGlobe, IoTime, IoChatbubbleEllipses } from 'solid-icons/io';
import { CgSpinner } from "solid-icons/cg";
import { A } from "@solidjs/router";
import { useHapticFeedback } from "~/hooks/useHapticFeedback";
import { UserProfileWithOnlineStatus } from "~/lib/users";

interface ProfileCardProps {
    profile: UserProfileWithOnlineStatus;
    onMessageSent?: (userId: string) => void;
    onCallInitiated?: (userId: string) => void;
    hidePricing?: boolean;
    isMessaged?: boolean;
}

export default function ProfileCardMatrix(props: ProfileCardProps) {
    const { user } = useAuth();
    const haptic = useHapticFeedback();
    const [sendingChat, setSendingChat] = createSignal(false);
    const [sent, setSent] = createSignal(false);

    // Creative Engagement Metrics
    const engagement = createMemo(() => {
        const seed = props.profile.user_id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const sync = 80 + (seed % 19); // 80-99% match
        const response = ['⚡ INSTANT', '💨 FAST', '🧘 STEADY'][seed % 3];
        const vibes = ['CHILL', 'ADVENTUROUS', 'CREATIVE', 'INTELLECTUAL', 'ENERGETIC', 'MYSTERIOUS'];
        const vibe = vibes[seed % vibes.length];
        return { sync, response, vibe };
    });

    const photo = () => {
        const photos = props.profile.photos;
        if (Array.isArray(photos) && photos.length > 0) {
            return photos[0];
        }
        return props.profile.photoURL || null;
    };

    const handleChat = async () => {
        if (sendingChat() || sent()) return;
        if (!user()) {
            props.onMessageSent?.(props.profile.user_id);
            return;
        }
        haptic.trigger(30);
        setSendingChat(true);
        try {
            const chatId = await getOrCreateChat(user()!.uid, props.profile.user_id);
            await sendMessage(chatId, user()!.uid, "Hello from Matrix");
            setSent(true);
            setTimeout(() => {
                props.onMessageSent?.(props.profile.user_id);
            }, 1000);
        } catch (err) {
            console.error(err);
            setSendingChat(false);
        }
    };

    return (
        <div style={{
            padding: "1px",
            background: "#c0c0c0",
            border: "2px outset #fff",
            color: "#000",
            width: "100%",
            "box-sizing": "border-box",
            "font-family": "Fixedsys, 'Courier New', monospace",
            "box-shadow": "4px 4px 0px #000"
        }}>
            {/* OS Header */}
            <div style={{
                background: props.profile.isOnline ? "#000080" : "#808080",
                color: "#fff",
                padding: "2px 4px",
                "font-weight": "bold",
                display: "flex",
                "align-items": "center",
                "justify-content": "space-between",
                border: "1px inset #fff"
            }}>
                <div style={{ display: "flex", "align-items": "center", gap: "5px" }}>
                    <span>🛰️</span>
                    <span>SIGNAL_NODE_{props.profile.user_id.substring(0, 4)}:STABLE</span>
                </div>
                <div style={{ display: "flex", gap: "2px" }}>
                    <div style={{ width: "12px", height: "12px", background: "#c0c0c0", border: "1px outset #fff" }} />
                    <div style={{ width: "12px", height: "12px", background: "#c0c0c0", border: "1px outset #fff" }} />
                    <div style={{ width: "12px", height: "12px", background: "#c0c0c0", border: "1px outset #fff" }} />
                </div>
            </div>

            {/* Main Container - Vertical Stack for Photo Priority */}
            <div style={{ padding: "8px", display: "flex", "flex-direction": "column", gap: "8px" }}>

                {/* BIG PHOTO - Priority 1 */}
                <div style={{
                    width: "100%",
                    padding: "2px",
                    background: "#000",
                    border: "3px inset #fff",
                    position: "relative",
                    overflow: "hidden"
                }}>
                    <Show when={photo()} fallback={
                        <div style={{ height: "240px", display: "flex", "align-items": "center", "justify-content": "center", background: "#111", color: "#333" }}>
                            <IoPerson size={100} />
                        </div>
                    }>
                        <img
                            src={photo()!}
                            style={{
                                width: "100%",
                                height: "auto",
                                "max-height": "280px",
                                "object-fit": "cover",
                                filter: props.profile.isOnline ? "none" : "grayscale(100%) brightness(0.7)"
                            }}
                            alt=""
                        />
                    </Show>

                    {/* Overlay Scanner Line Effect */}
                    <div style={{
                        position: "absolute",
                        top: "0",
                        left: "0",
                        width: "100%",
                        height: "2px",
                        background: "rgba(0, 255, 0, 0.3)",
                        "box-shadow": "0 0 10px rgba(0, 255, 0, 0.5)",
                        animation: "scan 4s linear infinite",
                        "pointer-events": "none"
                    }} />

                    {/* Internal Photo Text */}
                    <div style={{
                        position: "absolute",
                        bottom: "0",
                        left: "0",
                        background: "rgba(0,0,0,0.7)",
                        color: "#0f0",
                        padding: "2px 6px",
                        "font-size": "9px"
                    }}>
                        REC_ID: {Math.random().toString(36).substring(2, 10).toUpperCase()}
                    </div>
                </div>

                {/* DATA GRID - Data Rich Section */}
                <div style={{ display: "grid", "grid-template-columns": "1fr 1fr", gap: "4px" }}>
                    <div style={{ background: "#eee", border: "1px inset #fff", padding: "4px" }}>
                        <div style={{ color: "#000080", "font-size": "9px", "font-weight": "bold" }}>IDENT_DATA</div>
                        <div style={{ "font-size": "14px", "font-weight": "black" }}>{props.profile.name}</div>
                        <div style={{ "font-size": "10px", color: "#666" }}>{props.profile.gender || "NULL"} // {props.profile.age || "??"}YRS</div>
                    </div>
                    <div style={{ background: "#000", border: "1px inset #fff", padding: "4px", color: "#0f0" }}>
                        <div style={{ "font-size": "8px" }}>SIGNAL_STRENGTH</div>
                        <div style={{ display: "flex", gap: "1px", "margin-top": "2px" }}>
                            <div style={{ width: "4px", height: "8px", background: "#0f0" }} />
                            <div style={{ width: "4px", height: "8px", background: "#0f0" }} />
                            <div style={{ width: "4px", height: "8px", background: "#0f0" }} />
                            <div style={{ width: "4px", height: "8px", background: props.profile.isOnline ? "#0f0" : "#040" }} />
                            <div style={{ width: "4px", height: "8px", background: "#111" }} />
                        </div>
                    </div>
                </div>

                {/* RAW SYSTEM OUTPUT */}
                <div style={{
                    background: "#111",
                    color: "#0c0",
                    padding: "6px",
                    border: "2px inset #fff",
                    "font-size": "10px",
                    "line-height": "1.2"
                }}>
                    <div>{'>'} FETCHING RAW_METRICS...</div>
                    <div style={{ display: "grid", "grid-template-columns": "auto 1fr", gap: "8px", "margin-top": "4px" }}>
                        <span style={{ color: "#080" }}>ADDR:</span>
                        <span>192.168.{Math.floor(Math.random() * 255)}.{Math.floor(Math.random() * 255)}</span>

                        <span style={{ color: "#080" }}>LATN:</span>
                        <span>{Math.floor(Math.random() * 150)}ms // OK</span>

                        <span style={{ color: "#080" }}>PACK:</span>
                        <span>{engagement().sync}kB/s</span>

                        <span style={{ color: "#080" }}>SESS:</span>
                        <span style={{ "word-break": "break-all" }}>{props.profile.user_id.toUpperCase().substring(0, 16)}</span>
                    </div>
                </div>

                {/* Action Controls */}
                <div style={{ display: "flex", gap: "4px" }}>
                    <button
                        onClick={handleChat}
                        disabled={sendingChat() || sent()}
                        style={{
                            "flex-grow": 1,
                            padding: "8px",
                            background: "#c0c0c0",
                            border: "2px outset #fff",
                            cursor: "pointer",
                            "font-weight": "bold",
                            display: "flex",
                            "align-items": "center",
                            "justify-content": "center",
                            gap: "6px"
                        }}
                    >
                        <Show when={sendingChat()} fallback={
                            <>
                                <IoChatbubbleEllipses size={16} />
                                <span>{sent() ? "DATA_TX_COMPLETE" : "OPEN_STREAM"}</span>
                            </>
                        }>
                            <CgSpinner class="animate-spin" />
                        </Show>
                    </button>

                    <A
                        href={`?profileModal=${props.profile.user_id}`}
                        style={{
                            width: "40px",
                            display: "flex",
                            "align-items": "center",
                            "justify-content": "center",
                            background: "#c0c0c0",
                            border: "2px outset #fff",
                            color: "#000",
                            "text-decoration": "none"
                        }}
                    >
                        🛰️
                    </A>
                </div>
            </div>

            <style>{`
        @keyframes scan {
          0% { top: 0; }
          100% { top: 100%; }
        }
      `}</style>
        </div>
    );
}
