import { useMemo, useState } from "react";
import { ArrowLeft, Loader2, Mail } from "lucide-react";
import { Button } from "../components/ui/button.jsx";
import { Input } from "../components/ui/input.jsx";
import { Label } from "../components/ui/label.jsx";
import { AuthLayout } from "../components/auth/AuthLayout.jsx";
import { OtpVerificationSection } from "../components/auth/OtpVerificationSection.jsx";
import { useAuthForm } from "../hooks/useAuthForm.js";

export default function Auth() {
  const {
    loginType,
    handleLoginTypeChange,
    handleChangeEmail,
    email,
    setEmail,
    otp,
    setOtp,
    otpBanner,
    loading,
    sendingOtp,
    verifyingOtp,
    secondsLeft,
    isCoolingDown,
    showOtpStep,
    showCredentialsForm,
    handleSendOtp,
    handleResendOtp,
    handleVerifyOtp,
  } = useAuthForm();

  const [inlineError, setInlineError] = useState("");

  const title = useMemo(
    () => (loginType === "admin" ? "Sign in to Admin" : "Sign in to Seller Dashboard"),
    [loginType]
  );

  const subtitle = useMemo(() => {
    if (showOtpStep) return `We sent a 6-digit code to ${email || "your email"}.`;
    return "Enter your email to continue.";
  }, [showOtpStep, email]);

  const switchToAdmin = () => handleLoginTypeChange("admin");
  const switchToSeller = () => handleLoginTypeChange("seller");

  return (
    <AuthLayout>
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
        </div>

        <div className="rounded-2xl border border-brand-amber/20 bg-white p-6 shadow-md">
          {showOtpStep && (
            <button
              type="button"
              disabled={loading || verifyingOtp || sendingOtp}
              onClick={() => {
                setInlineError("");
                setOtp("");
                handleChangeEmail();
              }}
              className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground disabled:opacity-50"
            >
              <ArrowLeft className="size-4" />
              Change email
            </button>
          )}

          {inlineError && (
            <div
              role="alert"
              className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {inlineError}
            </div>
          )}

          {showCredentialsForm && (
            <form
              onSubmit={(e) => {
                setInlineError("");
                return handleSendOtp(e);
              }}
              className="space-y-4"
            >
              <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setInlineError("");
                      setEmail(e.target.value);
                    }}
                    autoComplete="email"
                    required
                    className="pl-10"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <span className="inline-flex items-center justify-center gap-2">
                    <Loader2 className="size-4 animate-spin" />
                    Sending code...
                  </span>
                ) : (
                  "Continue"
                )}
              </Button>

              <div className="text-center text-xs text-muted-foreground">
                {loginType === "admin" ? (
                  <button
                    type="button"
                    onClick={switchToSeller}
                    className="font-medium text-primary hover:underline"
                  >
                    Seller login instead
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={switchToAdmin}
                    className="font-medium text-primary hover:underline"
                  >
                    Admin login
                  </button>
                )}
              </div>
            </form>
          )}

          {showOtpStep && (
            <div className="space-y-4">
              <OtpVerificationSection
                otp={otp}
                onOtpChange={(value) => {
                  setInlineError("");
                  setOtp(value);
                }}
                otpBanner={otpBanner}
                onVerify={handleVerifyOtp}
                verifyingOtp={verifyingOtp}
                onResend={handleResendOtp}
                sendingOtp={sendingOtp}
                isCoolingDown={isCoolingDown}
                secondsLeft={secondsLeft}
              />
            </div>
          )}
        </div>
      </div>
    </AuthLayout>
  );
}

