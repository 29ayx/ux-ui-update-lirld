import { Show } from "solid-js";

interface DisplayNameSectionProps {
  displayNameInput: string;
  displayNameError: string | null;
  displayNameTouched: boolean;
  onInput: (value: string) => void;
}

export default function DisplayNameSection(props: DisplayNameSectionProps) {
  return (
    <>
      <input
        type="text"
        value={props.displayNameInput}
        onInput={(e) => props.onInput(e.currentTarget.value)}
        placeholder="Enter your name"
        maxLength={20}
        class={`w-full px-4 py-3 bg-[#000000] border rounded-lg text-white placeholder:text-white/30 
                  focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all
                  ${props.displayNameError && props.displayNameTouched ? "border-red-500/50" : "border-white/10"}`}
      />
      <Show when={props.displayNameError && props.displayNameTouched}>
        <p class="mt-2 text-sm text-red-400">{props.displayNameError}</p>
      </Show>
      <p class="mt-2 text-xs text-gray-900 dark:text-white">
        {props.displayNameInput.length}/20 characters
      </p>
    </>
  );
}
