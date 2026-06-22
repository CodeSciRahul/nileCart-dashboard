import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";

export function OtpVerificationSection({
  otp,
  onOtpChange,
  otpBanner,
  onVerify,
  verifyingOtp,
  onResend,
  sendingOtp,
  isCoolingDown,
  secondsLeft,
}) {
  return (
    <div className="space-y-3 rounded-xl border border-brand-amber/20 bg-gradient-to-br from-brand-cream/60 to-brand-white p-4 ring-1 ring-brand-amber/10">
      <div className="flex items-center gap-2">
        <span className="flex size-8 items-center justify-center rounded-lg bg-brand-amber/15 text-brand-amber ring-1 ring-brand-amber/20">
          <ShieldCheck className="size-4" />
        </span>
        <p className="text-sm font-semibold">Verify your email</p>
      </div>
      {otpBanner && (
        <p className="text-sm leading-relaxed text-muted-foreground">{otpBanner}</p>
      )}
      <div className="flex gap-2">
        <Input
          placeholder="6-digit OTP"
          value={otp}
          onChange={(e) => onOtpChange(e.target.value.replace(/\D/g, "").slice(0, 6))}
          maxLength={6}
          inputMode="numeric"
        />
        <Button
          type="button"
          variant="outline"
          onClick={onVerify}
          disabled={verifyingOtp}
          className="border-brand-amber/20 hover:bg-brand-cream"
        >
          {verifyingOtp ? "..." : "Verify"}
        </Button>
      </div>
      <Button
        type="button"
        variant="secondary"
        className="w-full"
        onClick={onResend}
        disabled={sendingOtp || isCoolingDown}
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
