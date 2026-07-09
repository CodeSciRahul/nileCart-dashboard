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
import { AuthLayout } from "../components/auth/AuthLayout.jsx";
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
    otp,
    setOtp,
    otpBanner,
    loading,
    sendingOtp,
    verifyingOtp,
    secondsLeft,
    isCoolingDown,
    showCredentialsForm,
    showOtpStep,
    handleSendOtp,
    handleResendOtp,
    handleVerifyOtp,
    handleGoogle,
  } = useAuthForm();

  const description =
    loginType === "admin"
      ? "Sign in to the admin panel with an email verification code."
      : "Sign in to your seller account with an email verification code.";

  return (
    <AuthLayout>
      <Card className="border-brand-amber/20 shadow-md">
        <CardHeader className="space-y-4">
          <div className="space-y-1">
            <CardTitle className="text-xl font-bold">Welcome back</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <RoleTabs value={loginType} onChange={handleLoginTypeChange} />
        </CardHeader>

        <CardContent className="space-y-4">
          {showOtpStep && (
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

          {showCredentialsForm && (
            <>
              <form onSubmit={handleSendOtp} className="space-y-3">
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
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading
                    ? "Please wait..."
                    : loginType === "admin"
                      ? "Send OTP to sign in"
                      : "Send OTP to sign in"}
                </Button>
              </form>

              {loginType === "seller" && (
                <>
                  <div className="relative text-center text-xs text-muted-foreground">
                    <span className="relative z-10 bg-card px-2">or</span>
                    <div className="absolute inset-x-0 top-1/2 border-t border-brand-amber/15" />
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-brand-amber/20 hover:bg-brand-cream"
                    disabled={loading}
                    onClick={handleGoogle}
                  >
                    Continue with Google
                  </Button>
                </>
              )}

              {loginType === "seller" && (
                <p className="text-xs leading-relaxed text-muted-foreground">
                  You’ll receive a 6-digit verification code by email.
                </p>
              )}
            </>
          )}
        </CardContent>

        {showCredentialsForm && (
          <CardFooter className="border-t border-brand-amber/10 pt-6">
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
    </AuthLayout>
  );
}
