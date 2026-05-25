import { createSignal, Show, onMount } from "solid-js";
import HostApplicationForm from "./HostApplicationForm";
import HostStatusCard from "./HostStatusCard";
import { getHostApplicationStatus, type HostApplication } from "~/lib/host";

interface HostPromoCardProps {
  userId: string;
  onApplicationSubmitted?: () => void;
}

export default function HostPromoCard(props: HostPromoCardProps) {
  const [showForm, setShowForm] = createSignal(false);
  const [applicationStatus, setApplicationStatus] = createSignal<HostApplication | null>(null);
  const [isLoading, setIsLoading] = createSignal(true);

  // Load application status on mount
  onMount(async () => {
    try {
      const status = await getHostApplicationStatus(props.userId);
      setApplicationStatus(status);
    } catch (error: any) {
      // Permission errors are ok - user just doesn't have an application yet
      console.log("📝 No host application found:", error.code);
      setApplicationStatus(null);
    } finally {
      setIsLoading(false);
    }
  });

  const handleApplyClick = () => {
    setShowForm(true);
  };

  const handleFormCancel = () => {
    setShowForm(false);
  };

  const handleFormSubmit = async () => {
    // Reload application status after submission
    try {
      const status = await getHostApplicationStatus(props.userId);
      setApplicationStatus(status);
      setShowForm(false);
      props.onApplicationSubmitted?.();
    } catch (error) {
      console.error("Error reloading application status:", error);
    }
  };

  return (
    <div class="relative bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600 rounded-2xl p-8 shadow-2xl overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-top-4">
      {/* Background decoration */}
      <div class="absolute inset-0 opacity-10">
        <div class="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
        <div class="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
      </div>

      {/* Content */}
      <div class="relative z-10">
        <Show when={isLoading()}>
          <div class="flex items-center justify-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
          </div>
        </Show>

        <Show when={!isLoading()}>
          {/* Show status card if application exists */}
          <Show when={applicationStatus()}>
            <HostStatusCard
              status={applicationStatus()!.status}
              pricePerMinute={applicationStatus()!.pricePerMinute}
              appliedAt={applicationStatus()!.appliedAt}
            />
          </Show>

          {/* Show promo or form if no application */}
          <Show when={!applicationStatus()}>
            <Show when={!showForm()}>
              {/* Promo View */}
              <div class="space-y-6 animate-in fade-in duration-300">
                <div class="space-y-3">
                  <h2 class="text-3xl font-bold text-white">
                    Start Earning as a Host
                  </h2>
                  <p class="text-lg text-purple-100">
                    Turn your time into money. Connect with users and earn on your own schedule.
                  </p>
                </div>

                {/* Earning highlights */}
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div class="bg-white/10 backdrop-blur-sm rounded-xl p-4 space-y-2">
                    <div class="text-3xl">💰</div>
                    <h3 class="text-white font-semibold">Set Your Rate</h3>
                    <p class="text-purple-100 text-sm">
                      Choose your own per-minute price
                    </p>
                  </div>
                  <div class="bg-white/10 backdrop-blur-sm rounded-xl p-4 space-y-2">
                    <div class="text-3xl">⏰</div>
                    <h3 class="text-white font-semibold">Flexible Schedule</h3>
                    <p class="text-purple-100 text-sm">
                      Work whenever you want
                    </p>
                  </div>
                  <div class="bg-white/10 backdrop-blur-sm rounded-xl p-4 space-y-2">
                    <div class="text-3xl">📞</div>
                    <h3 class="text-white font-semibold">Easy Calls</h3>
                    <p class="text-purple-100 text-sm">
                      Users call you directly from your profile
                    </p>
                  </div>
                </div>

                {/* Earning potential */}
                <div class="bg-white/10 backdrop-blur-sm rounded-xl p-6 space-y-3">
                  <h3 class="text-white font-semibold text-lg">
                    How Much Can You Earn?
                  </h3>
                  <div class="space-y-2 text-purple-100">
                    <p class="text-sm">
                      <span class="font-semibold text-white">$0.10/min</span> × 60 minutes = <span class="font-semibold text-white">$6/hour</span>
                    </p>
                    <p class="text-sm">
                      <span class="font-semibold text-white">$0.25/min</span> × 60 minutes = <span class="font-semibold text-white">$15/hour</span>
                    </p>
                    <p class="text-sm">
                      <span class="font-semibold text-white">$0.50/min</span> × 60 minutes = <span class="font-semibold text-white">$30/hour</span>
                    </p>
                  </div>
                  <p class="text-purple-100 text-xs italic">
                    Set your own rate and earn based on your availability
                  </p>
                </div>

                {/* Apply button */}
                <button
                  onClick={handleApplyClick}
                  class="w-full px-8 py-4 bg-white hover:bg-gray-100 text-purple-700 font-bold text-lg rounded-xl transition-all shadow-xl hover:shadow-2xl transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  Apply Now
                </button>
              </div>
            </Show>

            <Show when={showForm()}>
              {/* Form View */}
              <div class="animate-in fade-in slide-in-from-right-4 duration-300">
                <HostApplicationForm
                  userId={props.userId}
                  onSubmit={handleFormSubmit}
                  onCancel={handleFormCancel}
                />
              </div>
            </Show>
          </Show>
        </Show>
      </div>
    </div>
  );
}
