import { createResource, Show } from 'solid-js';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '~/lib/firebase';

interface CallLogUserProps {
    userId: string;
    fallbackName?: string;
    className?: string;
}

const fetchUserData = async (userId: string) => {
    if (!userId) return null;
    try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
            const data = userDoc.data();
            // Use the new photos array format (Cloudinary)
            const photo = Array.isArray(data.photos) && data.photos.length > 0
                ? data.photos[0]
                : (data.photoURL || null);
            return {
                name: data.name || data.Name || 'Unknown User',
                photo,
            };
        }
        return null;
    } catch (error) {
        console.error('Error fetching user data for call log:', error);
        return null;
    }
};

export default function CallLogUser(props: CallLogUserProps) {
    const [userData] = createResource(() => props.userId, fetchUserData);

    const UserInitials = () => {
        const name = userData()?.name || props.fallbackName || 'Unknown';
        const initials = name
            .split(' ')
            .map((n: string) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
        return (
            <div class="w-full h-full bg-linear-to-br from-[#cfcfc4] to-black flex items-center justify-center">
                <span class="text-white text-sm font-semibold">{initials}</span>
            </div>
        );
    };

    return (
        <div class={`flex items-center gap-3 ${props.className || ''}`}>
            {/* User Photo */}
            <a href={`?profileModal=${props.userId}`} class="block">
                <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden flex-shrink-0 bg-gray-200 dark:bg-gray-800">
                    <Show when={!userData.loading} fallback={<div class="w-full h-full animate-pulse bg-gray-300 dark:bg-gray-700" />}>
                        <Show when={userData()?.photo} fallback={<UserInitials />}>
                            <img
                                src={userData()?.photo!}
                                alt={userData()?.name || 'User'}
                                class="w-full h-full object-cover"
                            />
                        </Show>
                    </Show>
                </div>
            </a>

            {/* User Name */}
            <h3 class="text-sm sm:text-base text-slate-800 dark:text-slate-100 font-semibold truncate">
                <Show when={!userData.loading} fallback={<span class="inline-block w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />}>
                    {userData()?.name || props.fallbackName || 'Unknown User'}
                </Show>
            </h3>
        </div>
    );
}
