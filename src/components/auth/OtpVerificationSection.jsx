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
    <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-4">
      <p className="text-sm font-medium">Verify your email</p>
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
