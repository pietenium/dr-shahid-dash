/* eslint-disable no-unused-vars */
import { memo } from "react";
import { motion } from "framer-motion";

/**
 * Footer - Minimal bottom bar
 *
 * Design:
 * - Fixed height ~48px
 * - Dark background (#111827) with light text (#CBD5E1)
 * - Version number on right side
 * - Hover color: #6FCF97 on interactive elements
 * - Fade-in on mount with slight delay
 *
 * @returns {JSX.Element} Footer bar
 */
const Footer = memo(function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="shrink-0 bg-footer-bg border-t border-gray-700/30"
      role="contentinfo"
    >
      <div className="flex items-center justify-between h-12 px-4 lg:px-6">
        {/* Copyright */}
        <p className="text-xs text-footer-text">
          &copy; {currentYear}{" "}
          <span className="font-medium">Dr. Md. Sahidur Rahman Khan</span>
          <span className="hidden sm:inline">
            {" "}
            Dashboard. All rights reserved.
          </span>
        </p>

        {/* Version */}
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-pulse" />
          <span className="text-xs text-footer-text/70">v1.0.0</span>
        </div>
      </div>
    </motion.footer>
  );
});

export default Footer;
