import { Router, useLocation, useSearchParams } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense, Show, createMemo, onMount } from "solid-js";
import Nav from "~/components/Nav";
import ProfileModal from "~/components/profile/ProfileModal";
// import BalanceDisplay from "~/components/BalanceDisplay";
import IncomingCallListener from "~/components/IncomingCallListener";
import OutgoingCallManager from "~/components/OutgoingCallManager";
import { AuthProvider, useAuth } from "~/lib/auth";
import Login from "~/components/Login";
import ProfileSetup from "~/components/ProfileSetup";
import { cleanupOldRingingCalls } from "~/lib/cleanupCalls";
import { db } from "~/lib/firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import GlobalLoader from "~/components/GlobalLoader";
import { MetaProvider, Title, Meta, Link } from "@solidjs/meta";
import { selectedProfileId, closeProfile } from "~/lib/profileStore";
import "./app.css";

import Sidebar from "~/components/Sidebar";

function RootLayout(props: { children?: any }) {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, profileCompleted, ready, setProfileCompleted } = useAuth();

  // Centralized lastSeen update - only for users with completed profiles
  onMount(() => {
    let lastSeenInterval: number | null = null;
    let lastUpdateTime = 0;

    const updateLastSeen = async () => {
      const currentUser = user();
      const hasProfile = profileCompleted();

      // Only update if user exists and has completed profile
      if (!currentUser || !hasProfile) {
        return;
      }

      try {
        const now = Date.now();
        // Throttle: Only update if more than 5 minutes have passed
        if (now - lastUpdateTime < 5 * 60 * 1000) {
          return;
        }
        lastUpdateTime = now;

        const userRef = doc(db, "users", currentUser.uid);
        await updateDoc(userRef, {
          lastSeen: serverTimestamp(),
        });
      } catch (error) {
        console.error("Error updating lastSeen:", error);
      }
    };

    // Set up interval to update every 5 minutes
    lastSeenInterval = setInterval(() => {
      updateLastSeen();
    }, 5 * 60 * 1000) as unknown as number;

    // Cleanup old ringing calls
    if (user()) {
      cleanupOldRingingCalls();
    }

    return () => {
      if (lastSeenInterval) {
        clearInterval(lastSeenInterval);
      }
    };
  });

  // Check if we're on a public page (no auth required) - purely path-based
  const isPublicPage = createMemo(() => {
    const path = location.pathname;
    return path.startsWith("/legal/") || path === "/about" || path === "/explore-users" || path === "/v3" || path === "/install";
  });

  // Check if we're on a chat detail page or edit page (hide navbar there)
  const isChatDetailPage = createMemo(() => {
    const path = location.pathname;
    return path.startsWith("/chats/") && path !== "/chats";
  });

  const isEditPage = createMemo(() => {
    const path = location.pathname;
    return path === "/profile/edit";
  });



  const isV2Page = createMemo(() => {
    const path = location.pathname;
    return path === "/v2" || path === "/v3";
  });

  return (
    <>
      {/* Public pages - no auth required, render immediately */}
      <Show
        when={isPublicPage()}
        fallback={
          <Show
            when={ready()}
            fallback={<GlobalLoader />}
          >
            <Show
              when={user()}
              fallback={<Login />}
            >
              <Show
                when={profileCompleted()}
                fallback={
                  <ProfileSetup
                    onComplete={() => setProfileCompleted(true)}
                  />
                }
              >
                <>
                  {/* <BalanceDisplay /> */}
                  <IncomingCallListener />
                  <OutgoingCallManager />

                  {/* Main layout with responsive navigation */}
                  <Show
                    when={!isChatDetailPage() && !isEditPage() && !isV2Page()}
                    fallback={
                      <div class={isChatDetailPage() || isV2Page() ? "" : "pb-1"}>
                        <Suspense>{props.children}</Suspense>
                      </div>
                    }
                  >
                    {/* Layout with sidebar - content takes full width with right padding for fixed sidebar */}
                    <div class="flex">
                      {/* Sidebar navigation - fixed positioned (Desktop) */}
                      <Sidebar />

                      {/* Main content area - full width with padding to accommodate the 48px/64px sidebar */}
                      <div class="pb-1 w-full pr-12 md:pr-16 lg:ml-72">
                        <Suspense>{props.children}</Suspense>
                      </div>

                      {/* Right side navigation - fixed positioned (Mobile/Tablet) */}
                      <Nav />
                    </div>
                  </Show>
                </>
              </Show>
            </Show>
          </Show>
        }
      >
        {/* Render public pages without navigation */}
        <div class="pb-1">
          <Suspense>{props.children}</Suspense>
        </div>
      </Show>

      
      <Show when={selectedProfileId()}>
        <ProfileModal 
          userId={selectedProfileId()!} 
          onClose={closeProfile} 
        />
      </Show>
    </>
  );
}

export default function App() {
  // Initialize Google Analytics
  onMount(() => {
    // Add gtag script
    const script1 = document.createElement('script');
    script1.async = true;
    script1.src = 'https://www.googletagmanager.com/gtag/js?id=G-ZFQ6QCMYBN';
    document.head.appendChild(script1);

    // Add gtag initialization
    const script2 = document.createElement('script');
    script2.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-ZFQ6QCMYBN');
    `;
    document.head.appendChild(script2);
  });

  return (
    <Router root={(props) => (
      <MetaProvider>
        <AuthProvider>
          <Title>Lirld - Always feel connected</Title>
          <Meta name="description" content="Connect with people around the world. Video calls, chats, and more on Lirld." />
          <Meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0, interactive-widget=resizes-content" />

          {/* Favicons & Icons */}
          <Link rel="icon" href="/favicon.ico" />
          <Link rel="apple-touch-icon" href="/apple-touch-icon.png" />
          <Link rel="manifest" href="/manifest.json" />

          {/* Open Graph / Facebook */}
          <Meta property="og:type" content="website" />
          <Meta property="og:url" content="https://lirld.com/" />
          <Meta property="og:title" content="Lirld - Always feel connected" />
          <Meta property="og:description" content="Connect with people around the world. Video calls, chats, and more on Lirld." />
          <Meta property="og:image" content="https://lirld.com/og-image.png" />

          {/* Twitter */}
          <Meta property="twitter:card" content="summary_large_image" />
          <Meta property="twitter:url" content="https://lirld.com/" />
          <Meta property="twitter:title" content="Lirld - Always feel connected" />
          <Meta property="twitter:description" content="Connect with people around the world. Video calls, chats, and more on Lirld." />
          <Meta property="twitter:image" content="https://lirld.com/og-image.png" />

          <RootLayout {...props} />
        </AuthProvider>
      </MetaProvider>
    )}>
      <FileRoutes />
    </Router>
  );
}
