import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { getDefaultRouteForUser } from "../lib/redirect.js";
import { setStoredLoginType } from "../lib/authStorage.js";
import {
  sendDashboardOtp,
  verifyDashboardOtp,
} from "../services/authService.js";
import { showErrorToast } from "../lib/toast.js";
import { isValidEmail } from "../lib/emailValidation.js";
import { useResendCooldown } from "./useResendCooldown.js";
import { toast } from "sonner";

const OTP_SENT_MESSAGE = "An OTP has been sent to your email, please verify.";

export const mapAuthError = (err) => {
  return err?.message || "Something went wrong.";
};

export function useAuthForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { establishBackendSession } = useAuth();
  const redirectTo = location.state?.from;

  const [loginType, setLoginType] = useState("seller");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("email"); // email | otp
  const [otpBanner, setOtpBanner] = useState("");
  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const { secondsLeft, isCoolingDown, startCooldown } = useResendCooldown();

  const showOtpStep = step === "otp";
  const showCredentialsForm = step === "email";

  const resetVerificationState = () => {
    setOtp("");
    setOtpBanner("");
    setStep("email");
  };

  const handleLoginTypeChange = (type) => {
    setLoginType(type);
    resetVerificationState();
  };

  const handleChangeEmail = () => {
    resetVerificationState();
  };

  const finishAuth = async ({ email, otp }) => {
    setStoredLoginType(loginType);

    try {
      const user = await establishBackendSession(
        (type) => verifyDashboardOtp({ email: email.trim(), otp, loginType: type }),
        loginType
      );

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
      throw err;
    }
  };

  const handleSendOtp = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setSendingOtp(true);
    try {
      if (!isValidEmail(email)) {
        showErrorToast(null, "Please enter a valid email address.");
        return;
      }

      const data = await sendDashboardOtp({ email: email.trim(), loginType });
      setOtp("");
      setOtpBanner(data.message || OTP_SENT_MESSAGE);
      setStep("otp");
      startCooldown();
      toast.success(data.message || OTP_SENT_MESSAGE);
    } catch (err) {
      showErrorToast(err);
    } finally {
      setSendingOtp(false);
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
      const data = await sendDashboardOtp({ email: email.trim(), loginType });
      setOtpBanner(data.message || OTP_SENT_MESSAGE);
      startCooldown();
      toast.success(data.message || OTP_SENT_MESSAGE);
    } catch (err) {
      showErrorToast(err);
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      showErrorToast(null, "Enter the 6-digit verification code.");
      return;
    }

    setVerifyingOtp(true);
    try {
      await finishAuth({ email, otp: otp.trim() });
    } catch (err) {
      showErrorToast(err);
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleGoogle = async () => {
    try {
      toast.error("Google sign-in has been removed. Please use OTP login.");
    } catch (err) {
      showErrorToast(err, mapAuthError(err));
    }
  };

  return {
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
    handleGoogle,
  };
}
