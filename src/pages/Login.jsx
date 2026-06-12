import { Button } from "../components/ui/button.jsx";
import { Input } from "../components/ui/input.jsx";
import { Label } from "../components/ui/label.jsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card.jsx";
import { RoleTabs } from "../components/auth/RoleTabs.jsx";
import { OtpVerificationSection } from "../components/auth/OtpVerificationSection.jsx";
import { AuthFooter } from "../components/auth/AuthFooter.jsx";
import { useAuthForm } from "../hooks/useAuthForm.js";

export default function Login() {
  const {
    loginType,
    handleLoginTypeChange,
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
    showForgotPassword,
    setShowForgotPassword,
    sendingResetEmail,
    secondsLeft,
    isCoolingDown,
    showOtpFromSignin,
    showCredentialsForm,
    handleSignIn,
    handleResendOtp,
    handleForgotPassword,
    handleVerifyOtp,
    handleGoogle,
  } = useAuthForm("signin");

  const description = showForgotPassword
    ? "Enter your account email and we will send you a password reset link."
    : loginType === "admin"
      ? "Sign in to the admin panel."
      : showOtpFromSignin
        ? "Enter the OTP sent to your email to activate your account."
        : "Sign in with your seller credentials.";

  return (
    <main className="flex min-h-svh items-center justify-center bg-muted/30 p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4">
          <div className="space-y-1">
            <CardTitle>LightCollection Dashboard</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <RoleTabs value={loginType} onChange={handleLoginTypeChange} />
        </CardHeader>

        <CardContent className="space-y-4">
          {showOtpFromSignin && (
            <OtpVerificationSection
              otp={otp}
              onOtpChange={setOtp}
              otpBanner={otpBanner}
              onVerify={handleVerifyOtp}
              verifyingOtp={verifyingOtp}
              onResend={handleResendOtp}
              sendingOtp={sendingOtp}
              isCoolingDown={isCoolingDown}
              secondsLeft={secondsLeft}
            />
          )}

          {showForgotPassword && (
            <form onSubmit={handleForgotPassword} className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="reset-email">Email</Label>
                <Input
                  id="reset-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={sendingResetEmail}>
                {sendingResetEmail ? "Sending..." : "Send reset link"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setShowForgotPassword(false)}
              >
                Back to sign in
              </Button>
            </form>
          )}

          {showCredentialsForm && (
            <>
              <form onSubmit={handleSignIn} className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <button
                      type="button"
                      className="text-xs text-primary hover:underline"
                      onClick={() => setShowForgotPassword(true)}
                    >
                      Forgot password?
                    </button>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    autoComplete="current-password"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading
                    ? "Please wait..."
                    : loginType === "admin"
                      ? "Sign in as admin"
                      : "Sign in"}
                </Button>
              </form>

              {loginType === "seller" && (
                <>
                  <div className="relative text-center text-xs text-muted-foreground">
                    <span className="bg-card px-2">or</span>
                    <div className="absolute inset-x-0 top-1/2 -z-10 border-t border-border" />
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    disabled={loading}
                    onClick={handleGoogle}
                  >
                    Continue with Google
                  </Button>
                </>
              )}

              {loginType === "seller" && (
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Unverified accounts cannot sign in until email verification is complete.
                </p>
              )}
            </>
          )}
        </CardContent>

        {!showForgotPassword && (
          <CardFooter className="border-t pt-6">
            {loginType === "seller" ? (
              <AuthFooter variant="login" />
            ) : (
              <p className="w-full text-center text-sm text-muted-foreground">
                Admin access is by invitation only.
              </p>
            )}
          </CardFooter>
        )}
      </Card>
    </main>
  );
}
