/* eslint-disable no-unused-vars */
import { memo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMap, faExpand, faTimes } from "@fortawesome/free-solid-svg-icons";

/**
 * ChamberMapPreview - Google Maps embed with expandable fullscreen
 *
 * @param {Object} props
 * @param {string} props.mapUrl - Google Maps embed URL
 * @param {string} props.chamberName - Chamber name for alt text
 * @param {'sm'|'lg'} [props.size='sm'] - Preview size
 */
const ChamberMapPreview = memo(function ChamberMapPreview({
  mapUrl,
  chamberName,
  size = "sm",
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const isValidUrl = mapUrl && mapUrl.includes("google.com/maps");

  if (!isValidUrl) {
    return (
      <div className="flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-xl p-6 text-center">
        <FontAwesomeIcon icon={faMap} className="w-8 h-8 text-gray-400 mb-2" />
        <p className="text-xs text-text-para-light dark:text-text-para-dark">
          Map not available
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Small Preview */}
      <div
        className="relative group cursor-pointer"
        onClick={() => setIsExpanded(true)}
      >
        <div
          className={`rounded-xl overflow-hidden ${size === "sm" ? "h-48" : "h-64"}`}
        >
          <iframe
            src={mapUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title={`Map of ${chamberName}`}
            sandbox="allow-scripts allow-same-origin allow-popups"
          />
        </div>
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-xl flex items-center justify-center">
          <FontAwesomeIcon
            icon={faExpand}
            className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg"
          />
        </div>
      </div>

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            onClick={() => setIsExpanded(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative w-full max-w-4xl h-[80vh] rounded-2xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <iframe
                src={mapUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                title={`Map of ${chamberName}`}
              />
              <button
                onClick={() => setIsExpanded(false)}
                className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors backdrop-blur-sm"
                aria-label="Close map"
              >
                <FontAwesomeIcon icon={faTimes} className="w-4 h-4" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});

export default ChamberMapPreview;
