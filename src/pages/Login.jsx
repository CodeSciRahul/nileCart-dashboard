import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
} from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase.js";
import { useAuth } from "../context/AuthContext.jsx";
import { getDefaultRouteForUser } from "../lib/redirect.js";
import { setStoredLoginType } from "../lib/authStorage.js";
import {
  registerSellerAccount,
  sendSellerSignupOtp,
  verifySellerSignupOtp,
} from "../services/authService.js";
import { Button } from "../components/ui/button.jsx";
import { Input } from "../components/ui/input.jsx";
import { Label } from "../components/ui/label.jsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card.jsx";
import { showErrorToast } from "../lib/toast.js";
import { isValidEmail } from "../lib/emailValidation.js";
import { useResendCooldown } from "../hooks/useResendCooldown.js";
import { toast } from "sonner";

const OTP_SENT_MESSAGE = "An OTP has been sent to your email, please verify.";

const mapAuthError = (err) => {
  const code = err?.code || "";
  const messages = {
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/user-not-found": "No account found with this email.",
    "auth/wrong-password": "Incorrect password. Try again.",
    "auth/invalid-credential": "Invalid email or password.",
    "auth/email-already-in-use": "An account already exists with this email.",
    "auth/weak-password": "Password should be at least 6 characters.",
    "auth/popup-closed-by-user": "Sign-in popup was closed.",
    "auth/too-many-requests": "Too many requests. Please try again later.",
  };
  return messages[code] || err?.message || "Something went wrong.";
};

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { establishBackendSession } = useAuth();
  const redirectTo = location.state?.from;

  const [loginType, setLoginType] = useState("seller");
  const [tab, setTab] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [signupPhase, setSignupPhase] = useState("credentials");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [otpBanner, setOtpBanner] = useState("");
  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [sendingResetEmail, setSendingResetEmail] = useState(false);
  const { secondsLeft, isCoolingDown, startCooldown } = useResendCooldown();

  const isSellerSignup = loginType === "seller" && tab === "signup";
  const showOtpStep = isSellerSignup && signupPhase === "otp";
  const showOtpFromSignin = loginType === "seller" && tab === "signin" && pendingVerification;
  const showSignInForm = !showOtpStep && !showOtpFromSignin && !showForgotPassword;

  const resetVerificationState = () => {
    setOtp("");
    setSignupPhase("credentials");
    setPendingVerification(false);
    setOtpBanner("");
    setShowForgotPassword(false);
  };

  const finishAuth = async (firebaseUser) => {
    const token = await firebaseUser.getIdToken();
    setStoredLoginType(loginType);

    try {
      const user = await establishBackendSession(token, loginType);

      if (loginType === "admin") {
        navigate(redirectTo || "/admin", { replace: true });
        return;
      }

      if (user.role === "seller" && !user.seller) {
        navigate("/seller/onboarding", { replace: true });
        return;
      }

      navigate(redirectTo || getDefaultRouteForUser(user), { replace: true });
    } catch (err) {
      if (!(err.status === 403 && loginType === "seller")) {
        await signOut(auth);
      }
      throw err;
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!isValidEmail(email)) {
        showErrorToast(null, "Please enter a valid email address.");
        return;
      }

      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const firebaseToken = await cred.user.getIdToken();
      const data = await registerSellerAccount(firebaseToken);

      if (data.requiresVerification) {
        setSignupPhase("otp");
        setOtpBanner(data.message || OTP_SENT_MESSAGE);
        startCooldown();
        toast.success(data.message || OTP_SENT_MESSAGE);
        return;
      }

      await finishAuth(cred.user);
    } catch (err) {
      showErrorToast(err, mapAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!isValidEmail(email)) {
        showErrorToast(null, "Please enter a valid email address.");
        return;
      }

      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      await finishAuth(cred.user);
    } catch (err) {
      if (err.status === 403 && loginType === "seller") {
        setPendingVerification(true);
        setOtpBanner(err.message || OTP_SENT_MESSAGE);
        startCooldown();
        return;
      }
      showErrorToast(err, mapAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (isCoolingDown) {
      return;
    }

    if (!isValidEmail(email)) {
      showErrorToast(null, "Please enter a valid email address.");
      return;
    }

    setSendingOtp(true);
    try {
      const data = await sendSellerSignupOtp(email.trim());
      setOtpBanner(data.message || OTP_SENT_MESSAGE);
      startCooldown();
      toast.success(data.message || OTP_SENT_MESSAGE);
    } catch (err) {
      showErrorToast(err);
    } finally {
      setSendingOtp(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();

    if (!isValidEmail(email)) {
      showErrorToast(null, "Please enter a valid email address.");
      return;
    }

    setSendingResetEmail(true);
    try {
      await sendPasswordResetEmail(auth, email.trim(), {
        url: `${window.location.origin}/login`,
        handleCodeInApp: false,
      });
      toast.success("Password reset link sent. Check your email inbox.");
      setShowForgotPassword(false);
    } catch (err) {
      showErrorToast(err, mapAuthError(err));
    } finally {
      setSendingResetEmail(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      showErrorToast(null, "Enter the 6-digit verification code.");
      return;
    }

    setVerifyingOtp(true);
    try {
      await verifySellerSignupOtp(email.trim(), otp.trim());
      toast.success("Email verified successfully. Signing you in...");

      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      resetVerificationState();
      await finishAuth(cred.user);
    } catch (err) {
      showErrorToast(err);
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      const cred = await signInWithPopup(auth, googleProvider);

      if (isSellerSignup) {
        const firebaseToken = await cred.user.getIdToken();
        const data = await registerSellerAccount(firebaseToken);

        if (data.requiresVerification) {
          setSignupPhase("otp");
          setOtpBanner(data.message || OTP_SENT_MESSAGE);
          startCooldown();
          return;
        }
      }

      await finishAuth(cred.user);
    } catch (err) {
      showErrorToast(err, mapAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const renderOtpSection = () => (
    <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-4">
      <p className="font-medium text-sm">Verify your email</p>
      {otpBanner && (
        <p className="text-muted-foreground text-sm leading-relaxed">{otpBanner}</p>
      )}
      <div className="flex gap-2">
        <Input
          placeholder="6-digit OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
          maxLength={6}
          inputMode="numeric"
        />
        <Button
          type="button"
          variant="outline"
          onClick={handleVerifyOtp}
          disabled={verifyingOtp}
        >
          {verifyingOtp ? "..." : "Verify"}
        </Button>
      </div>
      <Button
        type="button"
        variant="secondary"
        className="w-full"
        onClick={handleResendOtp}
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

  return (
    <main className="flex min-h-svh items-center justify-center bg-muted/30 p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>LightCollection Dashboard</CardTitle>
          <CardDescription>
            {showForgotPassword
              ? "Enter your account email and we will send you a password reset link."
              : loginType === "admin"
                ? "Sign in to the admin panel."
                : showOtpStep || showOtpFromSignin
                  ? "Enter the OTP sent to your email to activate your account."
                  : isSellerSignup
                    ? "Create your seller account with email and password."
                    : "Sign in with your seller credentials."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 rounded-lg bg-muted p-1">
            <Button
              type="button"
              variant={loginType === "seller" ? "default" : "ghost"}
              className="flex-1"
              onClick={() => {
                setLoginType("seller");
                resetVerificationState();
              }}
            >
              Seller
            </Button>
            <Button
              type="button"
              variant={loginType === "admin" ? "default" : "ghost"}
              className="flex-1"
              onClick={() => {
                setLoginType("admin");
                setTab("signin");
                resetVerificationState();
              }}
            >
              Admin
            </Button>
          </div>

          {loginType === "seller" && showSignInForm && (
            <div className="flex gap-2 rounded-lg bg-muted p-1">
              <Button
                type="button"
                variant={tab === "signin" ? "default" : "ghost"}
                className="flex-1"
                onClick={() => {
                  setTab("signin");
                  resetVerificationState();
                }}
              >
                Sign in
              </Button>
              <Button
                type="button"
                variant={tab === "signup" ? "default" : "ghost"}
                className="flex-1"
                onClick={() => {
                  setTab("signup");
                  resetVerificationState();
                }}
              >
                Sign up
              </Button>
            </div>
          )}

          {(showOtpStep || showOtpFromSignin) && renderOtpSection()}

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

          {showSignInForm && (
            <form
              onSubmit={isSellerSignup ? handleRegister : handleSignIn}
              className="space-y-3"
            >
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
                  {!isSellerSignup && (
                    <button
                      type="button"
                      className="text-primary text-xs hover:underline"
                      onClick={() => setShowForgotPassword(true)}
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete={isSellerSignup ? "new-password" : "current-password"}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading
                  ? "Please wait..."
                  : loginType === "admin"
                    ? "Sign in as admin"
                    : isSellerSignup
                      ? "Create account"
                      : "Sign in"}
              </Button>
            </form>
          )}

          {showSignInForm && (
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

          {loginType === "seller" && showSignInForm && (
            <p className="text-muted-foreground text-xs leading-relaxed">
              {isSellerSignup
                ? "After registration, you must verify your email with an OTP before you can sign in."
                : "Unverified accounts cannot sign in until email verification is complete."}
            </p>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
