/* eslint-disable no-unused-vars */
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Dropdown menu component
 * @param {Object} props
 * @param {React.ReactNode} props.trigger - Trigger element
 * @param {Array<{label: string, onClick: Function, icon?: IconProp, danger?: boolean}>} props.items - Menu items
 * @param {'left'|'right'} [props.align='right'] - Menu alignment
 */
function Dropdown({ trigger, items, align = "right" }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -5 }}
            transition={{ duration: 0.15 }}
            className={`
              absolute top-full mt-1 z-50
              ${align === "right" ? "right-0" : "left-0"}
              min-w-[160px] py-1 rounded-lg
              bg-card-light dark:bg-card-dark
              border border-border-light dark:border-border-dark
              shadow-lg
            `.trim()}
          >
            {items.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  item.onClick();
                  setIsOpen(false);
                }}
                className={`
                  w-full flex items-center gap-2 px-4 py-2 text-sm
                  transition-colors duration-150
                  ${
                    item.danger
                      ? "text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      : "text-text-heading-light dark:text-text-heading-dark hover:bg-gray-100 dark:hover:bg-gray-700"
                  }
                `.trim()}
              >
                {item.icon && <item.icon className="w-4 h-4" />}
                {item.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Dropdown;
