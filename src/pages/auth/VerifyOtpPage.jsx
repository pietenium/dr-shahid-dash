/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/rules-of-hooks */
import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation, Navigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faArrowLeft,
  faKey,
  faSignInAlt,
} from "@fortawesome/free-solid-svg-icons";
import AuthCard from "@components/auth/AuthCard";
import OtpInput from "@components/auth/OtpInput";
import Button from "@components/ui/Button";
import Spinner from "@components/ui/Spinner";
import { verifyOtp, magicLogin, forgotPassword } from "@api/auth.api";
import { useAuthStore } from "@store/auth.store";
import { toastError } from "@utils/formatError";
import { toast } from "sonner";

/**
 * Mask email for display (e.g., j***@gmail.com)
 * @param {string} email - Full email address
 * @returns {string} Masked email
 */
function maskEmail(email) {
  if (!email) return "";
  const [name, domain] = email.split("@");
  const maskedName = name[0] + "***";
  return `${maskedName}@${domain}`;
}

/**
 * VerifyOtpPage - OTP verification with 6-digit input
 * Shows options for magic login or password reset after successful verification
 * Guards: Redirects to /forgot-password if no email in router state
 *
 * @returns {JSX.Element} OTP verification page
 */
function VerifyOtpPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuth } = useAuthStore();

  const email = location.state?.email;

  // Guard: No email in state → redirect
  if (!email) {
    return <Navigate to="/forgot-password" replace />;
  }

  const [_, setOtpValue] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [magicToken, setMagicToken] = useState(null);
  const [otpError, setOtpError] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Cooldown timer for resend
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [cooldown]);

  /**
   * Handle OTP completion - verify with backend
   * @param {string} otp - 6-digit OTP string
   */
  const handleOtpComplete = useCallback(
    async (otp) => {
      setOtpValue(otp);
      setIsVerifying(true);
      setOtpError(false);

      try {
        const response = await verifyOtp(email, otp);
        setMagicToken(response.data.magicToken);
        toast.success("OTP verified successfully!");
      } catch (error) {
        setOtpError(true);
        toastError(error, "Invalid OTP. Please try again.");
      } finally {
        setIsVerifying(false);
      }
    },
    [email],
  );

  /**
   * Handle magic login button click
   */
  const handleMagicLogin = async () => {
    if (!magicToken) return;
    setIsLoggingIn(true);

    try {
      const response = await magicLogin(email, magicToken);
      const { user, accessToken } = response.data;
      setAuth(user, accessToken);
      toast.success(`Welcome back, ${user.name}!`);
      navigate("/dashboard", { replace: true });
    } catch (error) {
      toastError(error, "Magic login failed. Please try again.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  /**
   * Handle resend OTP
   */
  const handleResend = async () => {
    if (cooldown > 0) return;
    setCooldown(60);
    try {
      await forgotPassword(email);
      toast.success("OTP resent to your email.");
    } catch {
      toast.success("If the email exists, a new OTP has been sent.");
    }
  };

  return (
    <AuthCard
      title="Verify OTP"
      subtitle={`Enter the 6-digit code sent to ${maskEmail(email)}`}
      icon={faEnvelope}
    >
      <div className="space-y-6">
        {/* OTP Input */}
        {!magicToken && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <OtpInput
              onComplete={handleOtpComplete}
              disabled={isVerifying}
              error={otpError}
            />
            {isVerifying && (
              <div className="flex justify-center mt-4">
                <Spinner size="sm" />
              </div>
            )}
            {otpError && (
              <p className="text-center text-sm text-red-500 mt-3">
                Invalid OTP. Please check and try again.
              </p>
            )}
          </motion.div>
        )}

        {/* Success: Choice Cards */}
        <AnimatePresence>
          {magicToken && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-4"
            >
              <p className="text-center text-sm text-text-para-light dark:text-text-para-dark">
                OTP verified! Choose an option below:
              </p>

              {/* Option A: Magic Login */}
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleMagicLogin}
                disabled={isLoggingIn}
                className={`
                  w-full p-4 rounded-xl border-2
                  bg-brand-softbg dark:bg-brand-primary/10
                  border-brand-primary
                  text-left transition-all duration-200
                  hover:shadow-md
                  disabled:opacity-50 disabled:cursor-not-allowed
                `.trim()}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-primary/20 flex items-center justify-center shrink-0">
                    <FontAwesomeIcon
                      icon={faSignInAlt}
                      className="w-5 h-5 text-brand-primary"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-heading-light dark:text-text-heading-dark">
                      Login Now
                    </h3>
                    <p className="text-xs text-text-para-light dark:text-text-para-dark">
                      Sign in directly to your dashboard
                    </p>
                  </div>
                  {isLoggingIn && <Spinner size="sm" className="ml-auto" />}
                </div>
              </motion.button>

              {/* Option B: Reset Password */}
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() =>
                  navigate("/reset-password", {
                    state: { email, magicToken },
                  })
                }
                className={`
                  w-full p-4 rounded-xl border-2
                  bg-card-light dark:bg-card-dark
                  border-border-light dark:border-border-dark
                  text-left transition-all duration-200
                  hover:border-brand-primary hover:shadow-md
                `.trim()}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-secondary/20 flex items-center justify-center  shrink-0">
                    <FontAwesomeIcon
                      icon={faKey}
                      className="w-5 h-5 text-brand-secondary"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-heading-light dark:text-text-heading-dark">
                      Reset Password
                    </h3>
                    <p className="text-xs text-text-para-light dark:text-text-para-dark">
                      Create a new password for your account
                    </p>
                  </div>
                </div>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Resend OTP */}
        {!magicToken && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center"
          >
            <button
              type="button"
              onClick={handleResend}
              disabled={cooldown > 0}
              className="text-sm text-brand-primary hover:text-brand-hover transition-colors disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              {cooldown > 0 ? `Resend OTP in ${cooldown}s` : "Resend OTP"}
            </button>
          </motion.div>
        )}

        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <button
            type="button"
            onClick={() => navigate("/forgot-password")}
            className="inline-flex items-center gap-1.5 text-sm text-text-para-light dark:text-text-para-dark hover:text-brand-primary transition-colors"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="w-3 h-3" />
            Change email address
          </button>
        </motion.div>
      </div>
    </AuthCard>
  );
}

export default VerifyOtpPage;
