import { Button, ButtonLink } from "../components/ui/button.jsx";
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

export default function SignUp() {
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
    showOtpStep,
    showCredentialsForm,
    handleSendOtp,
    handleResendOtp,
    handleVerifyOtp,
    handleGoogle,
  } = useAuthForm();

  const isSeller = loginType === "seller";

  const description = !isSeller
    ? "Seller accounts can be created here. Admin accounts are provisioned separately."
    : showOtpStep
      ? "Enter the OTP sent to your email to continue."
      : "Enter your email and we’ll send you a login code.";

  return (
    <AuthLayout>
      <Card className="border-brand-amber/20 shadow-md">
        <CardHeader className="space-y-4">
          <div className="space-y-1">
            <CardTitle className="text-xl font-bold">Create your account</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <RoleTabs value={loginType} onChange={handleLoginTypeChange} />
        </CardHeader>

        <CardContent className="space-y-4">
          {!isSeller && (
            <div className="rounded-xl border border-brand-amber/20 bg-brand-cream/40 p-4 text-center ring-1 ring-brand-amber/10">
              <p className="text-sm text-muted-foreground">
                Admin accounts cannot be created on this page.
              </p>
              <ButtonLink to="/login" variant="link" className="mt-1 h-auto p-0 text-sm">
                Sign in as admin instead
              </ButtonLink>
            </div>
          )}

          {isSeller && showOtpStep && (
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

          {isSeller && showCredentialsForm && (
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
                  {loading ? "Please wait..." : "Send OTP"}
                </Button>
              </form>

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

              <p className="text-xs leading-relaxed text-muted-foreground">
                OTP-only sign-in is enabled for the dashboard.
              </p>
            </>
          )}
        </CardContent>

        <CardFooter className="border-t border-brand-amber/10 pt-6">
          <AuthFooter variant="signup" />
        </CardFooter>
      </Card>
    </AuthLayout>
  );
}
