/* eslint-disable no-unused-vars */
import { useState, useCallback } from "react";
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
  faHeartPulse,
  faBone,
  faXRay,
  faHospital,
  faArrowRight,
  faShieldHalved,
  faCircleCheck,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { loginSchema } from "@schemas/auth.schema";
import { useAuth } from "@hooks/useAuth";
import Input from "@components/ui/Input";

/**
 * Floating medical elements configuration with enhanced animations
 * @constant {Array<{icon: IconProp, size: string, position: string, delay: number, duration: number, orbitRadius: number}>}
 */
const floatingElements = [
  {
    icon: faStethoscope,
    size: "w-10 h-10",
    position: "top-[12%] left-[18%]",
    delay: 0.3,
    duration: 8,
    orbitRadius: 20,
  },
  {
    icon: faCalendarCheck,
    size: "w-8 h-8",
    position: "top-[22%] right-[22%]",
    delay: 0.8,
    duration: 9,
    orbitRadius: 25,
  },
  {
    icon: faHeartPulse,
    size: "w-9 h-9",
    position: "bottom-[28%] left-[25%]",
    delay: 0.5,
    duration: 7,
    orbitRadius: 18,
  },
  {
    icon: faBone,
    size: "w-7 h-7",
    position: "bottom-[18%] right-[18%]",
    delay: 1.2,
    duration: 10,
    orbitRadius: 22,
  },
  {
    icon: faXRay,
    size: "w-11 h-11",
    position: "top-[45%] right-[10%]",
    delay: 1.5,
    duration: 8.5,
    orbitRadius: 15,
  },
  {
    icon: faHospital,
    size: "w-6 h-6",
    position: "bottom-[45%] right-[30%]",
    delay: 0.6,
    duration: 11,
    orbitRadius: 28,
  },
];

/**
 * Animated gradient orb configuration for left panel background
 * @constant {Array<{color: string, size: string, position: string, delay: number}>}
 */
const gradientOrbs = [
  {
    color: "from-brand-primary/30 to-brand-accent/20",
    size: "w-64 h-64",
    position: "top-[-10%] left-[-15%]",
    delay: 0,
  },
  {
    color: "from-brand-secondary/25 to-brand-light/15",
    size: "w-80 h-80",
    position: "bottom-[-15%] right-[-20%]",
    delay: 0.2,
  },
  {
    color: "from-brand-accent/20 to-brand-primary/15",
    size: "w-48 h-48",
    position: "top-[40%] left-[50%]",
    delay: 0.4,
  },
];

/**
 * Quick stats for the left panel
 * @constant {Array<{label: string, value: string, icon: IconProp}>}
 */
const quickStats = [
  { label: "Years Experience", value: "15+", icon: faStethoscope },
  { label: "Patients Served", value: "10K+", icon: faHeartPulse },
  { label: "Surgeries", value: "5K+", icon: faBone },
];

/**
 * LoginPage - Premium world-class login experience
 *
 * Design Features:
 * - Animated gradient orbs with morphing blobs
 * - Glassmorphism card with frosted glass effect
 * - Floating medical icons with orbital motion
 * - Smooth micro-interactions on inputs
 * - Pulsing glow on CTA button
 * - Staggered entrance animations
 * - Dark mode fully supported with elegant transitions
 * - Responsive: centers card on mobile, split layout on desktop
 *
 * @returns {JSX.Element} Premium login page
 */
function LoginPage() {
  const { login } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [inputFocus, setInputFocus] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const rememberedEmail = localStorage.getItem("rememberedEmail") || "";

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
   * Track mouse position for subtle parallax on card
   */
  const handleMouseMove = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: ((e.clientX - rect.left) / rect.width - 0.5) * 10,
      y: ((e.clientY - rect.top) / rect.height - 0.5) * 10,
    });
  }, []);

  /**
   * Handle form submission
   * @param {Object} data - Form data {email, password, rememberMe}
   */
  const onSubmit = async (data) => {
    setIsSubmitting(true);

    if (data.rememberMe) {
      localStorage.setItem("rememberedEmail", data.email);
    } else {
      localStorage.removeItem("rememberedEmail");
    }

    try {
      await login(data.email, data.password);
    } catch {
      // Error handled in useAuth hook
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden bg-[#f8fafc] dark:bg-[#0f172a]">
      {/* ================================ */}
      {/* BACKGROUND AMBIENT ORBS */}
      {/* ================================ */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Top-right warm orb */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{
            opacity: [0.3, 0.5, 0.3],
            scale: [1, 1.15, 1],
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-15%] right-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-brand-primary/15 to-brand-accent/10 blur-3xl"
        />

        {/* Bottom-left cool orb */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{
            opacity: [0.2, 0.4, 0.2],
            scale: [1, 1.2, 1],
            x: [0, -25, 0],
            y: [0, 15, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute bottom-[-15%] left-[-10%] w-[450px] h-[450px] rounded-full bg-gradient-to-tr from-brand-secondary/12 to-brand-light/8 blur-3xl"
        />

        {/* Center subtle orb */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0.1, 0.25, 0.1],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4,
          }}
          className="absolute top-[40%] left-[45%] w-[350px] h-[350px] rounded-full bg-gradient-to-r from-brand-softbg/30 to-brand-accent/10 blur-3xl"
        />
      </div>

      {/* ================================ */}
      {/* MAIN CONTAINER */}
      {/* ================================ */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-6xl flex flex-col lg:flex-row items-stretch rounded-3xl overflow-hidden shadow-2xl relative z-10"
      >
        {/* ================================ */}
        {/* LEFT PANEL - BRAND SHOWCASE */}
        {/* ================================ */}
        <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden bg-gradient-to-br from-[#2FA084] via-[#3BA88E] to-[#578FCA]">
          {/* Animated gradient orbs */}
          {gradientOrbs.map((orb, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0.4, 0.7, 0.4],
                scale: [1, 1.2, 1],
                x: [0, index % 2 === 0 ? 15 : -15, 0],
                y: [0, index % 2 === 0 ? -10 : 10, 0],
              }}
              transition={{
                delay: orb.delay,
                duration: 8 + index * 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className={`absolute ${orb.position} ${orb.size} rounded-full bg-gradient-to-br ${orb.color} blur-2xl`}
            />
          ))}

          {/* Grid pattern overlay */}
          <div className="absolute inset-0 opacity-[0.06]">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 1px)`,
                backgroundSize: "40px 40px",
              }}
            />
          </div>

          {/* Floating Medical Icons */}
          {floatingElements.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0.15, 0.35, 0.15],
                y: [-item.orbitRadius, item.orbitRadius, -item.orbitRadius],
                x: [
                  -item.orbitRadius * 0.5,
                  item.orbitRadius * 0.5,
                  -item.orbitRadius * 0.5,
                ],
                rotate: [0, 10, -5, 0],
              }}
              transition={{
                delay: item.delay,
                duration: item.duration,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className={`absolute ${item.position} ${item.size} text-white/20`}
            >
              <FontAwesomeIcon icon={item.icon} />
            </motion.div>
          ))}

          {/* Brand Content */}
          <div className="relative z-10 flex flex-col justify-center px-10 xl:px-14 w-full">
            {/* Logo */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                delay: 0.3,
                type: "spring",
                stiffness: 200,
                damping: 20,
              }}
              className="mb-8"
            >
              <div className="relative inline-block">
                {/* Outer glow ring */}
                <motion.div
                  animate={{
                    scale: [1, 1.05, 1],
                    opacity: [0.3, 0.5, 0.3],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute inset-[-8px] rounded-full bg-white/20 blur-sm"
                />
                {/* Avatar circle */}
                <div className="relative w-24 h-24 rounded-2xl bg-white/15 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-lg">
                  <FontAwesomeIcon
                    icon={faUserDoctor}
                    className="w-12 h-12 text-white drop-shadow-lg"
                  />
                </div>
              </div>
            </motion.div>

            {/* Doctor Name */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <h1 className="text-3xl xl:text-4xl font-extrabold text-white mb-2 leading-tight tracking-tight">
                Dr. Md. Sahidur
                <br />
                Rahman Khan
              </h1>
            </motion.div>

            {/* Title with animated underline */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="mb-4"
            >
              <p className="text-lg text-white/80 font-medium">
                Orthopedic Surgeon
              </p>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: 48 }}
                transition={{ delay: 1.2, duration: 0.5 }}
                className="h-0.5 bg-gradient-to-r from-white/80 to-transparent mt-2 rounded-full"
              />
            </motion.div>

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9, duration: 0.6 }}
              className="text-sm text-white/55 leading-relaxed max-w-xs mb-10"
            >
              Dedicated to providing exceptional orthopedic care with advanced
              surgical techniques and compassionate patient treatment.
            </motion.p>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.6 }}
              className="grid grid-cols-3 gap-3"
            >
              {quickStats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.3 + index * 0.1 }}
                  whileHover={{ y: -3, scale: 1.02 }}
                  className="text-center p-3 rounded-xl bg-white/8 backdrop-blur-sm border border-white/10 hover:bg-white/12 transition-all duration-300"
                >
                  <FontAwesomeIcon
                    icon={stat.icon}
                    className="w-4 h-4 text-white/50 mb-1.5"
                  />
                  <p className="text-lg font-bold text-white">{stat.value}</p>
                  <p className="text-[10px] text-white/50 leading-tight">
                    {stat.label}
                  </p>
                </motion.div>
              ))}
            </motion.div>

            {/* Shield badge */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.6 }}
              className="mt-8 flex items-center gap-2 text-white/40 text-xs"
            >
              <FontAwesomeIcon icon={faShieldHalved} className="w-3 h-3" />
              <span>HIPAA Compliant • Secure Login</span>
            </motion.div>
          </div>
        </div>

        {/* ================================ */}
        {/* RIGHT PANEL - LOGIN FORM */}
        {/* ================================ */}
        <div
          className="flex-1 flex items-center justify-center p-6 sm:p-10 lg:p-12 xl:p-16 bg-white dark:bg-[#1e293b] relative"
          onMouseMove={handleMouseMove}
        >
          {/* Subtle inner glow on card */}
          <div className="absolute inset-0 bg-gradient-to-br from-brand-softbg/20 to-transparent dark:from-brand-primary/3 dark:to-transparent pointer-events-none" />

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{
              transform: `perspective(1000px) rotateY(${mousePosition.x * 0.02}deg) rotateX(${-mousePosition.y * 0.02}deg)`,
            }}
            className="w-full max-w-md relative z-10"
          >
            {/* Mobile Logo (hidden on desktop) */}
            <div className="lg:hidden text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center mx-auto mb-3 shadow-lg shadow-brand-primary/20"
              >
                <FontAwesomeIcon
                  icon={faUserDoctor}
                  className="w-8 h-8 text-white"
                />
              </motion.div>
              <h1 className="text-xl font-bold text-[#1f2937] dark:text-[#f8fafc]">
                Dr. Sahidur Rahman Khan
              </h1>
              <p className="text-sm text-[#6b7280] dark:text-[#cbd5e1]">
                Orthopedic Surgeon
              </p>
            </div>

            {/* Welcome Section */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-1 h-7 bg-gradient-to-b from-brand-primary to-brand-accent rounded-full" />
                <h2 className="text-2xl font-bold text-[#1f2937] dark:text-[#f8fafc]">
                  Welcome Back
                </h2>
              </div>
              <p className="text-sm text-[#6b7280] dark:text-[#cbd5e1] ml-4">
                Sign in to access your medical dashboard
              </p>
            </motion.div>

            {/* Login Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Email Input */}
              <motion.div
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <label className="block text-sm font-medium text-[#1f2937] dark:text-[#f8fafc] mb-1.5 ml-1">
                  Email Address
                </label>
                <div
                  className={`
                    relative group rounded-xl transition-all duration-300
                    ${
                      inputFocus === "email"
                        ? "ring-2 ring-[#2FA084] ring-offset-2 dark:ring-offset-[#1e293b]"
                        : errors.email
                          ? "ring-2 ring-red-400 ring-offset-2 dark:ring-offset-[#1e293b]"
                          : "ring-1 ring-[#e5e7eb] dark:ring-[#334155] hover:ring-[#2FA084]/40"
                    }
                  `}
                >
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FontAwesomeIcon
                      icon={faEnvelope}
                      className={`w-4 h-4 transition-colors duration-300 ${
                        inputFocus === "email"
                          ? "text-[#2FA084]"
                          : "text-[#9ca3af]"
                      }`}
                    />
                  </div>
                  <input
                    type="email"
                    placeholder="doctor@example.com"
                    disabled={isSubmitting}
                    onFocus={() => setInputFocus("email")}
                    onBlur={() => setInputFocus(null)}
                    className={`
                      w-full pl-11 pr-4 py-3 rounded-xl text-sm
                      bg-white dark:bg-[#0f172a]
                      text-[#1f2937] dark:text-[#f8fafc]
                      placeholder:text-[#9ca3af] dark:placeholder:text-[#64748b]
                      disabled:opacity-50 disabled:cursor-not-allowed
                      outline-none transition-all duration-300
                    `}
                    {...register("email")}
                  />
                </div>
                <AnimatePresence>
                  {errors.email && (
                    <motion.p
                      initial={{ opacity: 0, y: -5, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: "auto" }}
                      exit={{ opacity: 0, y: -5, height: 0 }}
                      className="text-xs text-red-500 mt-1.5 ml-1"
                    >
                      {errors.email.message}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Password Input */}
              <motion.div
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <label className="block text-sm font-medium text-[#1f2937] dark:text-[#f8fafc] mb-1.5 ml-1">
                  Password
                </label>
                <div
                  className={`
                    relative group rounded-xl transition-all duration-300
                    ${
                      inputFocus === "password"
                        ? "ring-2 ring-[#2FA084] ring-offset-2 dark:ring-offset-[#1e293b]"
                        : errors.password
                          ? "ring-2 ring-red-400 ring-offset-2 dark:ring-offset-[#1e293b]"
                          : "ring-1 ring-[#e5e7eb] dark:ring-[#334155] hover:ring-[#2FA084]/40"
                    }
                  `}
                >
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FontAwesomeIcon
                      icon={faLock}
                      className={`w-4 h-4 transition-colors duration-300 ${
                        inputFocus === "password"
                          ? "text-[#2FA084]"
                          : "text-[#9ca3af]"
                      }`}
                    />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    disabled={isSubmitting}
                    onFocus={() => setInputFocus("password")}
                    onBlur={() => setInputFocus(null)}
                    className={`
                      w-full pl-11 pr-12 py-3 rounded-xl text-sm
                      bg-white dark:bg-[#0f172a]
                      text-[#1f2937] dark:text-[#f8fafc]
                      placeholder:text-[#9ca3af] dark:placeholder:text-[#64748b]
                      disabled:opacity-50 disabled:cursor-not-allowed
                      outline-none transition-all duration-300
                    `}
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    tabIndex={-1}
                  >
                    <motion.div
                      whileTap={{ scale: 0.85 }}
                      className={`p-1.5 rounded-lg transition-colors ${
                        showPassword
                          ? "text-[#2FA084] bg-[#E8F7EF] dark:bg-[#2FA084]/10"
                          : "text-[#9ca3af] hover:text-[#6b7280] hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                    >
                      {showPassword ? (
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 3l18 18"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      )}
                    </motion.div>
                  </button>
                </div>
                <AnimatePresence>
                  {errors.password && (
                    <motion.p
                      initial={{ opacity: 0, y: -5, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: "auto" }}
                      exit={{ opacity: 0, y: -5, height: 0 }}
                      className="text-xs text-red-500 mt-1.5 ml-1"
                    >
                      {errors.password.message}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Remember Me & Forgot Password */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex items-center justify-between"
              >
                <label className="flex items-center gap-2.5 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      {...register("rememberMe")}
                      disabled={isSubmitting}
                    />
                    <motion.div
                      whileTap={{ scale: 0.9 }}
                      className={`
                        w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-300
                        ${
                          rememberMe
                            ? "bg-[#2FA084] border-[#2FA084]"
                            : "border-[#d1d5db] dark:border-[#475569] group-hover:border-[#2FA084]/50"
                        }
                      `}
                    >
                      <AnimatePresence>
                        {rememberMe && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            transition={{
                              type: "spring",
                              stiffness: 400,
                              damping: 20,
                            }}
                          >
                            <FontAwesomeIcon
                              icon={faCircleCheck}
                              className="w-3 h-3 text-white"
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </div>
                  <span className="text-sm text-[#6b7280] dark:text-[#cbd5e1] select-none group-hover:text-[#1f2937] dark:group-hover:text-white transition-colors">
                    Remember email
                  </span>
                </label>

                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-[#2FA084] hover:text-[#267D68] transition-all duration-300 hover:underline underline-offset-4 decoration-[#2FA084]/30"
                >
                  Forgot Password?
                </Link>
              </motion.div>

              {/* Submit Button */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.01, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  className={`
                    relative w-full py-3.5 rounded-xl font-semibold text-white text-sm
                    bg-gradient-to-r from-[#2FA084] to-[#578FCA]
                    shadow-lg shadow-[#2FA084]/25 hover:shadow-xl hover:shadow-[#2FA084]/35
                    disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:shadow-lg
                    transition-all duration-300 overflow-hidden
                    group
                  `}
                >
                  {/* Button shimmer effect */}
                  <motion.div
                    animate={{
                      x: ["-100%", "200%"],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent skew-x-[-20deg]"
                  />

                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isSubmitting ? (
                      <>
                        <FontAwesomeIcon
                          icon={faSpinner}
                          className="w-4 h-4 animate-spin"
                        />
                        Signing in...
                      </>
                    ) : (
                      <>
                        Sign In to Dashboard
                        <motion.span
                          animate={{ x: [0, 4, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <FontAwesomeIcon
                            icon={faArrowRight}
                            className="w-3.5 h-3.5"
                          />
                        </motion.span>
                      </>
                    )}
                  </span>
                </motion.button>
              </motion.div>
            </form>

            {/* Footer */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-center text-xs text-[#9ca3af] dark:text-[#64748b] mt-8"
            >
              © {new Date().getFullYear()} Dr. Md. Sahidur Rahman Khan
              <span className="hidden sm:inline"> • All rights reserved</span>
            </motion.p>
          </motion.div>
        </div>
      </motion.div>

      {/* ================================ */}
      {/* BOTTOM LEFT DECORATIVE ELEMENT */}
      {/* ================================ */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ delay: 1.5 }}
        className="fixed bottom-6 left-6 text-[10px] text-[#9ca3af] dark:text-[#475569] pointer-events-none hidden lg:block"
      >
        v1.0.0 • Admin Dashboard
      </motion.div>
    </div>
  );
}

export default LoginPage;
