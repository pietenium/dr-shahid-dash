/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserDoctor,
  faCircleExclamation,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";
import { magicLogin } from "@api/auth.api";
import { useAuthStore } from "@store/auth.store";
import Button from "@components/ui/Button";
import Spinner from "@components/ui/Spinner";
import { toast } from "sonner";

/**
 * MagicLoginPage - Handles magic link login from email
 * URL: /magic-login?token=<token>&email=<email>
 * Auto-calls magicLogin on mount, shows result
 *
 * @returns {JSX.Element} Magic login processing page
 */
function MagicLoginPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [status, setStatus] = useState("loading"); // 'loading' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState("");

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  useEffect(() => {
    /**
     * Auto-attempt magic login with URL params
     */
    async function attemptMagicLogin() {
      if (!token || !email) {
        setStatus("error");
        setErrorMessage("Invalid magic link. Missing required parameters.");
        return;
      }

      try {
        const response = await magicLogin(email, token);
        const { user, accessToken } = response.data;
        setAuth(user, accessToken);
        setStatus("success");

        // Navigate after brief success display
        setTimeout(() => {
          toast.success(`Welcome, ${user.name}!`);
          navigate("/dashboard", { replace: true });
        }, 1500);
      } catch (error) {
        setStatus("error");
        const statusCode = error?.response?.status;
        if (statusCode === 401) {
          setErrorMessage(
            "This magic link has expired or is invalid. Please request a new one.",
          );
        } else {
          setErrorMessage(
            "An error occurred while logging in. Please try again.",
          );
        }
      }
    }

    attemptMagicLogin();
  }, [token, email, setAuth, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-bg-light dark:bg-bg-dark">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-card-light dark:bg-card-dark rounded-2xl shadow-xl border border-border-light dark:border-border-dark p-8 text-center"
      >
        {/* Loading State */}
        {status === "loading" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="w-20 h-20 rounded-full bg-brand-softbg dark:bg-brand-primary/10 flex items-center justify-center mx-auto"
            >
              <FontAwesomeIcon
                icon={faUserDoctor}
                className="w-10 h-10 text-brand-primary"
              />
            </motion.div>
            <div>
              <h2 className="text-xl font-semibold text-text-heading-light dark:text-text-heading-dark mb-2">
                Logging you in...
              </h2>
              <p className="text-sm text-text-para-light dark:text-text-para-dark">
                Please wait while we verify your magic link
              </p>
            </div>
            <Spinner size="md" />
          </motion.div>
        )}

        {/* Success State */}
        {status === "success" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto"
            >
              <svg
                className="w-10 h-10 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </motion.div>
            <div>
              <h2 className="text-xl font-semibold text-text-heading-light dark:text-text-heading-dark mb-2">
                Login Successful!
              </h2>
              <p className="text-sm text-text-para-light dark:text-text-para-dark">
                Redirecting you to your dashboard...
              </p>
            </div>
          </motion.div>
        )}

        {/* Error State */}
        {status === "error" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto">
              <FontAwesomeIcon
                icon={faCircleExclamation}
                className="w-10 h-10 text-red-500"
              />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-text-heading-light dark:text-text-heading-dark mb-2">
                Login Failed
              </h2>
              <p className="text-sm text-text-para-light dark:text-text-para-dark">
                {errorMessage}
              </p>
            </div>
            <Button
              variant="primary"
              onClick={() => navigate("/login")}
              rightIcon={faArrowRight}
            >
              Go to Login
            </Button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

export default MagicLoginPage;
