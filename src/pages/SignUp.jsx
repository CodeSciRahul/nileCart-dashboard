import { Link } from "react-router-dom";
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

export default function SignUp() {
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
    secondsLeft,
    isCoolingDown,
    showOtpStep,
    showCredentialsForm,
    handleRegister,
    handleResendOtp,
    handleVerifyOtp,
    handleGoogle,
  } = useAuthForm("signup");

  const isSeller = loginType === "seller";

  const description = !isSeller
    ? "Seller accounts can be created here. Admin accounts are provisioned separately."
    : showOtpStep
      ? "Enter the OTP sent to your email to activate your account."
      : "Create your seller account with email and password.";

  return (
    <main className="flex min-h-svh items-center justify-center bg-muted/30 p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4">
          <div className="space-y-1">
            <CardTitle>Create your account</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <RoleTabs value={loginType} onChange={handleLoginTypeChange} />
        </CardHeader>

        <CardContent className="space-y-4">
          {!isSeller && (
            <div className="rounded-lg border border-border bg-muted/30 p-4 text-center">
              <p className="text-sm text-muted-foreground">
                Admin accounts cannot be created on this page.
              </p>
              <Button asChild variant="link" className="mt-1 h-auto p-0 text-sm">
                <Link to="/login">Sign in as admin instead</Link>
              </Button>
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
              <form onSubmit={handleRegister} className="space-y-3">
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
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    autoComplete="new-password"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Please wait..." : "Create account"}
                </Button>
              </form>

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

              <p className="text-xs leading-relaxed text-muted-foreground">
                After registration, you must verify your email with an OTP before you can sign in.
              </p>
            </>
          )}
        </CardContent>

        <CardFooter className="border-t pt-6">
          <AuthFooter variant="signup" />
        </CardFooter>
      </Card>
    </main>
  );
}
