/* eslint-disable no-unused-vars */
import { memo, useCallback } from "react";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTrash,
  faBuilding,
  faExpand,
} from "@fortawesome/free-solid-svg-icons";
import ChamberSchedule from "./ChamberSchedule";

/**
 * ChamberCard - Individual chamber display card
 */
const ChamberCard = memo(function ChamberCard({
  chamber,
  index,
  onEdit,
  onDelete,
  onExpandMap,
}) {
  const handleEdit = useCallback(() => onEdit(chamber), [onEdit, chamber]);
  const handleDelete = useCallback(
    () => onDelete(chamber),
    [onDelete, chamber],
  );
  const handleExpand = useCallback(
    () => onExpandMap(chamber),
    [onExpandMap, chamber],
  );

  const isValidMap = chamber.map && chamber.map.includes("google.com/maps");

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4, ease: "easeOut" }}
      whileHover={{ y: -6, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
      className="bg-card-light dark:bg-card-dark rounded-2xl border border-border-light dark:border-border-dark overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 flex flex-col"
    >
      {/* Map Preview */}
      <div
        className="relative group cursor-pointer h-48"
        onClick={handleExpand}
      >
        {isValidMap ? (
          <>
            <iframe
              src={chamber.map}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={`Map of ${chamber.chemberName}`}
              sandbox="allow-scripts allow-same-origin allow-popups"
            />
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <FontAwesomeIcon
                icon={faExpand}
                className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg"
              />
            </div>
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 text-text-para-light dark:text-text-para-dark">
            <span className="text-2xl mb-1">🗺️</span>
            <p className="text-xs">Map not available</p>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1 gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center flex-shrink-0 shadow-md">
            <FontAwesomeIcon icon={faBuilding} className="w-4 h-4 text-white" />
          </div>
          <h3 className="font-bold text-text-heading-light dark:text-text-heading-dark text-base leading-tight">
            {chamber.chemberName}
          </h3>
        </div>

        <div className="flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-text-para-light dark:text-text-para-dark mb-2">
            Consultation Schedule
          </p>
          <ChamberSchedule activeDates={chamber.activeDates} compact />
        </div>

        <div className="flex gap-2 pt-3 border-t border-border-light dark:border-border-dark">
          <button
            onClick={handleEdit}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-brand-softbg dark:bg-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-white dark:hover:bg-brand-primary transition-all duration-300 text-sm font-medium"
          >
            <FontAwesomeIcon icon={faEdit} className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>
          <button
            onClick={handleDelete}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-red-50 dark:bg-red-900/10 text-red-500 hover:bg-red-500 hover:text-white dark:hover:bg-red-500 transition-all duration-300 text-sm font-medium"
          >
            <FontAwesomeIcon icon={faTrash} className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
});

export default ChamberCard;
