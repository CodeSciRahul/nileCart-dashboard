import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils.js";

const OTP_LENGTH = 6;

export default function OtpInput({
  value,
  onChange,
  disabled = false,
  autoFocus = false,
  className,
}) {
  const inputRefs = useRef([]);

  const digits = Array.from({ length: OTP_LENGTH }, (_, index) => value[index] || "");

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  const focusInput = (index) => {
    const input = inputRefs.current[index];
    if (input) input.focus();
  };

  const updateValue = (nextDigits) => {
    onChange(nextDigits.join("").slice(0, OTP_LENGTH));
  };

  const handleChange = (index, nextChar) => {
    const sanitized = nextChar.replace(/\D/g, "");
    if (!sanitized) return;

    const nextDigits = [...digits];
    nextDigits[index] = sanitized.slice(-1);
    updateValue(nextDigits);

    if (index < OTP_LENGTH - 1) {
      focusInput(index + 1);
    }
  };

  const handleKeyDown = (index, event) => {
    if (event.key === "Backspace") {
      event.preventDefault();
      const nextDigits = [...digits];

      if (digits[index]) {
        nextDigits[index] = "";
        updateValue(nextDigits);
        return;
      }

      if (index > 0) {
        nextDigits[index - 1] = "";
        updateValue(nextDigits);
        focusInput(index - 1);
      }
    }

    if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      focusInput(index - 1);
    }

    if (event.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      event.preventDefault();
      focusInput(index + 1);
    }
  };

  const handlePaste = (event) => {
    event.preventDefault();
    const pasted = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);

    if (!pasted) return;

    onChange(pasted);
    focusInput(Math.min(pasted.length, OTP_LENGTH - 1));
  };

  return (
    <div className={cn("flex justify-center gap-2 sm:gap-3", className)}>
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(element) => {
            inputRefs.current[index] = element;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={1}
          value={digit}
          disabled={disabled}
          onChange={(event) => handleChange(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={handlePaste}
          onFocus={(event) => event.target.select()}
          aria-label={`Digit ${index + 1} of ${OTP_LENGTH}`}
          className={cn(
            "h-12 w-10 rounded-xl border border-gray-300 bg-white text-center text-lg font-semibold text-black transition-all outline-none",
            "focus:border-black focus:ring-2 focus:ring-black/10",
            "disabled:cursor-not-allowed disabled:opacity-60",
            digit && "border-black"
          )}
        />
      ))}
    </div>
  );
}

