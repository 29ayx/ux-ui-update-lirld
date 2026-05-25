import { Show, createSignal, onMount } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { HiSolidChevronLeft, HiSolidCurrencyDollar, HiSolidClock, HiSolidPhone } from "solid-icons/hi";
import { useAuth } from "~/lib/auth";
import HostApplicationForm from "~/components/HostApplicationForm";
import HostStatusCard from "~/components/HostStatusCard";
import { getHostApplicationStatus, withdrawHostApplication, type HostApplication } from "~/lib/host";

export default function HostApply() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [applicationStatus, setApplicationStatus] = createSignal<HostApplication | null>(null);
  const [isLoading, setIsLoading] = createSignal(true);

  onMount(async () => {
    const currentUser = user();
    if (!currentUser) {
      navigate("/login");
      return;
    }

    try {
      const status = await getHostApplicationStatus(currentUser.uid);
      setApplicationStatus(status);
    } catch (error: any) {
      console.log("📝 No host application found:", error.code);
      setApplicationStatus(null);
    } finally {
      setIsLoading(false);
    }
  });

  const handleFormSubmit = async () => {
    const currentUser = user();
    if (!currentUser) return;

    try {
      const status = await getHostApplicationStatus(currentUser.uid);
      setApplicationStatus(status);
    } catch (error) {
      console.error("Error reloading application status:", error);
    }
  };

  const handleFormCancel = () => {
    navigate("/settings");
  };

  const handleWithdraw = async () => {
    const currentUser = user();
    if (!currentUser) return;

    try {
      await withdrawHostApplication(currentUser.uid);
      setApplicationStatus(null);
    } catch (error) {
      console.error("Error withdrawing application:", error);
    }
  };

  return (
    <main class="min-h-screen bg-black p-4">
      <div class="max-w-2xl mx-auto space-y-4 mb-24">
        <div class="flex items-center gap-3">
          <button
            onClick={() => navigate("/settings")}
            class="p-2 bg-[#111] rounded-xl"
          >
            <HiSolidChevronLeft class="w-5 h-5 text-white" />
          </button>
          <h1 class="text-2xl font-bold text-white">Become a Host</h1>
        </div>

        <Show when={isLoading()}>
          <div class="bg-[#111] rounded-2xl p-8">
            <div class="flex items-center justify-center gap-3">
              <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              <span class="text-white/60">Loading...</span>
            </div>
          </div>
        </Show>

        <Show when={!isLoading()}>
          <Show when={applicationStatus()}>
            {(application) => (
              <HostStatusCard
                status={application().status}
                pricePerMinute={application().pricePerMinute}
                appliedAt={application().appliedAt}
                onWithdraw={handleWithdraw}
              />
            )}
          </Show>

          <Show when={!applicationStatus()}>
            <div class="space-y-4">
              <div class="bg-[#111] rounded-2xl p-5">
                <h2 class="text-xl font-bold text-white mb-2">Start Earning</h2>
                <p class="text-white/60 text-sm">Turn your time into money</p>
              </div>

              <div class="grid grid-cols-3 gap-3">
                <div class="bg-[#111] rounded-2xl p-4">
                  <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-3">
                    <HiSolidCurrencyDollar class="w-5 h-5 text-white" />
                  </div>
                  <h3 class="text-white font-semibold text-sm mb-1">Set Rate</h3>
                  <p class="text-white/50 text-xs">Your price</p>
                </div>

                <div class="bg-[#111] rounded-2xl p-4">
                  <div class="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-3">
                    <HiSolidClock class="w-5 h-5 text-white" />
                  </div>
                  <h3 class="text-white font-semibold text-sm mb-1">Flexible</h3>
                  <p class="text-white/50 text-xs">Anytime</p>
                </div>

                <div class="bg-[#111] rounded-2xl p-4">
                  <div class="w-10 h-10 bg-gradient-to-br from-pink-500 to-red-600 rounded-xl flex items-center justify-center mb-3">
                    <HiSolidPhone class="w-5 h-5 text-white" />
                  </div>
                  <h3 class="text-white font-semibold text-sm mb-1">Calls</h3>
                  <p class="text-white/50 text-xs">Get paid</p>
                </div>
              </div>

              <div class="bg-[#111] rounded-2xl p-5 space-y-3">
                <h3 class="text-white font-semibold">Earning Potential</h3>
                <div class="space-y-2">
                  <div class="flex justify-between">
                    <span class="text-white/60 text-sm">$0.10/min</span>
                    <span class="text-white font-semibold">$6/hr</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-white/60 text-sm">$0.25/min</span>
                    <span class="text-white font-semibold">$15/hr</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-white/60 text-sm">$0.50/min</span>
                    <span class="text-white font-semibold">$30/hr</span>
                  </div>
                </div>
              </div>

              <HostApplicationForm
                userId={user()!.uid}
                onSubmit={handleFormSubmit}
                onCancel={handleFormCancel}
              />
            </div>
          </Show>
        </Show>
      </div>
    </main>
  );
}
