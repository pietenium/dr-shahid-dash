/* eslint-disable no-unused-vars */
import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

/**
 * OtpInput - Secure 6-digit OTP input with individual boxes
 * Features: Auto-focus next, paste support, backspace navigation, animations
 *
 * @param {Object} props
 * @param {Function} props.onComplete - Called when all 6 digits are filled with the OTP string
 * @param {boolean} [props.disabled=false] - Disable all inputs
 * @param {boolean} [props.error=false] - Show error state on boxes
 * @param {Function} [props.onChange] - Called on every digit change with current value
 */
function OtpInput({ onComplete, disabled = false, error = false, onChange }) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);

  /**
   * Focus first empty input or specified index
   * @param {number} [index=0] - Input index to focus
   */
  const focusInput = useCallback((index = 0) => {
    if (inputRefs.current[index]) {
      inputRefs.current[index].focus();
    }
  }, []);

  // Auto-focus first input on mount
  useEffect(() => {
    focusInput(0);
  }, [focusInput]);

  /**
   * Handle single digit input
   * @param {number} index - Input box index
   * @param {string} value - Input value
   */
  const handleInput = useCallback(
    (index, value) => {
      // Only allow single digit
      const digit = value.replace(/[^0-9]/g, "").slice(-1);
      if (!digit) return;

      const newOtp = [...otp];
      newOtp[index] = digit;
      setOtp(newOtp);
      onChange?.(newOtp.join(""));

      // Auto-focus next input
      if (index < 5) {
        focusInput(index + 1);
      }

      // Check completion
      if (newOtp.every((d) => d !== "")) {
        onComplete(newOtp.join(""));
      }
    },
    [otp, onComplete, onChange, focusInput],
  );

  /**
   * Handle backspace key
   * @param {number} index - Current input index
   * @param {React.KeyboardEvent} e - Keyboard event
   */
  const handleKeyDown = useCallback(
    (index, e) => {
      if (e.key === "Backspace") {
        const newOtp = [...otp];
        if (newOtp[index]) {
          // Clear current input
          newOtp[index] = "";
          setOtp(newOtp);
          onChange?.(newOtp.join(""));
        } else if (index > 0) {
          // Move to previous and clear it
          newOtp[index - 1] = "";
          setOtp(newOtp);
          onChange?.(newOtp.join(""));
          focusInput(index - 1);
        }
      } else if (e.key === "ArrowLeft" && index > 0) {
        focusInput(index - 1);
      } else if (e.key === "ArrowRight" && index < 5) {
        focusInput(index + 1);
      }
    },
    [otp, onChange, focusInput],
  );

  /**
   * Handle paste event - distribute pasted digits across boxes
   * @param {React.ClipboardEvent} e - Clipboard event
   */
  const handlePaste = useCallback(
    (e) => {
      e.preventDefault();
      const pastedData = e.clipboardData
        .getData("text")
        .replace(/[^0-9]/g, "")
        .slice(0, 6);
      if (!pastedData) return;

      const newOtp = [...otp];
      for (let i = 0; i < pastedData.length; i++) {
        if (i < 6) newOtp[i] = pastedData[i];
      }
      setOtp(newOtp);
      onChange?.(newOtp.join(""));

      // Focus next empty or last
      const nextEmpty = newOtp.findIndex((d) => d === "");
      focusInput(nextEmpty >= 0 ? nextEmpty : 5);

      // Check completion
      if (newOtp.every((d) => d !== "") && newOtp.length === 6) {
        onComplete(newOtp.join(""));
      }
    },
    [otp, onComplete, onChange, focusInput],
  );

  return (
    <div className="flex gap-3 justify-center" onPaste={handlePaste}>
      {otp.map((digit, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05, duration: 0.2 }}
        >
          <input
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={1}
            value={digit}
            onChange={(e) => handleInput(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            disabled={disabled}
            aria-label={`OTP digit ${index + 1}`}
            className={`
              w-12 h-14 sm:w-14 sm:h-16
              text-center text-xl sm:text-2xl font-bold
              rounded-xl border-2
              transition-all duration-200
              bg-card-light dark:bg-card-dark
              text-text-heading-light dark:text-text-heading-dark
              focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent
              disabled:opacity-50 disabled:cursor-not-allowed
              ${
                error
                  ? "border-red-500 focus:ring-red-500"
                  : digit
                    ? "border-brand-primary"
                    : "border-border-light dark:border-border-dark"
              }
            `.trim()}
          />
        </motion.div>
      ))}
    </div>
  );
}

export default OtpInput;
