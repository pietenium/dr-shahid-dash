/* eslint-disable no-unused-vars */
import { memo, useMemo } from "react";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";

/**
 * Calculate password strength score (0-4)
 * @param {string} password - Password to evaluate
 * @returns {{ score: number, checks: Object, label: string, color: string }}
 */
function calculateStrength(password) {
  if (!password) return { score: 0, checks: {}, label: "", color: "" };

  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[@$!%*?&]/.test(password),
  };

  const score = Object.values(checks).filter(Boolean).length;

  const levels = [
    { score: 0, label: "", color: "" },
    { score: 1, label: "Weak", color: "bg-red-500", textColor: "text-red-500" },
    {
      score: 2,
      label: "Fair",
      color: "bg-orange-500",
      textColor: "text-orange-500",
    },
    {
      score: 3,
      label: "Good",
      color: "bg-yellow-500",
      textColor: "text-yellow-500",
    },
    {
      score: 4,
      label: "Strong",
      color: "bg-green-500",
      textColor: "text-green-500",
    },
  ];

  return { score, checks, ...levels[score] };
}

/**
 * Requirement labels for password checklist
 * @constant {Object.<string, string>}
 */
const REQUIREMENTS = {
  length: "At least 8 characters",
  uppercase: "Uppercase letter",
  lowercase: "Lowercase letter",
  number: "Number",
  special: "Special character (@$!%*?&)",
};

/**
 * PasswordStrengthMeter - Visual password strength indicator
 * Features 4-segment bar, strength label, and animated requirement checklist
 *
 * @param {Object} props
 * @param {string} props.password - Current password value
 */
const PasswordStrengthMeter = memo(function PasswordStrengthMeter({
  password,
}) {
  const { score, checks, label, color, textColor } = useMemo(
    () => calculateStrength(password || ""),
    [password],
  );

  return (
    <div className="space-y-3">
      {/* Strength Bars */}
      <div className="flex gap-1.5">
        {[1, 2, 3, 4].map((level) => {
          const isActive = score >= level;
          return (
            <motion.div
              key={level}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              className={`h-1.5 rounded-full flex-1 transition-colors duration-300 ${
                isActive ? color : "bg-gray-200 dark:bg-gray-600"
              }`}
            />
          );
        })}
      </div>

      {/* Strength Label */}
      {label && (
        <motion.p
          initial={{ opacity: 0, y: -3 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-xs font-medium ${textColor}`}
        >
          {label} password
        </motion.p>
      )}

      {/* Requirements Checklist */}
      <div className="space-y-1.5 pt-1">
        {Object.entries(REQUIREMENTS).map(([key, reqLabel]) => {
          const isMet = checks[key];
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 text-xs"
            >
              {isMet ? (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 20 }}
                >
                  <FontAwesomeIcon
                    icon={faCheck}
                    className="w-3 h-3 text-green-500"
                  />
                </motion.span>
              ) : (
                <FontAwesomeIcon
                  icon={faXmark}
                  className="w-3 h-3 text-gray-400"
                />
              )}
              <span
                className={
                  isMet
                    ? "text-green-600 dark:text-green-400"
                    : "text-text-para-light dark:text-text-para-dark"
                }
              >
                {reqLabel}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
});

export default PasswordStrengthMeter;
