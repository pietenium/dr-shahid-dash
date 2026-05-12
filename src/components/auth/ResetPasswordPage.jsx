/* eslint-disable react-hooks/incompatible-library */
/* eslint-disable no-unused-vars */
import { useState } from "react";
import { useNavigate, useLocation, Navigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLock,
  faArrowLeft,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";
import { resetPasswordSchema } from "@schemas/auth.schema";
import AuthCard from "@components/auth/AuthCard";
import Input from "@components/ui/Input";
import Button from "@components/ui/Button";
import PasswordStrengthMeter from "@components/auth/PasswordStrengthMeter";
import { resetPassword } from "@api/auth.api";
import { toastError } from "@utils/formatError";
import { toast } from "sonner";

/**
 * ResetPasswordPage - New password form with strength meter
 * Guards: Requires email and magicToken from router state
 * Auto-redirects to login page after successful reset
 *
 * @returns {JSX.Element} Reset password form page
 */
function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { email, magicToken } = location.state || {};

  // ✅ MOVED: All hooks BEFORE any conditional returns
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const newPassword = watch("newPassword");

  /**
   * Handle password reset submission
   * @param {Object} data - Form data {newPassword, confirmPassword}
   */
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await resetPassword(email, magicToken, data.newPassword);
      setIsSuccess(true);
      toast.success("Password reset successfully!");

      // Auto-redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 3000);
    } catch (error) {
      toastError(error, "Failed to reset password. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ Guard AFTER all hooks are called
  if (!email || !magicToken) {
    return <Navigate to="/login" replace />;
  }

  return (
    <AuthCard
      title="Reset Password"
      subtitle="Create a new secure password for your account"
      icon={faLock}
    >
      <AnimatePresence mode="wait">
        {isSuccess ? (
          /* Success State */
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4"
            >
              <FontAwesomeIcon
                icon={faCheckCircle}
                className="w-10 h-10 text-green-500"
              />
            </motion.div>
            <h3 className="text-lg font-semibold text-text-heading-light dark:text-text-heading-dark mb-2">
              Password Reset Successfully!
            </h3>
            <p className="text-sm text-text-para-light dark:text-text-para-dark">
              Your password has been reset. You will be redirected to the login
              page shortly.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="mt-4 text-sm text-brand-primary hover:text-brand-hover transition-colors font-medium"
            >
              Go to Login now
            </button>
          </motion.div>
        ) : (
          /* Form State */
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5"
          >
            {/* New Password */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Input
                label="New Password"
                type="password"
                placeholder="Enter new password"
                leftIcon={faLock}
                showPasswordToggle
                error={errors.newPassword?.message}
                disabled={isSubmitting}
                {...register("newPassword")}
              />
              {newPassword && (
                <div className="mt-3">
                  <PasswordStrengthMeter password={newPassword} />
                </div>
              )}
            </motion.div>

            {/* Confirm Password */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Input
                label="Confirm Password"
                type="password"
                placeholder="Re-enter your new password"
                leftIcon={faLock}
                showPasswordToggle
                error={errors.confirmPassword?.message}
                disabled={isSubmitting}
                {...register("confirmPassword")}
              />
            </motion.div>

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={isSubmitting}
                disabled={isSubmitting}
                className="w-full"
              >
                Reset Password
              </Button>
            </motion.div>

            {/* Back to Login */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-center"
            >
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="inline-flex items-center gap-1.5 text-sm text-text-para-light dark:text-text-para-dark hover:text-brand-primary transition-colors"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="w-3 h-3" />
                Back to Login
              </button>
            </motion.div>
          </motion.form>
        )}
      </AnimatePresence>
    </AuthCard>
  );
}

export default ResetPasswordPage;
