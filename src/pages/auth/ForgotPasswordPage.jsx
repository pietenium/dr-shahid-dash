/* eslint-disable no-unused-vars */
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { forgotPasswordSchema } from "@schemas/auth.schema";
import AuthCard from "@components/auth/AuthCard";
import Input from "@components/ui/Input";
import Button from "@components/ui/Button";
import { forgotPassword } from "@api/auth.api";
import { toastError } from "@utils/formatError";
import { toast } from "sonner";

/**
 * ForgotPasswordPage - Email input to receive OTP for password reset
 * Always shows success to prevent user enumeration
 * Passes email via React Router state to VerifyOtpPage
 *
 * @returns {JSX.Element} Forgot password form page
 */
function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  /**
   * Handle email submission
   * Sends OTP and navigates to verification page
   * @param {Object} data - Form data {email}
   */
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await forgotPassword(data.email);
      // Always show success - backend never leaks user existence
      toast.success(
        "If an account exists, an OTP has been sent to your email.",
      );
      navigate("/verify-otp", {
        state: { email: data.email },
      });
    } catch (error) {
      // Still show success for security - navigate anyway
      toastError(
        error,
        "If an account exists, an OTP has been sent to your email.",
      );
      navigate("/verify-otp", {
        state: { email: data.email },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCard
      title="Forgot Password"
      subtitle="Enter your email and we'll send you an OTP to reset your password"
      icon={faEnvelope}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Email Input */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Input
            label="Email Address"
            type="email"
            placeholder="Enter your registered email"
            leftIcon={faEnvelope}
            error={errors.email?.message}
            disabled={isSubmitting}
            {...register("email")}
          />
        </motion.div>

        {/* Submit Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={isSubmitting}
            disabled={isSubmitting}
            className="w-full"
          >
            Send OTP
          </Button>
        </motion.div>

        {/* Back to Login */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-sm text-brand-primary hover:text-brand-hover transition-colors font-medium"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="w-3 h-3" />
            Back to Login
          </Link>
        </motion.div>
      </form>
    </AuthCard>
  );
}

export default ForgotPasswordPage;
