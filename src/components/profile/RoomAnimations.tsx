import { Show, For } from "solid-js";

interface RoomAnimationsProps {
  animation: string;
  theme: string;
}

export default function RoomAnimations(props: RoomAnimationsProps) {
  return (
    <>
      <Show when={props.theme === "night"}>
        <div class="fixed inset-0 opacity-10 pointer-events-none z-0" aria-hidden="true">
          <For each={Array(4)}>
            {(_, i) => (
              <div
                class="absolute w-1 h-1 bg-white rounded-full animate-pulse"
                style={`left: ${(i() * 25) % 100}%; top: ${(i() * 30) % 100}%; animation-delay: ${i() * 0.5}s;`}
              />
            )}
          </For>
        </div>
      </Show>

      <Show when={props.animation !== "none"}>
        <div class="fixed inset-0 pointer-events-none z-10" aria-hidden="true">
          <Show when={props.animation === "sparkles"}>
            <div class="sparkle-container">
              <For each={Array(20)}>
                {(_, i) => (
                  <div
                    class="sparkle"
                    style={`left: ${(i() * 7) % 100}%; top: ${(i() * 11) % 100}%; animation-delay: ${(i() * 0.2) % 3}s;`}
                  />
                )}
              </For>
            </div>
          </Show>
          <Show when={props.animation === "stars"}>
            <div class="stars-container">
              <For each={Array(25)}>
                {(_, i) => (
                  <div
                    class="star"
                    style={`left: ${(i() * 5) % 100}%; top: ${(i() * 7) % 100}%; animation-delay: ${(i() * 0.2) % 4}s;`}
                    aria-hidden="true"
                  >
                    ⭐
                  </div>
                )}
              </For>
            </div>
          </Show>
          <Show when={props.animation === "hearts"}>
            <div class="hearts-container">
              <For each={Array(15)}>
                {(_, i) => (
                  <div
                    class="heart"
                    style={`left: ${(i() * 8) % 100}%; top: ${(i() * 9) % 100}%; animation-delay: ${(i() * 0.25) % 3}s;`}
                    aria-hidden="true"
                  >
                    💖
                  </div>
                )}
              </For>
            </div>
          </Show>
          <Show when={props.animation === "particles"}>
            <div class="particles-container">
              <For each={Array(30)}>
                {(_, i) => (
                  <div
                    class="particle"
                    style={`left: ${(i() * 4) % 100}%; top: ${(i() * 6) % 100}%; animation-delay: ${(i() * 0.08) % 2}s;`}
                  />
                )}
              </For>
            </div>
          </Show>
          <Show when={props.animation === "rainbow"}>
            <div class="rainbow-container">
              <div class="rainbow-wave" aria-hidden="true" />
            </div>
          </Show>
        </div>
      </Show>
    </>
  );
}
