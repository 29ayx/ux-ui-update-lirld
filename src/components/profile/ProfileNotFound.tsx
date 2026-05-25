import { A } from "@solidjs/router";

export default function ProfileNotFound() {
  return (
    <main class="min-h-screen bg-black flex items-center justify-center">
      <div class="text-center text-white">
        <h2 class="text-2xl font-bold mb-4">Profile Not Found</h2>
        <p class="text-white/60 mb-4">This profile doesn't exist.</p>
        <A href="/" class="text-blue-400 hover:text-blue-300 underline">Go to Home</A>
      </div>
    </main>
  );
}
