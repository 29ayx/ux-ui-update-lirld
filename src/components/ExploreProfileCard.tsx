import { Show, createSignal } from "solid-js";
import { UserProfileWithOnlineStatus } from "~/lib/users";
import { A } from "@solidjs/router";
import { IoMale, IoFemale, IoPerson, IoCheckmarkCircle, IoVideocam, IoChatbubbleEllipses, IoLocationSharp } from 'solid-icons/io';
import { openProfile } from "~/lib/profileStore";

interface ExploreProfileCardProps {
    profile: UserProfileWithOnlineStatus;
    onMessageClick?: (userId: string, action?: string) => void;
}

export default function ExploreProfileCard(props: ExploreProfileCardProps) {
    const [isHovered, setIsHovered] = createSignal(false);
    const [imageLoaded, setImageLoaded] = createSignal(false);

    const isFemale = () => props.profile.gender === 'female';
    const isMale = () => props.profile.gender === 'male';
    const themeColor = () => isFemale() ? 'from-pink-500 to-rose-600' : isMale() ? 'from-blue-500 to-indigo-600' : 'from-purple-500 to-violet-600';
    const accentColor = () => isFemale() ? 'text-pink-400' : isMale() ? 'text-blue-400' : 'text-purple-400';
    const glowColor = () => isFemale() ? 'group-hover:shadow-pink-500/20' : isMale() ? 'group-hover:shadow-blue-500/20' : 'group-hover:shadow-purple-500/20';

    const photo = () => {
        const photos = props.profile.photos;
        if (Array.isArray(photos) && photos.length > 0) {
            return photos[0];
        }
        return props.profile.photoURL || null;
    };

    return (
        <div
            class={`relative w-full aspect-[3/4.2] rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-900 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 group border border-white/5 ${glowColor()}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Loading Skeleton */}
            <Show when={!imageLoaded()}>
                <div class="absolute inset-0 bg-gray-200 dark:bg-gray-800 animate-pulse z-0" />
            </Show>

            {/* Main Image */}
            <Show when={photo()}>
                <img
                    src={photo()!}
                    alt={props.profile.name}
                    class={`absolute inset-0 w-full h-full object-cover transition-transform duration-1000 ease-out ${isHovered() ? 'scale-110' : 'scale-100'}`}
                    loading="lazy"
                    onLoad={() => setImageLoaded(true)}
                />
            </Show>

            {/* Premium Gradient Overlay */}
            <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Top Badge: Online Status */}
            <div class="absolute top-2 left-2 z-10">
                <Show when={props.profile.isOnline} fallback={
                    <div class="flex items-center gap-1 px-2 py-0.5 bg-black/40 backdrop-blur-md rounded-full border border-white/10">
                        <div class="w-1.5 h-1.5 rounded-full bg-gray-400" />
                        <span class="text-[9px] font-bold text-white/90 uppercase tracking-tight">Away</span>
                    </div>
                }>
                    <div class="flex items-center gap-1 px-2 py-0.5 bg-green-500/80 backdrop-blur-md rounded-full border border-green-400/30">
                        <div class="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        <span class="text-[9px] font-bold text-white uppercase tracking-tight">Online</span>
                    </div>
                </Show>
            </div>

            {/* Bottom Glass Content */}
            <div class="absolute bottom-0 left-0 right-0 p-2 z-20">
                <div class="backdrop-blur-xl bg-white/10 dark:bg-black/20 rounded-xl p-2.5 border border-white/20 shadow-xl transition-all duration-500">

                    {/* User Vital Info */}
                    <div class="flex items-center justify-between gap-1 mb-1">
                        <div class="flex items-center gap-1 min-w-0">
                            <h3 class="text-sm font-bold text-white truncate leading-none">
                                {props.profile.name}
                            </h3>
                            {/* <Show when={props.profile.age}>
                                <span class="text-xs font-semibold text-white/90 leading-none">, {props.profile.age}</span>
                            </Show> */}
                            <IoCheckmarkCircle class="text-blue-400 w-3 h-3 flex-shrink-0" />
                        </div>
                        <Show when={props.profile.gender}>
                            <div class={`flex-shrink-0 ${accentColor()}`}>
                                <Show when={isFemale()} fallback={<Show when={isMale()} fallback={<IoPerson size={10} />}><IoMale size={12} /></Show>}>
                                    <IoFemale size={12} />
                                </Show>
                            </div>
                        </Show>
                    </div>

                    {/* Location/Bio Snippet */}
                    <div class="flex flex-col gap-0.5 text-white/70 text-[10px] mb-2 px-0.5">
                        <div class="flex items-center gap-1">
                            <IoLocationSharp size={10} class="flex-shrink-0 opacity-70" />
                            <span class="truncate">{props.profile.country || 'Global'}</span>
                        </div>
                        <p class="line-clamp-1 italic opacity-90 leading-tight">
                            {props.profile.bio || 'Available for chat'}
                        </p>
                    </div>

                    {/* Interaction Actions */}
                    <div class="flex gap-1.5 p-0.5">
                        <button
                            class="flex-1 h-8 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 transition-all flex items-center justify-center text-white border border-white/10"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                props.onMessageClick?.(props.profile.user_id, 'video_call');
                            }}
                            title="Video Call"
                        >
                            <IoVideocam size={14} />
                        </button>

                        <button
                            class={`flex-[2.5] h-8 rounded-lg bg-gradient-to-r ${themeColor()} hover:brightness-110 active:scale-95 shadow-lg transition-all flex items-center justify-center gap-1.5 text-white font-bold text-[10px] uppercase tracking-wider`}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                props.onMessageClick?.(props.profile.user_id, 'chat');
                            }}
                        >
                            <IoChatbubbleEllipses size={14} />
                            <span>Chat</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Click Area */}
            <div 
                onClick={() => openProfile(props.profile.user_id)}
                class="absolute inset-0 z-0 cursor-pointer" 
                aria-label={`View ${props.profile.name}`} 
            />
        </div>
    );
}
