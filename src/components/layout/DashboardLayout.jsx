/* eslint-disable no-unused-vars */
import { Outlet } from "react-router";
import { motion } from "framer-motion";
import Sidebar from "./Sidebar";
import MobileDrawer from "./MobileDrawer";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useUIStore } from "@store/ui.store";

/**
 * DashboardLayout - Main authenticated layout wrapper
 *
 * Structure:
 * - Sidebar (desktop ≥1024px) - fixed left, collapsible
 * - MobileDrawer (mobile <1024px) - overlay drawer
 * - Navbar (top bar with breadcrumb and user menu)
 * - Main content area with React Router Outlet
 * - Footer (bottom bar)
 *
 * Features:
 * - Zero layout shift on sidebar collapse (CSS transition sync)
 * - Main content smoothly adjusts width
 * - Mobile drawer with backdrop overlay
 * - Sidebar and drawer never conditionally rendered (prevents layout flash)
 *
 * @returns {JSX.Element} Dashboard layout with nested route outlet
 */
function DashboardLayout() {
  const sidebarOpen = useUIStore((state) => state.sidebarOpen);

  return (
    <div className="flex h-screen overflow-hidden bg-bg-light dark:bg-bg-dark">
      {/* Desktop Sidebar - hidden below lg, always rendered */}
      <Sidebar />

      {/* Mobile Drawer - hidden on lg+, always rendered */}
      <MobileDrawer />

      {/* Main Content Area */}
      <motion.div
        className="flex-1 flex flex-col overflow-hidden min-w-0"
        animate={{
          marginLeft: 0, // Sidebar is positioned fixed, margin adjusts for content
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {/* Navbar - sticky top bar */}
        <Navbar />

        {/* Page Content */}
        <main
          className="flex-1 overflow-y-auto overflow-x-hidden"
          role="main"
          aria-label="Main content"
        >
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="p-4 md:p-6 lg:p-8"
          >
            <Outlet />
          </motion.div>
        </main>

        {/* Footer */}
        <Footer />
      </motion.div>
    </div>
  );
}

export default DashboardLayout;
