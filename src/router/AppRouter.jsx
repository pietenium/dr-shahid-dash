import { Routes, Route, Navigate } from "react-router";
import ProtectedRoute from "./ProtectedRoute";
import GuestRoute from "./GuestRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";

// Auth Pages
import LoginPage from "@pages/auth/LoginPage";
import ForgotPasswordPage from "@pages/auth/ForgotPasswordPage";
import VerifyOtpPage from "@pages/auth/VerifyOtpPage";
import MagicLoginPage from "@pages/auth/MagicLoginPage";
import ResetPasswordPage from "@pages/auth/ResetPasswordPage";

// Main Pages
import DashboardPage from "@pages/dashboard/DashboardPage";
import AppointmentsPage from "@pages/appointments/AppointmentsPage";
import AppointmentChartsPage from "@pages/appointments/AppointmentChartsPage";
import ArticlesPage from "@pages/articles/ArticlesPage";
import ArticleCategoriesPage from "@pages/articles/ArticleCategoriesPage";
import ArticleCreatePage from "@pages/articles/ArticleCreatePage";
import ArticleDetailPage from "@pages/articles/ArticleDetailPage";
import ArticleUpdatePage from "@pages/articles/ArticleUpdatePage";
import ResearchPage from "@pages/research/ResearchPage";
import ResearchCreatePage from "@pages/research/ResearchCreatePage";
import ResearchDetailPage from "@pages/research/ResearchDetailPage";
import ResearchUpdatePage from "@pages/research/ResearchUpdatePage";
import TestimonialsPage from "@pages/testimonials/TestimonialsPage";
import TestimonialCreatePage from "@pages/testimonials/TestimonialCreatePage";
import TestimonialUpdatePage from "@pages/testimonials/TestimonialUpdatePage";
import UsersPage from "@pages/users/UsersPage";
import ActivityLogsPage from "@pages/activity-logs/ActivityLogsPage";
import AppInfoPage from "@pages/app-info/AppInfoPage";
import ContactPage from "@pages/contact/ContactPage";
import SettingsPage from "@pages/settings/SettingsPage";

/**
 * Application router with protected and guest routes
 * Implements route guards for authentication and role-based access
 */

function AppRouter() {
  return (
    <Routes>
      {/* Guest Routes */}
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/verify-otp" element={<VerifyOtpPage />} />
        <Route path="/magic-login" element={<MagicLoginPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Route>

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/appointments" element={<AppointmentsPage />} />
          <Route
            path="/appointments/charts"
            element={<AppointmentChartsPage />}
          />

          <Route path="/articles" element={<ArticlesPage />} />
          <Route
            path="/articles/categories"
            element={<ArticleCategoriesPage />}
          />
          <Route path="/articles/create" element={<ArticleCreatePage />} />
          <Route path="/articles/:slug" element={<ArticleDetailPage />} />
          <Route path="/articles/:slug/edit" element={<ArticleUpdatePage />} />

          <Route path="/research" element={<ResearchPage />} />
          <Route path="/research/create" element={<ResearchCreatePage />} />
          <Route path="/research/:id" element={<ResearchDetailPage />} />
          <Route path="/research/:id/edit" element={<ResearchUpdatePage />} />

          <Route path="/testimonials" element={<TestimonialsPage />} />
          <Route
            path="/testimonials/create"
            element={<TestimonialCreatePage />}
          />
          <Route
            path="/testimonials/:id/edit"
            element={<TestimonialUpdatePage />}
          />
          <Route path="/app-info" element={<AppInfoPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/activity-logs" element={<ActivityLogsPage />} />
          <Route path="/settings" element={<SettingsPage />} />

          <Route path="/contact" element={<ContactPage />} />
        </Route>
      </Route>

      {/* Default redirect */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default AppRouter;
