import { Component, createSignal, createEffect, Show } from "solid-js";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "~/lib/firebase";

interface MarketingBanner {
    bg_img: string;
    content: string;
    img: string;
    title: string;
    title_color?: string;
    content_color?: string;
    bg_opacity?: number;
    bg_color?: string;
    active?: boolean;
}

interface MarketingBannerProps {
    type: "banner_home" | "banner_promotion" | "plans_banner" | "banner_explore";
}

const MarketingBanner: Component<MarketingBannerProps> = (props) => {
    const [banner, setBanner] = createSignal<MarketingBanner | null>(null);

    createEffect(() => {
        const unsubscribe = onSnapshot(doc(db, "marketing", props.type), (doc) => {
            if (doc.exists()) {
                setBanner(doc.data() as MarketingBanner);
            }
        });

        return () => unsubscribe();
    });

    return (
        <Show when={banner() && banner()?.active}>
            <div
                class="rounded-xl w-full h-full min-h-[50px] p-4 lg:p-6 transform transition-all hover:scale-[1.01] active:scale-[0.99] relative overflow-hidden backdrop-blur-sm flex flex-col justify-center"
                style={{
                    "background-color": banner()?.bg_color || "#0f172a"
                }}
            >
                {/* Background Image Overlay */}
                <div
                    class="absolute  inset-0 z-0"
                    style={{
                        "background-image": `url(${banner()?.bg_img})`,
                        "background-size": "cover",
                        "background-position": "center",
                        "opacity": banner()?.bg_opacity ?? 0.3
                    }}
                />

                <div class="relative z-10 flex flex-col gap-2">
                    <div class="flex items-start justify-between gap-4">
                        <div class="flex-1">
                            <h2
                                class="text-md lg:text-xl sm:text-md font-bold tracking-tight"
                                style={{ color: banner()?.title_color || "white" }}
                            >
                                {banner()?.title}
                            </h2>
                            <p
                                class="text-sm lg:text-lg opacity-90 mt-1"
                                style={{ color: banner()?.content_color || "#cfc4a0" }}
                            >
                                {banner()?.content}
                            </p>
                        </div>
                        <Show when={banner()?.img}>
                            <img
                                src={banner()?.img}
                                alt={banner()?.title}
                                class="w-16 h-16 rounded-xl object-cover shadow-md"
                            />
                        </Show>
                    </div>
                </div>
            </div>
        </Show>
    );
};

export default MarketingBanner;
