import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { getDefaultRouteForUser } from "../lib/redirect.js";
import { setStoredLoginType } from "../lib/authStorage.js";
import {
  sendDashboardOtp,
  verifyDashboardOtp,
  loginSeller,
  loginAdmin,
  lookupAuthMethods,
  sendForgotPasswordOtp,
  verifyForgotPasswordOtp,
  resetPassword,
} from "../services/authService.js";
import { showErrorToast } from "../lib/toast.js";
import { isValidEmail } from "../lib/emailValidation.js";
import { useResendCooldown } from "./useResendCooldown.js";
import { toast } from "sonner";

const OTP_SENT_MESSAGE = "A verification code has been sent to your email.";

export const mapAuthError = (err) => {
  return err?.message || "Something went wrong.";
};

export function useAuthForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { establishBackendSession } = useAuth();
  const redirectTo = location.state?.from;

  const [loginType, setLoginType] = useState("seller");
  const [authMethod, setAuthMethod] = useState("detect"); // "detect" | "password" | "otp" | "forgot_password"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpBanner, setOtpBanner] = useState("");
  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [accountHasPassword, setAccountHasPassword] = useState(null);

  // Forgot password sub-state
  const [forgotStep, setForgotStep] = useState("email"); // "email" | "otp" | "reset"
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { secondsLeft, isCoolingDown, startCooldown } = useResendCooldown();

  const isPasswordMode = authMethod === "password";
  const isOtpMode = authMethod === "otp";
  const isForgotMode = authMethod === "forgot_password";
  const isDetectMode = authMethod === "detect";

  const resetAll = () => {
    setAuthMethod("detect");
    setPassword("");
    setOtp("");
    setOtpBanner("");
    setAccountHasPassword(null);
    setForgotStep("email");
    setResetToken("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleLoginTypeChange = (type) => {
    setLoginType(type);
    resetAll();
  };

  const handleChangeEmail = () => {
    resetAll();
  };

  const navigatePostAuth = (user) => {
    setStoredLoginType(loginType);
    if (loginType === "admin") {
      navigate(redirectTo || "/admin", { replace: true });
      return;
    }
    if (user.role === "seller" && !user.seller) {
      navigate("/seller/onboarding", { replace: true });
      return;
    }
    navigate(redirectTo || getDefaultRouteForUser(user), { replace: true });
  };

  // Step 1: Detect auth method for entered email
  const handleDetectOrContinue = async (e) => {
    e?.preventDefault();
    const cleanEmail = email.trim();
    if (!isValidEmail(cleanEmail)) {
      showErrorToast(null, "Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const data = await lookupAuthMethods({ email: cleanEmail, loginType });
      setAccountHasPassword(Boolean(data.hasPassword));

      if (data.hasPassword) {
        // Account has a password configured -> show password mode by default
        setAuthMethod("password");
      } else {
        // Account has NO password -> send OTP automatically and show OTP mode
        setSendingOtp(true);
        const otpData = await sendDashboardOtp({ email: cleanEmail, loginType });
        setOtpBanner(otpData.message || OTP_SENT_MESSAGE);
        startCooldown();
        setAuthMethod("otp");
        toast.info(otpData.message || OTP_SENT_MESSAGE);
      }
    } catch (err) {
      showErrorToast(err);
    } finally {
      setLoading(false);
      setSendingOtp(false);
    }
  };

  // Switch to OTP login explicitly
  const handleSelectOtpMode = async () => {
    const cleanEmail = email.trim();
    if (!isValidEmail(cleanEmail)) {
      setAuthMethod("otp");
      return;
    }

    setLoading(true);
    setSendingOtp(true);
    try {
      const data = await sendDashboardOtp({ email: cleanEmail, loginType });
      setOtpBanner(data.message || OTP_SENT_MESSAGE);
      startCooldown();
      setAuthMethod("otp");
      toast.success(data.message || OTP_SENT_MESSAGE);
    } catch (err) {
      showErrorToast(err);
    } finally {
      setLoading(false);
      setSendingOtp(false);
    }
  };

  // Switch to Password login explicitly
  const handleSelectPasswordMode = () => {
    setAuthMethod("password");
  };

  // Submit Password login
  const handlePasswordSubmit = async (e) => {
    e?.preventDefault();
    const cleanEmail = email.trim();

    if (!isValidEmail(cleanEmail)) {
      showErrorToast(null, "Please enter a valid email address.");
      return;
    }

    if (!password) {
      showErrorToast(null, "Please enter your password.");
      return;
    }

    setLoading(true);
    try {
      const user = await establishBackendSession(
        () =>
          loginType === "admin"
            ? loginAdmin({ email: cleanEmail, password })
            : loginSeller({ email: cleanEmail, password }),
        loginType
      );
      toast.success("Signed in successfully.");
      navigatePostAuth(user);
    } catch (err) {
      showErrorToast(err);
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP login
  const handleVerifyOtp = async () => {
    const cleanEmail = email.trim();
    const cleanOtp = otp.trim();

    if (!cleanOtp) {
      showErrorToast(null, "Enter the 6-digit verification code.");
      return;
    }

    setVerifyingOtp(true);
    try {
      const user = await establishBackendSession(
        (type) =>
          verifyDashboardOtp({ email: cleanEmail, otp: cleanOtp, loginType: type }),
        loginType
      );
      toast.success("Verification successful.");
      navigatePostAuth(user);
    } catch (err) {
      showErrorToast(err);
    } finally {
      setVerifyingOtp(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (isCoolingDown) return;

    const cleanEmail = email.trim();
    if (!isValidEmail(cleanEmail)) {
      showErrorToast(null, "Please enter a valid email address.");
      return;
    }

    setSendingOtp(true);
    try {
      if (isForgotMode) {
        const data = await sendForgotPasswordOtp({ email: cleanEmail, loginType });
        setOtpBanner(data.message || OTP_SENT_MESSAGE);
        startCooldown();
        toast.success(data.message || OTP_SENT_MESSAGE);
      } else {
        const data = await sendDashboardOtp({ email: cleanEmail, loginType });
        setOtpBanner(data.message || OTP_SENT_MESSAGE);
        startCooldown();
        toast.success(data.message || OTP_SENT_MESSAGE);
      }
    } catch (err) {
      showErrorToast(err);
    } finally {
      setSendingOtp(false);
    }
  };

  // Forgot password flow
  const handleStartForgotPassword = async () => {
    setAuthMethod("forgot_password");
    setForgotStep("email");
    setOtp("");
    setResetToken("");
    setNewPassword("");
    setConfirmPassword("");

    if (isValidEmail(email.trim())) {
      setLoading(true);
      try {
        const data = await sendForgotPasswordOtp({ email: email.trim(), loginType });
        setOtpBanner(data.message || OTP_SENT_MESSAGE);
        startCooldown();
        setForgotStep("otp");
        toast.success(data.message || OTP_SENT_MESSAGE);
      } catch (err) {
        showErrorToast(err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSendForgotPasswordOtp = async (e) => {
    e?.preventDefault();
    const cleanEmail = email.trim();
    if (!isValidEmail(cleanEmail)) {
      showErrorToast(null, "Please enter a valid email address.");
      return;
    }

    setLoading(true);
    setSendingOtp(true);
    try {
      const data = await sendForgotPasswordOtp({ email: cleanEmail, loginType });
      setOtpBanner(data.message || OTP_SENT_MESSAGE);
      startCooldown();
      setForgotStep("otp");
      toast.success(data.message || OTP_SENT_MESSAGE);
    } catch (err) {
      showErrorToast(err);
    } finally {
      setLoading(false);
      setSendingOtp(false);
    }
  };

  const handleVerifyForgotPasswordOtp = async (e) => {
    e?.preventDefault();
    const cleanEmail = email.trim();
    const cleanOtp = otp.trim();

    if (!cleanOtp) {
      showErrorToast(null, "Please enter the 6-digit verification code.");
      return;
    }

    setVerifyingOtp(true);
    try {
      const data = await verifyForgotPasswordOtp({ email: cleanEmail, otp: cleanOtp });
      setResetToken(data.resetToken);
      setForgotStep("reset");
      toast.success("Code verified. Please set your new password.");
    } catch (err) {
      showErrorToast(err);
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e?.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      showErrorToast(null, "Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      showErrorToast(null, "Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await resetPassword({
        resetToken,
        email: email.trim(),
        newPassword,
        confirmPassword,
      });
      toast.success("Password reset successfully. You can now sign in.");
      setPassword(newPassword);
      setAuthMethod("password");
      setForgotStep("email");
    } catch (err) {
      showErrorToast(err);
    } finally {
      setLoading(false);
    }
  };

  return {
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
    accountHasPassword,
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
  };
}
