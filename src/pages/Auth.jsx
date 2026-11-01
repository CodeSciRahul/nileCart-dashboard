import { useMemo, useState } from "react";
import { ArrowLeft, KeyRound, Loader2, Lock, Mail, ShieldCheck } from "lucide-react";
import { Button } from "../components/ui/button.jsx";
import { Input } from "../components/ui/input.jsx";
import { PasswordInput } from "../components/ui/password-input.jsx";
import { Label } from "../components/ui/label.jsx";
import { AuthLayout } from "../components/auth/AuthLayout.jsx";
import { RoleTabs } from "../components/auth/RoleTabs.jsx";
import { OtpVerificationSection } from "../components/auth/OtpVerificationSection.jsx";
import { useAuthForm } from "../hooks/useAuthForm.js";

export default function Auth() {
  const {
    loginType,
    authMethod,
    isPasswordMode,
    isOtpMode,
    isForgotMode,
    isDetectMode,
    handleLoginTypeChange,
    handleChangeEmail,
    email,
    setEmail,
    password,
    setPassword,
    otp,
    setOtp,
    otpBanner,
    loading,
    sendingOtp,
    verifyingOtp,
    secondsLeft,
    isCoolingDown,
    forgotStep,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    handleDetectOrContinue,
    handleSelectOtpMode,
    handleSelectPasswordMode,
    handlePasswordSubmit,
    handleVerifyOtp,
    handleResendOtp,
    handleStartForgotPassword,
    handleSendForgotPasswordOtp,
    handleVerifyForgotPasswordOtp,
    handleResetPasswordSubmit,
  } = useAuthForm();

  const [inlineError, setInlineError] = useState("");

  const title = useMemo(() => {
    if (isForgotMode) return "Reset your password";
    return loginType === "admin" ? "Sign in to Admin" : "Sign in to Seller Dashboard";
  }, [loginType, isForgotMode]);

  const subtitle = useMemo(() => {
    if (isForgotMode) {
      if (forgotStep === "otp") return `We sent a reset code to ${email}.`;
      if (forgotStep === "reset") return "Enter your new password below.";
      return "We'll send you a verification code to reset your password.";
    }
    if (isOtpMode) return `We sent a 6-digit code to ${email || "your email"}.`;
    if (isPasswordMode) return "Enter your password to continue.";
    return "Enter your email to sign in.";
  }, [isForgotMode, forgotStep, isOtpMode, isPasswordMode, email]);

  const switchToAdmin = () => {
    setInlineError("");
    handleLoginTypeChange("admin");
  };

  const switchToSeller = () => {
    setInlineError("");
    handleLoginTypeChange("seller");
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md">
        <div className="mb-6 text-center space-y-2">
          {!isForgotMode && (
            <div className="flex justify-center mb-3">
              <RoleTabs value={loginType} onChange={handleLoginTypeChange} />
            </div>
          )}
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>

        <div className="rounded-2xl border border-brand-amber/20 bg-white p-6 shadow-md">
          {/* Back button for sub-steps */}
          {(isOtpMode || isPasswordMode || isForgotMode) && (
            <button
              type="button"
              disabled={loading || verifyingOtp || sendingOtp}
              onClick={() => {
                setInlineError("");
                handleChangeEmail();
              }}
              className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground disabled:opacity-50"
            >
              <ArrowLeft className="size-4" />
              {isForgotMode ? "Back to sign in" : "Change email"}
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

          {/* MODE 1: Initial Email / Detection */}
          {isDetectMode && (
            <form
              onSubmit={(e) => {
                setInlineError("");
                return handleDetectOrContinue(e);
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

              <Button type="submit" className="w-full" disabled={loading || sendingOtp}>
                {loading || sendingOtp ? (
                  <span className="inline-flex items-center justify-center gap-2">
                    <Loader2 className="size-4 animate-spin" />
                    Checking account...
                  </span>
                ) : (
                  "Continue"
                )}
              </Button>

              <div className="relative text-center text-xs text-muted-foreground my-2">
                <span className="relative z-10 bg-white px-2">or choose sign-in method</span>
                <div className="absolute inset-x-0 top-1/2 border-t border-brand-amber/15" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={loading || sendingOtp}
                  onClick={handleSelectPasswordMode}
                  className="w-full text-xs gap-1.5"
                >
                  <Lock className="size-3.5" />
                  Password
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={loading || sendingOtp}
                  onClick={handleSelectOtpMode}
                  className="w-full text-xs gap-1.5"
                >
                  <KeyRound className="size-3.5" />
                  One-Time Code
                </Button>
              </div>

              <div className="pt-2 text-center text-xs text-muted-foreground">
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

          {/* MODE 2: Password Login */}
          {isPasswordMode && (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="email-locked">Email</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email-locked"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <button
                    type="button"
                    onClick={handleStartForgotPassword}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <PasswordInput
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <span className="inline-flex items-center justify-center gap-2">
                    <Loader2 className="size-4 animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  "Sign In"
                )}
              </Button>

              <div className="relative text-center text-xs text-muted-foreground my-2">
                <span className="relative z-10 bg-white px-2">or</span>
                <div className="absolute inset-x-0 top-1/2 border-t border-brand-amber/15" />
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full text-xs"
                disabled={loading || sendingOtp}
                onClick={handleSelectOtpMode}
              >
                {sendingOtp ? (
                  <span className="inline-flex items-center justify-center gap-2">
                    <Loader2 className="size-3.5 animate-spin" />
                    Sending code...
                  </span>
                ) : (
                  "Sign in with OTP instead"
                )}
              </Button>
            </form>
          )}

          {/* MODE 3: OTP Login */}
          {isOtpMode && (
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

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={handleSelectPasswordMode}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Sign in with password instead
                </button>
              </div>
            </div>
          )}

          {/* MODE 4: Forgot Password Flow */}
          {isForgotMode && (
            <div className="space-y-4">
              {forgotStep === "email" && (
                <form onSubmit={handleSendForgotPasswordOtp} className="space-y-4">
                  <div className="space-y-1">
                    <Label htmlFor="forgot-email">Account Email</Label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="forgot-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                        required
                        className="pl-10"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={loading || sendingOtp}>
                    {loading || sendingOtp ? (
                      <span className="inline-flex items-center justify-center gap-2">
                        <Loader2 className="size-4 animate-spin" />
                        Sending verification code...
                      </span>
                    ) : (
                      "Send Reset Code"
                    )}
                  </Button>
                </form>
              )}

              {forgotStep === "otp" && (
                <div className="space-y-4">
                  <OtpVerificationSection
                    otp={otp}
                    onOtpChange={(value) => {
                      setInlineError("");
                      setOtp(value);
                    }}
                    otpBanner={otpBanner}
                    onVerify={handleVerifyForgotPasswordOtp}
                    verifyingOtp={verifyingOtp}
                    onResend={handleResendOtp}
                    sendingOtp={sendingOtp}
                    isCoolingDown={isCoolingDown}
                    secondsLeft={secondsLeft}
                  />
                </div>
              )}

              {forgotStep === "reset" && (
                <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <Label htmlFor="new-password">New Password</Label>
                    <PasswordInput
                      id="new-password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <PasswordInput
                      id="confirm-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter your password"
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <span className="inline-flex items-center justify-center gap-2">
                        <Loader2 className="size-4 animate-spin" />
                        Resetting password...
                      </span>
                    ) : (
                      "Save New Password"
                    )}
                  </Button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </AuthLayout>
  );
}
