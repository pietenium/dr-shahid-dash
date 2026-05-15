/* eslint-disable no-unused-vars */
import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faEnvelope,
  faLock,
  faCheck,
  faShieldHalved,
  faSun,
  faMoon,
  faCircleHalfStroke,
  faCalendar,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
import { getMe, updateMe, changePassword } from "@api/users.api";
import { useAuth } from "@hooks/useAuth";
import { useTheme } from "@hooks/useTheme";
import { useUIStore } from "@store/ui.store";
import { formatDate, formatRelativeTime } from "@utils/formatDate";
import PageHeader from "@components/shared/PageHeader";
import Button from "@components/ui/Button";
import Input from "@components/ui/Input";
import Badge from "@components/ui/Badge";
import Avatar from "@components/ui/Avatar";
import Spinner from "@components/ui/Spinner";
import PasswordStrengthMeter from "@components/settings/PasswordStrengthMeter";
import Tooltip from "@components/ui/Tooltip";
import { toast } from "sonner";

/**
 * Profile form validation schema
 */
const profileSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  email: z.string().min(1, "Email is required").email("Valid email required"),
});

/**
 * Password change form validation schema
 */
const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain uppercase letter")
      .regex(/[a-z]/, "Must contain lowercase letter")
      .regex(/[0-9]/, "Must contain a number")
      .regex(/[@$!%*?&]/, "Must contain a special character"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

/**
 * Tab configuration
 */
const TABS = [
  { id: "profile", label: "Profile", icon: faUser },
  { id: "security", label: "Security", icon: faLock },
  { id: "preferences", label: "Preferences", icon: faCircleHalfStroke },
];

/**
 * Theme options for preferences
 */
const THEME_OPTIONS = [
  { value: "light", label: "Light", icon: faSun },
  { value: "dark", label: "Dark", icon: faMoon },
  { value: "system", label: "System", icon: faCircleHalfStroke },
];

/**
 * SettingsPage - User profile, security, and preferences
 *
 * Features:
 * - 2-column layout: profile sidebar + tabbed forms
 * - Profile tab: update name/email with dirty detection
 * - Security tab: change password with strength meter
 * - Preferences tab: theme toggle
 * - Updates Zustand auth store on profile change
 */
function SettingsPage() {
  const queryClient = useQueryClient();
  const { user: authUser, updateUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("profile");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  /**
   * Fetch current user data
   */
  const { data: userData, isLoading } = useQuery({
    queryKey: ["users", "me"],
    queryFn: getMe,
    staleTime: 5 * 60 * 1000,
  });

  const user = userData?.data || authUser;

  /**
   * Profile Form
   */
  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: "", email: "" },
  });

  const {
    formState: profileFormState,
    watch: watchProfile,
    reset: resetProfile,
  } = profileForm;
  const watchedName = watchProfile("name");
  const watchedEmail = watchProfile("email");

  // Initialize form when data loads
  useEffect(() => {
    if (user) {
      resetProfile({ name: user.name || "", email: user.email || "" });
    }
  }, [user, resetProfile]);

  // Check if profile form is dirty
  const isProfileDirty = useMemo(() => {
    return (
      watchedName !== (user?.name || "") || watchedEmail !== (user?.email || "")
    );
  }, [watchedName, watchedEmail, user]);

  /**
   * Profile update mutation
   */
  const profileMutation = useMutation({
    mutationFn: updateMe,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["users", "me"] });
      updateUser({ name: data.data?.name, email: data.data?.email });
      resetProfile({
        name: data.data?.name || "",
        email: data.data?.email || "",
      });
      toast.success("Profile updated successfully");
    },
    onError: (error) => {
      const status = error?.response?.status;
      if (status === 409) {
        profileForm.setError("email", {
          message: "This email is already in use",
        });
      } else {
        toast.error(
          error?.response?.data?.message || "Failed to update profile",
        );
      }
    },
  });

  /**
   * Password Form
   */
  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const {
    formState: passwordFormState,
    watch: watchPassword,
    reset: resetPassword,
  } = passwordForm;
  const watchedNewPassword = watchPassword("newPassword");

  /**
   * Password change mutation
   */
  const passwordMutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      resetPassword();
      toast.success("Password changed successfully");
    },
    onError: (error) => {
      const status = error?.response?.status;
      if (status === 401) {
        passwordForm.setError("currentPassword", {
          message: "Incorrect password",
        });
      } else {
        toast.error(
          error?.response?.data?.message || "Failed to change password",
        );
      }
    },
  });

  /**
   * Handle profile form submit
   */
  const onProfileSubmit = (data) => {
    const payload = {};
    if (data.name !== user?.name) payload.name = data.name;
    if (data.email !== user?.email) payload.email = data.email;
    if (Object.keys(payload).length === 0) {
      toast.info("No changes to save");
      return;
    }
    profileMutation.mutate(payload);
  };

  /**
   * Handle password form submit
   */
  const onPasswordSubmit = (data) => {
    passwordMutation.mutate({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });
  };

  /**
   * Handle theme change
   */
  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    if (newTheme === "system") {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      useUIStore.getState().setTheme(prefersDark ? "dark" : "light");
    } else {
      useUIStore.getState().setTheme(newTheme);
    }
    toast.success(`Theme set to ${newTheme}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-5"
    >
      <PageHeader
        title="Settings"
        subtitle="Manage your account and preferences"
        breadcrumb={[
          { label: "Dashboard", path: "/dashboard" },
          { label: "Settings", active: true },
        ]}
      />

      <div className="flex flex-col lg:flex-row gap-6">
        {/* ========== LEFT SIDEBAR - PROFILE CARD ========== */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:w-[30%] flex-shrink-0"
        >
          <div className="lg:sticky lg:top-24 bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark p-6 text-center">
            {/* Avatar */}
            <div className="mb-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center mx-auto shadow-lg shadow-brand-primary/20">
                <span className="text-2xl font-bold text-white">
                  {user?.name?.charAt(0)?.toUpperCase() || "?"}
                </span>
              </div>
            </div>

            {/* Name */}
            <h2 className="text-lg font-bold text-text-heading-light dark:text-text-heading-dark mb-1">
              {user?.name || "User"}
            </h2>

            {/* Role Badge */}
            <div className="flex justify-center mb-3">
              <Badge variant={user?.role === "ADMIN" ? "purple" : "info"} dot>
                {user?.role === "ADMIN" ? "Administrator" : "Moderator"}
              </Badge>
            </div>

            {/* Email */}
            <div className="flex items-center justify-center gap-2 text-sm text-text-para-light dark:text-text-para-dark mb-3">
              <FontAwesomeIcon icon={faEnvelope} className="w-3.5 h-3.5" />
              <span className="truncate">{user?.email || "N/A"}</span>
            </div>

            {/* Active Status */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <span
                className={`w-2 h-2 rounded-full ${user?.isActive ? "bg-green-500" : "bg-red-500"}`}
              />
              <span className="text-xs text-text-para-light dark:text-text-para-dark">
                {user?.isActive ? "Active" : "Inactive"}
              </span>
            </div>

            {/* Divider */}
            <div className="border-t border-border-light dark:border-border-dark my-4" />

            {/* Last Login */}
            <div className="flex items-center justify-center gap-2 text-xs text-text-para-light dark:text-text-para-dark mb-2">
              <FontAwesomeIcon icon={faClock} className="w-3 h-3" />
              <span>
                Last seen{" "}
                {user?.lastLogin ? formatRelativeTime(user.lastLogin) : "N/A"}
              </span>
            </div>

            {/* Member Since */}
            <div className="flex items-center justify-center gap-2 text-xs text-text-para-light dark:text-text-para-dark">
              <FontAwesomeIcon icon={faCalendar} className="w-3 h-3" />
              <span>
                Member since{" "}
                {user?.createdAt
                  ? formatDate(user.createdAt, "MMM yyyy")
                  : "N/A"}
              </span>
            </div>
          </div>
        </motion.div>

        {/* ========== RIGHT - TABBED FORMS ========== */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex-1 min-w-0"
        >
          <div className="bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark overflow-hidden">
            {/* Tab Navigation */}
            <div className="flex border-b border-border-light dark:border-border-dark">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    relative flex items-center gap-2 px-5 py-3.5 text-sm font-medium whitespace-nowrap transition-all duration-200
                    ${
                      activeTab === tab.id
                        ? "text-brand-primary"
                        : "text-text-para-light dark:text-text-para-dark hover:text-text-heading-light dark:hover:text-text-heading-dark"
                    }
                  `}
                >
                  <FontAwesomeIcon icon={tab.icon} className="w-4 h-4" />
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="settingsTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary rounded-full"
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                      }}
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-6">
              <AnimatePresence mode="wait">
                {/* ========== TAB 1: PROFILE ========== */}
                {activeTab === "profile" && (
                  <motion.form
                    key="profile"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    onSubmit={profileForm.handleSubmit(onProfileSubmit)}
                    className="space-y-5 max-w-lg"
                  >
                    <h3 className="text-base font-semibold text-text-heading-light dark:text-text-heading-dark mb-1">
                      Profile Information
                    </h3>
                    <p className="text-sm text-text-para-light dark:text-text-para-dark mb-4">
                      Update your personal information. Changes will be
                      reflected across the dashboard.
                    </p>

                    <Input
                      label="Full Name"
                      leftIcon={faUser}
                      error={profileFormState.errors.name?.message}
                      disabled={profileMutation.isPending}
                      {...profileForm.register("name")}
                    />

                    <Input
                      label="Email Address"
                      type="email"
                      leftIcon={faEnvelope}
                      error={profileFormState.errors.email?.message}
                      disabled={profileMutation.isPending}
                      {...profileForm.register("email")}
                    />

                    <div className="flex justify-end pt-2">
                      <motion.div
                        animate={isProfileDirty ? { scale: [1, 1.02, 1] } : {}}
                        transition={{ repeat: Infinity, duration: 2 }}
                      >
                        <Button
                          type="submit"
                          variant="primary"
                          loading={profileMutation.isPending}
                          disabled={
                            !isProfileDirty || profileMutation.isPending
                          }
                          leftIcon={faCheck}
                        >
                          Save Changes
                        </Button>
                      </motion.div>
                    </div>
                  </motion.form>
                )}

                {/* ========== TAB 2: SECURITY ========== */}
                {activeTab === "security" && (
                  <motion.form
                    key="security"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
                    className="space-y-5 max-w-lg"
                  >
                    <h3 className="text-base font-semibold text-text-heading-light dark:text-text-heading-dark mb-1">
                      Change Password
                    </h3>
                    <p className="text-sm text-text-para-light dark:text-text-para-dark mb-4">
                      Choose a strong password with at least 8 characters,
                      including uppercase, lowercase, numbers, and special
                      characters.
                    </p>

                    <Input
                      label="Current Password"
                      type={showCurrentPassword ? "text" : "password"}
                      leftIcon={faLock}
                      showPasswordToggle
                      error={passwordFormState.errors.currentPassword?.message}
                      disabled={passwordMutation.isPending}
                      {...passwordForm.register("currentPassword")}
                    />

                    <div>
                      <Input
                        label="New Password"
                        type={showNewPassword ? "text" : "password"}
                        leftIcon={faLock}
                        showPasswordToggle
                        error={passwordFormState.errors.newPassword?.message}
                        disabled={passwordMutation.isPending}
                        {...passwordForm.register("newPassword")}
                      />
                      {watchedNewPassword && (
                        <div className="mt-3">
                          <PasswordStrengthMeter
                            password={watchedNewPassword}
                          />
                        </div>
                      )}
                    </div>

                    <Input
                      label="Confirm New Password"
                      type={showConfirmPassword ? "text" : "password"}
                      leftIcon={faLock}
                      showPasswordToggle
                      error={passwordFormState.errors.confirmPassword?.message}
                      disabled={passwordMutation.isPending}
                      {...passwordForm.register("confirmPassword")}
                    />

                    <div className="flex justify-end pt-2">
                      <Button
                        type="submit"
                        variant="primary"
                        loading={passwordMutation.isPending}
                        disabled={passwordMutation.isPending}
                        leftIcon={faShieldHalved}
                      >
                        Change Password
                      </Button>
                    </div>
                  </motion.form>
                )}

                {/* ========== TAB 3: PREFERENCES ========== */}
                {activeTab === "preferences" && (
                  <motion.div
                    key="preferences"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="space-y-6 max-w-lg"
                  >
                    {/* Theme Toggle */}
                    <div>
                      <h3 className="text-base font-semibold text-text-heading-light dark:text-text-heading-dark mb-1">
                        Theme
                      </h3>
                      <p className="text-sm text-text-para-light dark:text-text-para-dark mb-4">
                        Choose your preferred appearance mode.
                      </p>
                      <div className="flex gap-2">
                        {THEME_OPTIONS.map((option) => (
                          <motion.button
                            key={option.value}
                            type="button"
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => handleThemeChange(option.value)}
                            className={`
                              flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200
                              ${
                                theme === option.value
                                  ? "border-brand-primary bg-brand-softbg dark:bg-brand-primary/10 text-brand-primary"
                                  : "border-border-light dark:border-border-dark text-text-para-light dark:text-text-para-dark hover:border-brand-primary/50"
                              }
                            `}
                          >
                            <FontAwesomeIcon
                              icon={option.icon}
                              className="w-6 h-6"
                            />
                            <span className="text-sm font-medium">
                              {option.label}
                            </span>
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-border-light dark:border-border-dark" />

                    {/* Notification Preferences (Coming Soon) */}
                    <div>
                      <h3 className="text-base font-semibold text-text-heading-light dark:text-text-heading-dark mb-1">
                        Notifications
                      </h3>
                      <p className="text-sm text-text-para-light dark:text-text-para-dark mb-4">
                        Manage your notification preferences.
                      </p>

                      <div className="space-y-3">
                        {[
                          {
                            label: "Email notifications",
                            desc: "Receive appointment updates via email",
                          },
                          {
                            label: "Browser notifications",
                            desc: "Get real-time alerts in your browser",
                          },
                        ].map((item) => (
                          <div
                            key={item.label}
                            className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50"
                          >
                            <div>
                              <p className="text-sm font-medium text-text-heading-light dark:text-text-heading-dark">
                                {item.label}
                              </p>
                              <p className="text-xs text-text-para-light dark:text-text-para-dark">
                                {item.desc}
                              </p>
                            </div>
                            <Tooltip content="Coming soon">
                              <div className="relative w-10 h-5.5 rounded-full bg-gray-300 dark:bg-gray-600 opacity-50 cursor-not-allowed">
                                <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow" />
                              </div>
                            </Tooltip>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default SettingsPage;
