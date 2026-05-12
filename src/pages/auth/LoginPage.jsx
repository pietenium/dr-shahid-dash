/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/incompatible-library */
import { useState } from "react";
import { Link } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faLock,
  faUserDoctor,
  faStethoscope,
  faCalendarCheck,
  faHospital,
  faHeartPulse,
} from "@fortawesome/free-solid-svg-icons";
import { loginSchema } from "@schemas/auth.schema";
import { useAuth } from "@hooks/useAuth";
import Input from "@components/ui/Input";
import Button from "@components/ui/Button";
/**
 * Floating medical icons configuration for left panel animation
 * @constant {Array<{icon: IconProp, size: string, position: string, delay: number, duration: number}>}
 */
const floatingIcons = [
  {
    icon: faStethoscope,
    size: "w-8 h-8",
    position: "top-[15%] left-[20%]",
    delay: 0.3,
    duration: 6,
  },
  {
    icon: faCalendarCheck,
    size: "w-6 h-6",
    position: "top-[25%] right-[25%]",
    delay: 0.8,
    duration: 7,
  },
  {
    icon: faHospital,
    size: "w-10 h-10",
    position: "bottom-[30%] left-[30%]",
    delay: 1.2,
    duration: 5,
  },
  {
    icon: faHeartPulse,
    size: "w-7 h-7",
    position: "bottom-[20%] right-[20%]",
    delay: 0.5,
    duration: 8,
  },
  {
    icon: faUserDoctor,
    size: "w-6 h-6",
    position: "top-[50%] right-[15%]",
    delay: 1.0,
    duration: 6.5,
  },
];

/**
 * LoginPage - Split screen login with branded left panel and form on right
 * Features: Email/password form, remember me, forgot password link
 * Handles all error states with appropriate toasts
 * Mobile: Shows form only (left panel hidden)
 *
 * @returns {JSX.Element} Login page with split layout
 */
function LoginPage() {
  const { login } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rememberedEmail] = useState(
    () => localStorage.getItem("rememberedEmail") || "",
  );

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: rememberedEmail,
      password: "",
      rememberMe: !!rememberedEmail,
    },
  });

  const rememberMe = watch("rememberMe");

  /**
   * Handle form submission
   * Calls login API, handles all error cases
   * @param {Object} data - Form data {email, password, rememberMe}
   */
  const onSubmit = async (data) => {
    setIsSubmitting(true);

    // Handle remember me
    if (data.rememberMe) {
      localStorage.setItem("rememberedEmail", data.email);
    } else {
      localStorage.removeItem("rememberedEmail");
    }

    try {
      await login(data.email, data.password);
    } catch {
      // Error handling is done in useAuth hook
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Branded Panel - Hidden on mobile */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="hidden md:flex md:w-1/2 lg:w-5/12 bg-linear-to-br from-brand-primary to-brand-secondary relative overflow-hidden items-center justify-center"
      >
        {/* Background pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,white_1px,transparent_1px)] bg-size-[40px_40px]" />
        </div>

        {/* Floating Medical Icons */}
        {floatingIcons.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: [0.2, 0.5, 0.2],
              y: [0, -15, 0],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              delay: item.delay,
              duration: item.duration,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className={`absolute ${item.position} text-white/20 ${item.size}`}
          >
            <FontAwesomeIcon icon={item.icon} />
          </motion.div>
        ))}

        {/* Brand Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="relative z-10 text-center px-8"
        >
          {/* Logo/Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
            className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-6"
          >
            <FontAwesomeIcon
              icon={faUserDoctor}
              className="w-12 h-12 text-white"
            />
          </motion.div>

          {/* Doctor Name */}
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="text-3xl lg:text-4xl font-bold text-white mb-2"
          >
            Dr. Md. Sahidur Rahman Khan
          </motion.h1>

          {/* Title */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            className="text-lg text-white/80 mb-3"
          >
            Orthopedic Surgeon
          </motion.p>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.5 }}
            className="text-sm text-white/60 max-w-md"
          >
            Dedicated to providing exceptional orthopedic care with advanced
            surgical techniques and compassionate patient treatment.
          </motion.p>

          {/* Decorative Line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 1.3, duration: 0.5 }}
            className="w-16 h-0.5 bg-white/50 mx-auto mt-6 rounded-full"
            style={{ transformOrigin: "center" }}
          />
        </motion.div>
      </motion.div>

      {/* Right Form Panel */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-8 bg-bg-light dark:bg-bg-dark">
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="w-full max-w-md"
        >
          {/* Mobile Brand Header */}
          <div className="md:hidden text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-brand-primary flex items-center justify-center mx-auto mb-3">
              <FontAwesomeIcon
                icon={faUserDoctor}
                className="w-8 h-8 text-white"
              />
            </div>
            <h1 className="text-xl font-bold text-text-heading-light dark:text-text-heading-dark">
              Dr. Sahidur Rahman Khan
            </h1>
            <p className="text-sm text-text-para-light dark:text-text-para-dark">
              Orthopedic Surgeon
            </p>
          </div>

          {/* Form Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-text-heading-light dark:text-text-heading-dark mb-1">
              Welcome Back
            </h2>
            <p className="text-sm text-text-para-light dark:text-text-para-dark">
              Sign in to access your dashboard
            </p>
          </div>

          {/* Login Form */}
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
                placeholder="Enter your email"
                leftIcon={faEnvelope}
                error={errors.email?.message}
                disabled={isSubmitting}
                {...register("email")}
              />
            </motion.div>

            {/* Password Input */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Input
                label="Password"
                type="password"
                placeholder="Enter your password"
                leftIcon={faLock}
                showPasswordToggle
                error={errors.password?.message}
                disabled={isSubmitting}
                {...register("password")}
              />
            </motion.div>

            {/* Remember Me & Forgot Password */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center justify-between"
            >
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-border-light dark:border-border-dark text-brand-primary focus:ring-brand-primary"
                  {...register("rememberMe")}
                  disabled={isSubmitting}
                />
                <span className="text-sm text-text-para-light dark:text-text-para-dark">
                  Remember email
                </span>
              </label>
              <Link
                to="/forgot-password"
                className="text-sm text-brand-primary hover:text-brand-hover transition-colors font-medium"
              >
                Forgot Password?
              </Link>
            </motion.div>

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={isSubmitting}
                disabled={isSubmitting}
                className="w-full"
              >
                Sign In
              </Button>
            </motion.div>
          </form>

          {/* Footer */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-xs text-text-para-light dark:text-text-para-dark mt-8"
          >
            © {new Date().getFullYear()} Dr. Md. Sahidur Rahman Khan. All rights
            reserved.
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}

export default LoginPage;
