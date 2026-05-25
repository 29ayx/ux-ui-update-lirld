import { Show, createSignal, onMount, createMemo } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { useAuth } from "~/lib/auth";
import { db } from "~/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export default function HostSettings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isHost, setIsHost] = createSignal(false);
  const [pricePerMinute, setPricePerMinute] = createSignal(0);
  const [priceInput, setPriceInput] = createSignal("0.00");
  const [priceDirty, setPriceDirty] = createSignal(false);
  const [initialPrice, setInitialPrice] = createSignal(0);
  const [isAvailable, setIsAvailable] = createSignal(true);
  const [loading, setLoading] = createSignal(true);
  const [saving, setSaving] = createSignal(false);
  const [availabilitySaving, setAvailabilitySaving] = createSignal(false);
  const [message, setMessage] = createSignal<{ type: "success" | "error"; text: string } | null>(null);

  const formatPrice = (value: number) => value.toFixed(2);

  const isPriceValid = createMemo(() => pricePerMinute() >= 0.05 && pricePerMinute() <= 50);
  const priceError = createMemo(() => {
    if (pricePerMinute() < 0.05) return "Minimum price is $0.05";
    if (pricePerMinute() > 50) return "Maximum price is $50.00";
    return null;
  });

  onMount(async () => {
    const currentUser = user();
    if (!currentUser) {
      navigate("/login");
      return;
    }

    try {
      const userDoc = await getDoc(doc(db, "users", currentUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.isHost !== true) {
          navigate("/host/apply");
          return;
        }
        setIsHost(true);
        const price = typeof userData.pricePerMinute === "number" ? userData.pricePerMinute : 0;
        setPricePerMinute(price);
        setInitialPrice(price);
        setPriceInput(formatPrice(price || 0));
        setIsAvailable(userData.isAvailable !== false);
      } else {
        navigate("/host/apply");
      }
    } catch (error) {
      console.error("Error loading host settings:", error);
      setMessage({ type: "error", text: "Failed to load settings" });
    } finally {
      setLoading(false);
    }
  });

  const handleSave = async () => {
    const currentUser = user();
    if (!currentUser) return;

    setSaving(true);
    setMessage(null);

    try {
      await updateDoc(doc(db, "users", currentUser.uid), {
        pricePerMinute: pricePerMinute(),
      });

      setInitialPrice(pricePerMinute());
      setPriceDirty(false);
      setMessage({ type: "success", text: "Pricing updated successfully!" });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error("Error saving settings:", error);
      setMessage({ type: "error", text: "Failed to save settings" });
    } finally {
      setSaving(false);
    }
  };

  const calculateHourlyRate = () => {
    return (pricePerMinute() * 60).toFixed(2);
  };

  const handlePriceInput = (event: InputEvent & { currentTarget: HTMLInputElement }) => {
    const digitsOnly = event.currentTarget.value.replace(/\D/g, "");
    const limitedDigits = digitsOnly.slice(0, 4); // up to 9999 (99.99) but we'll clamp later
    const cents = limitedDigits ? parseInt(limitedDigits, 10) : 0;
    const clampedCents = Math.min(cents, 5000);
    const formattedValue = (clampedCents / 100).toFixed(2);

    setPriceInput(formattedValue);
    setPricePerMinute(clampedCents / 100);
    setPriceDirty(formattedValue !== formatPrice(initialPrice()));
  };

  const handleAvailabilityToggle = async () => {
    const currentUser = user();
    if (!currentUser || availabilitySaving()) return;

    const newStatus = !isAvailable();
    setIsAvailable(newStatus);
    setAvailabilitySaving(true);
    setMessage(null);

    try {
      await updateDoc(doc(db, "users", currentUser.uid), {
        isAvailable: newStatus,
      });

      setMessage({
        type: "success",
        text: newStatus
          ? "You're available for calls. Your profile will show a call button now."
          : "You're unavailable. Your call button is hidden.",
      });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error("Error updating availability:", error);
      setIsAvailable(!newStatus);
      setMessage({ type: "error", text: "Failed to update availability" });
    } finally {
      setAvailabilitySaving(false);
    }
  };

  return (
    <main class="min-h-screen bg-whitedark:bg-black pb-24">
      {/* Header */}
      <div class="top-0 z-50 dark:text-white text-black dark:bg-black backdrop-blur-xl border-b border-white/10">
        <div class="max-w-4xl mx-auto px-4 sm:px-6">
          <div class="flex items-center gap-3 h-14 sm:h-16">
            <button
              onClick={() => navigate("/profile")}
              class="p-2 hover:bg-white/10 rounded-xl transition-colors"
            >
              <svg class="w-5 h-5 text-black dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 class="text-xl sm:text-2xl font-bold text-black dark:text-white">Host Settings</h1>
          </div>
        </div>
      </div>

      {/* Loading State */}
      <Show when={loading()}>
        <div class="max-w-4xl mx-auto px-4 sm:px-6 py-12">
          <div class="text-center text-white/60">
            <div class="inline-flex items-center gap-2">
              <div class="w-2 h-2 bg-white rounded-full animate-bounce" style="animation-delay: 0s"></div>
              <div class="w-2 h-2 bg-white rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
              <div class="w-2 h-2 bg-white rounded-full animate-bounce" style="animation-delay: 0.4s"></div>
            </div>
            <p class="mt-4 text-sm">Loading settings...</p>
          </div>
        </div>
      </Show>

      {/* Content */}
      <Show when={!loading() && isHost()}>
        <div class="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          {/* Message */}
          <Show when={message()}>
            {(msg) => (
              <div
                class={`rounded-xl p-4 ${msg().type === "success"
                  ? "bg-green-500 border border-green-500/30 text-white"
                  : "bg-red-500 border border-red-500 text-white"
                  }`}
              >
                {msg().text}
              </div>
            )}
          </Show>

          {/* Availability Toggle */}
          <div class="bg-[#111] rounded-2xl p-6 border border-white/10">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-lg font-semibold text-white mb-1">Availability Status</h2>
                <p class="text-white/60 text-sm">
                  {isAvailable() ? "You're available for calls" : "You're currently unavailable"}
                </p>
              </div>
              <button
                onClick={handleAvailabilityToggle}
                disabled={availabilitySaving()}
                class={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${isAvailable() ? "bg-green-500" : "bg-white/20"
                  } ${availabilitySaving() ? "opacity-60 cursor-not-allowed" : ""}`}
              >
                <span
                  class={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${isAvailable() ? "translate-x-7" : "translate-x-1"
                    }`}
                />
              </button>
            </div>
            <Show when={!isAvailable()}>
              <p class="text-xs text-white/60 mt-2">
                Turn on availability to set your pricing and accept calls.
              </p>
            </Show>
            <Show when={isAvailable()}>
              <p class="text-xs text-green-300 mt-2">Your profile will show a call button while available.</p>
            </Show>
          </div>

          {/* Pricing Settings */}
          <Show when={isAvailable()}>
            <div class="bg-[#111] rounded-2xl p-6 border border-white/10 space-y-6">
              <div>
                <h2 class="text-lg font-semibold text-white mb-1">Pricing</h2>
                <p class="text-white/60 text-sm">Set your rate per minute</p>
              </div>

              {/* Price Input */}
              <div>
                <label class="block text-sm font-medium text-white/70 mb-2">Price per Minute</label>
                <div class="relative">
                  <span class="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 text-lg">$</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={priceInput()}
                    onInput={handlePriceInput}
                    class="w-full bg-white/5 border border-white/10 rounded-xl px-4 pl-8 py-3 text-white text-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50"
                    placeholder="0.50"
                  />
                </div>
                <p class="text-white/40 text-xs mt-2">Minimum: $0.05 | Maximum: $50.00</p>
                <Show when={priceError()}>
                  {(error) => <p class="text-red-400 text-xs mt-1">{error()}</p>}
                </Show>
              </div>

              {/* Hourly Rate Display */}
              <div class="bg-white/5 rounded-xl p-4 border border-white/10">
                <div class="flex items-center justify-between">
                  <span class="text-white/60 text-sm">Hourly Rate</span>
                  <span class="text-white font-bold text-xl">${calculateHourlyRate()}/hr</span>
                </div>
              </div>

              {/* Earnings Examples */}
              <div class="space-y-3">
                <h3 class="text-white font-semibold text-sm">Potential Earnings</h3>
                <div class="grid grid-cols-3 gap-3">
                  <div class="bg-white/5 rounded-xl p-3 border border-white/10 text-center">
                    <p class="text-white/60 text-xs mb-1">10 min call</p>
                    <p class="text-white font-bold">${(pricePerMinute() * 10).toFixed(2)}</p>
                  </div>
                  <div class="bg-white/5 rounded-xl p-3 border border-white/10 text-center">
                    <p class="text-white/60 text-xs mb-1">30 min call</p>
                    <p class="text-white font-bold">${(pricePerMinute() * 30).toFixed(2)}</p>
                  </div>
                  <div class="bg-white/5 rounded-xl p-3 border border-white/10 text-center">
                    <p class="text-white/60 text-xs mb-1">1 hour call</p>
                    <p class="text-white font-bold">${(pricePerMinute() * 60).toFixed(2)}</p>
                  </div>
                </div>
              </div>

              <Show when={priceDirty()}>
                <button
                  onClick={handleSave}
                  disabled={saving() || !isPriceValid()}
                  class="w-full bg-linear-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg active:scale-[0.98] disabled:cursor-not-allowed"
                >
                  {saving() ? "Saving..." : "Save Pricing"}
                </button>
              </Show>
            </div>
          </Show>

          {/* Stats Card */}
          <div class="bg-[#111] rounded-2xl p-6 border border-white/10">
            <h2 class="text-lg font-semibold text-white mb-4">Your Stats</h2>
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-white/5 rounded-xl p-4 border border-white/10">
                <p class="text-white/60 text-sm mb-1">Total Calls</p>
                <p class="text-white font-bold text-2xl">0</p>
              </div>
              <div class="bg-white/5 rounded-xl p-4 border border-white/10">
                <p class="text-white/60 text-sm mb-1">Total Earnings</p>
                <p class="text-white font-bold text-2xl">$0.00</p>
              </div>
              {/* <div class="bg-white/5 rounded-xl p-4 border border-white/10">
                <p class="text-white/60 text-sm mb-1">Avg Call Time</p>
                <p class="text-white font-bold text-2xl">0 min</p>
              </div>
              <div class="bg-white/5 rounded-xl p-4 border border-white/10">
                <p class="text-white/60 text-sm mb-1">Rating</p>
                <p class="text-white font-bold text-2xl">⭐ N/A</p>
              </div> */}
            </div>
          </div>

          {/* Tips Card */}
          <div class="bg-linear-to-br from-green-800 to-emerald-600 rounded-2xl p-6 border border-green-500/30">
            <div class="flex items-start gap-3">
              <div class="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center shrink-0">
                <svg class="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <div>
                <h3 class="text-white font-semibold mb-2">Tips for Success</h3>
                <ul class="space-y-1 text-white text-sm">
                  <li>• Complete your profile with photos and bio</li>
                  <li>• Set competitive pricing for your market</li>
                  <li>• Be responsive and friendly during calls</li>
                  <li>• Keep your availability status updated</li>
                </ul>
              </div>
            </div>
          </div>

        </div>
      </Show>
    </main>
  );
}
