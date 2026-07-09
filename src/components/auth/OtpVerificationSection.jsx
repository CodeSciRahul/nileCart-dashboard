import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button.jsx";
import OtpInput from "@/components/auth/OtpInput.jsx";

export function OtpVerificationSection({
  otp,
  onOtpChange,
  otpBanner,
  onVerify,
  verifyingOtp,
  disabled = false,
  onResend,
  sendingOtp,
  isCoolingDown,
  secondsLeft,
}) {
  return (
    <div className="space-y-3 rounded-xl border border-brand-amber/20 bg-linear-to-br from-brand-cream/60 to-brand-white p-4 ring-1 ring-brand-amber/10">
      <div className="flex items-center gap-2">
        <span className="flex size-8 items-center justify-center rounded-lg bg-brand-amber/15 text-brand-amber ring-1 ring-brand-amber/20">
          <ShieldCheck className="size-4" />
        </span>
        <p className="text-sm font-semibold">Verify your email</p>
      </div>
      {otpBanner && (
        <p className="text-sm leading-relaxed text-muted-foreground">{otpBanner}</p>
      )}
      <OtpInput
        value={otp}
        onChange={onOtpChange}
        disabled={disabled || verifyingOtp || sendingOtp}
        autoFocus
      />
      <Button
        type="button"
        variant="outline"
        onClick={onVerify}
        disabled={disabled || verifyingOtp || otp.length !== 6}
        className="w-full border-brand-amber/20 hover:bg-brand-cream"
      >
        {verifyingOtp ? "Verifying..." : "Verify & Continue"}
      </Button>
      <Button
        type="button"
        variant="secondary"
        className="w-full"
        onClick={onResend}
        disabled={disabled || sendingOtp || isCoolingDown}
      >
        {sendingOtp
          ? "Sending..."
          : isCoolingDown
            ? `Resend OTP in ${secondsLeft}s`
            : "Resend OTP"}
      </Button>
    </div>
  );
}
