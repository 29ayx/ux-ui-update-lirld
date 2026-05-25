import { createSignal, Show } from "solid-js";
import { submitHostApplication } from "~/lib/host";

interface HostApplicationFormProps {
  userId: string;
  onSubmit: () => void;
  onCancel: () => void;
}

export default function HostApplicationForm(props: HostApplicationFormProps) {
  const [verificationId, setVerificationId] = createSignal("");
  const [pricePerMinute, setPricePerMinute] = createSignal("0.10");
  const [isSubmitting, setIsSubmitting] = createSignal(false);
  const [error, setError] = createSignal("");
  const [validationErrors, setValidationErrors] = createSignal<{
    verificationId?: string;
    pricePerMinute?: string;
  }>({});

  const validateForm = (): boolean => {
    const errors: { verificationId?: string; pricePerMinute?: string } = {};
    let isValid = true;

    // Validate verification ID
    const verificationIdValue = verificationId().trim();
    if (!verificationIdValue) {
      errors.verificationId = "Verification ID is required";
      isValid = false;
    } else if (verificationIdValue.length < 3) {
      errors.verificationId = "Verification ID must be at least 3 characters";
      isValid = false;
    }

    // Validate price per minute
    const price = parseFloat(pricePerMinute());
    if (isNaN(price)) {
      errors.pricePerMinute = "Please enter a valid price";
      isValid = false;
    } else if (price < 0.01) {
      errors.pricePerMinute = "Price must be at least $0.01";
      isValid = false;
    } else if (price > 10.0) {
      errors.pricePerMinute = "Price cannot exceed $10.00";
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const price = parseFloat(pricePerMinute());
      await submitHostApplication(props.userId, verificationId().trim(), price);
      props.onSubmit();
    } catch (err: any) {
      console.error("Error submitting host application:", err);
      setError(err.message || "Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePriceInput = (value: string) => {
    // Allow only numbers and decimal point
    const sanitized = value.replace(/[^0-9.]/g, "");
    
    // Prevent multiple decimal points
    const parts = sanitized.split(".");
    if (parts.length > 2) {
      return;
    }
    
    // Limit to 2 decimal places
    if (parts[1] && parts[1].length > 2) {
      return;
    }

    setPricePerMinute(sanitized);
    
    // Clear validation error when user types
    if (validationErrors().pricePerMinute) {
      setValidationErrors({ ...validationErrors(), pricePerMinute: undefined });
    }
  };

  return (
    <form onSubmit={handleSubmit} class="bg-[#111] rounded-2xl p-5 space-y-4">
      <h3 class="text-lg font-bold text-white">Application</h3>

      <Show when={error()}>
        <div class="bg-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm">
          {error()}
        </div>
      </Show>

      <div class="space-y-2">
        <label class="text-sm text-white font-medium">Verification ID</label>
        <input
          type="text"
          value={verificationId()}
          onInput={(e) => setVerificationId(e.currentTarget.value)}
          placeholder="Enter ID"
          class="w-full px-4 py-3 bg-black text-white rounded-xl"
        />
        <Show when={validationErrors().verificationId}>
          <p class="text-red-400 text-xs">{validationErrors().verificationId}</p>
        </Show>
      </div>

      <div class="space-y-2">
        <label class="text-sm text-white font-medium">Price Per Minute</label>
        <div class="relative">
          <span class="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">$</span>
          <input
            type="text"
            inputmode="decimal"
            value={pricePerMinute()}
            onInput={(e) => handlePriceInput(e.currentTarget.value)}
            placeholder="0.10"
            class="w-full pl-8 pr-4 py-3 bg-black text-white rounded-xl"
          />
        </div>
        <Show when={validationErrors().pricePerMinute}>
          <p class="text-red-400 text-xs">{validationErrors().pricePerMinute}</p>
        </Show>
        <p class="text-white/40 text-xs">Range: $0.01 - $10.00</p>
      </div>

      <div class="flex gap-3">
        <button
          type="button"
          onClick={props.onCancel}
          class="flex-1 px-4 py-3 bg-black text-white font-semibold rounded-xl"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting()}
          class="flex-1 px-4 py-3 bg-white text-black font-bold rounded-xl"
        >
          {isSubmitting() ? "Submitting..." : "Submit"}
        </button>
      </div>
    </form>
  );
}
