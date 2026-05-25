export default function HowItWorks() {
  const steps = [
    {
      icon: "1️",
      title: "Choose a Host",
      description: "Browse verified hosts",
      color: "pink",
    },
    {
      icon: "2️",
      title: "Start a Call",
      description: "Connect instantly via audio or video chat",
      color: "purple",
    },
    {
      icon: "3️",
      title: "Pay Per Minute",
      description: "Only pay for the time you chat",
      color: "blue",
    },
  ];

  return (
    <div class="bg-[#111] rounded-2xl p-6 border border-white/10">
      <h3 class="text-white font-bold text-lg mb-4">How Speed Dating Works</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        {steps.map((step) => (
          <div class="flex items-start gap-3">
            <div class={`w-8 h-8 bg-${step.color}-500/20 rounded-lg flex items-center justify-center flex-shrink-0`}>
              <span class="text-white color-white">{step.icon}</span>
            </div>
            <div>
              <h4 class="text-white font-semibold text-sm mb-1">{step.title}</h4>
              <p class="text-white/60 text-xs">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
