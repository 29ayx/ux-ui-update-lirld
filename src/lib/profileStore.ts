import { createSignal } from "solid-js";

const [selectedProfileId, setSelectedProfileId] = createSignal<string | null>(null);

export function openProfile(userId: string) {
  setSelectedProfileId(userId);
}

export function closeProfile() {
  setSelectedProfileId(null);
}

export { selectedProfileId };
