import { createSignal, createMemo, createEffect } from "solid-js";

export function useDisplayName(profileData: () => any, setLocalChanges: (changes: any) => void, localChanges: () => any) {
  const [displayNameInput, setDisplayNameInput] = createSignal("");
  const [displayNameError, setDisplayNameError] = createSignal<string | null>(null);
  const [displayNameTouched, setDisplayNameTouched] = createSignal(false);
  const [displayNameInitialized, setDisplayNameInitialized] = createSignal(false);

  const validateDisplayName = (name: string): { valid: boolean; error: string | null } => {
    const trimmed = name.trim();

    if (trimmed.length === 0) {
      return { valid: false, error: "Display name is required" };
    }

    if (trimmed.length > 50) {
      return { valid: false, error: "Display name must be 50 characters or less" };
    }

    return { valid: true, error: null };
  };

  const updateDisplayName = (value: string) => {
    setDisplayNameInput(value);
    setDisplayNameTouched(true);

    const validation = validateDisplayName(value);
    setDisplayNameError(validation.error);

    if (validation.valid) {
      setLocalChanges({
        ...localChanges(),
        displayName: value.trim()
      });
    }
  };

  const isDisplayNameValid = createMemo(() => {
    const validation = validateDisplayName(displayNameInput());
    return validation.valid;
  });

  createEffect(() => {
    const current = profileData();
    if (current && !displayNameInitialized()) {
      setDisplayNameInput(current.name || "");
      setDisplayNameInitialized(true);
    }
  });

  return {
    displayNameInput,
    setDisplayNameInput,
    displayNameError,
    displayNameTouched,
    updateDisplayName,
    isDisplayNameValid
  };
}
