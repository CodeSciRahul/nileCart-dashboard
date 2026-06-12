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
import { showErrorToast } from "../lib/toast.js";
import { isValidEmail } from "../lib/emailValidation.js";
import { useResendCooldown } from "./useResendCooldown.js";
import { toast } from "sonner";

const OTP_SENT_MESSAGE = "An OTP has been sent to your email, please verify.";

export const mapAuthError = (err) => {
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

export function useAuthForm(mode) {
  const navigate = useNavigate();
  const location = useLocation();
  const { establishBackendSession } = useAuth();
  const redirectTo = location.state?.from;

  const isSignUp = mode === "signup";

  const [loginType, setLoginType] = useState("seller");
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

  const isSellerSignup = isSignUp && loginType === "seller";
  const showOtpStep = isSellerSignup && signupPhase === "otp";
  const showOtpFromSignin = !isSignUp && loginType === "seller" && pendingVerification;
  const showCredentialsForm =
    !showOtpStep && !showOtpFromSignin && !showForgotPassword;

  const resetVerificationState = () => {
    setOtp("");
    setSignupPhase("credentials");
    setPendingVerification(false);
    setOtpBanner("");
    setShowForgotPassword(false);
  };

  const handleLoginTypeChange = (type) => {
    setLoginType(type);
    resetVerificationState();
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

  return {
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
    isSellerSignup,
    showOtpStep,
    showOtpFromSignin,
    showCredentialsForm,
    handleRegister,
    handleSignIn,
    handleResendOtp,
    handleForgotPassword,
    handleVerifyOtp,
    handleGoogle,
  };
}
