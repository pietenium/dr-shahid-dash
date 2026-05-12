/* eslint-disable no-unused-vars */
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";

/**
 * Calculate password strength score
 * @param {string} password - Password to evaluate
 * @returns {{ score: number, checks: Object }} Score 0-4 and individual checks
 */
function calculateStrength(password) {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[@$!%*?&]/.test(password),
  };

  const score = Object.values(checks).filter(Boolean).length;
  return { score, checks };
}

const strengthConfig = [
  {
    label: "Weak",
    color: "bg-red-500",
    textColor: "text-red-500",
    minScore: 1,
  },
  {
    label: "Fair",
    color: "bg-orange-500",
    textColor: "text-orange-500",
    minScore: 2,
  },
  {
    label: "Good",
    color: "bg-yellow-500",
    textColor: "text-yellow-500",
    minScore: 3,
  },
  {
    label: "Strong",
    color: "bg-green-500",
    textColor: "text-green-500",
    minScore: 4,
  },
];

const requirementLabels = {
  length: "At least 8 characters",
  uppercase: "Uppercase letter",
  lowercase: "Lowercase letter",
  number: "Number",
  special: "Special character (@$!%*?&)",
};

/**
 * PasswordStrengthMeter - Visual password strength indicator
 * Shows 4-bar strength meter and requirement checklist
 *
 * @param {Object} props
 * @param {string} props.password - Current password value to evaluate
 */
function PasswordStrengthMeter({ password }) {
  const { score, checks } = calculateStrength(password || "");
  const currentStrength = strengthConfig[score - 1] || null;

  return (
    <div className="space-y-3">
      {/* Strength Bars */}
      <div className="flex gap-1.5">
        {[1, 2, 3, 4].map((level) => {
          const isActive = score >= level;
          const config = strengthConfig[level - 1];
          return (
            <motion.div
              key={level}
              initial={{ width: 0 }}
              animate={{
                width: "100%",
                backgroundColor: isActive
                  ? config.color.replace("bg-", "")
                  : undefined,
              }}
              className={`
                h-1.5 rounded-full flex-1 transition-colors duration-300
                ${isActive ? config.color : "bg-gray-200 dark:bg-gray-600"}
              `.trim()}
            />
          );
        })}
      </div>

      {/* Strength Label */}
      {currentStrength && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`text-xs font-medium ${currentStrength.textColor}`}
        >
          {currentStrength.label} password
        </motion.p>
      )}

      {/* Requirements Checklist */}
      <div className="space-y-1.5">
        {Object.entries(requirementLabels).map(([key, label]) => {
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
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
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
                {label}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default PasswordStrengthMeter;
