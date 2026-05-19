/* eslint-disable no-unused-vars */
import { memo, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faTrash,
  faMap,
  faBuilding,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
import { chamberSchema, DAYS_OF_WEEK } from "@schemas/chamber.schema";
import Modal from "@components/ui/Modal";
import Input from "@components/ui/Input";
import Button from "@components/ui/Button";
import { toast } from "sonner";

/**
 * ChamberModal - Add/Edit chamber form in a modal
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Modal visibility
 * @param {Function} props.onClose - Close handler
 * @param {Function} props.onSubmit - Submit handler receives form data
 * @param {boolean} props.isSubmitting - Loading state
 * @param {Object} [props.defaultValues] - Pre-filled values for edit mode
 * @param {'create'|'edit'} [props.mode='create'] - Form mode
 */
const ChamberModal = memo(function ChamberModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  defaultValues,
  mode = "create",
}) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(chamberSchema),
    defaultValues: defaultValues || {
      chemberName: "",
      map: "",
      activeDates: [{ activeDay: "SATURDAY", startTime: "", endTime: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "activeDates",
  });

  const activeDates = watch("activeDates");

  // Reset form when modal opens with new values
  useEffect(() => {
    if (isOpen) {
      reset(
        defaultValues || {
          chemberName: "",
          map: "",
          activeDates: [{ activeDay: "SATURDAY", startTime: "", endTime: "" }],
        },
      );
    }
  }, [isOpen, defaultValues, reset]);

  /**
   * Get available days (not already selected)
   */
  const getAvailableDays = (currentIndex) => {
    const selectedDays = activeDates
      ?.map((d, i) => (i !== currentIndex ? d.activeDay : null))
      .filter(Boolean);
    return DAYS_OF_WEEK.filter((day) => !selectedDays.includes(day));
  };

  /**
   * Add new empty day row
   */
  const handleAddDay = () => {
    if (fields.length >= 7) {
      toast.warning("Maximum 7 days (all days of the week)");
      return;
    }
    append({ activeDay: "SATURDAY", startTime: "", endTime: "" });
  };

  const onFormSubmit = (data) => {
    onSubmit(data);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === "create" ? "🏥 Add New Chamber" : "✏️ Edit Chamber"}
      size="lg"
    >
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-5">
        {/* Chamber Name */}
        <Input
          label="Chamber Name"
          placeholder="e.g. Dhaka City Center, Uttara Clinic"
          leftIcon={faBuilding}
          error={errors.chemberName?.message}
          disabled={isSubmitting}
          {...register("chemberName")}
        />

        {/* Map URL */}
        <Input
          label="Google Maps Embed URL"
          placeholder="https://www.google.com/maps/embed?pb=..."
          leftIcon={faMap}
          error={errors.map?.message}
          disabled={isSubmitting}
          {...register("map")}
        />

        {/* Active Days & Times */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-text-heading-light dark:text-text-heading-dark flex items-center gap-2">
              <FontAwesomeIcon
                icon={faClock}
                className="w-4 h-4 text-brand-primary"
              />
              Active Days & Times
            </label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddDay}
              disabled={isSubmitting || fields.length >= 7}
              leftIcon={faPlus}
            >
              Add Day
            </Button>
          </div>

          {errors.activeDates?.message && (
            <p className="text-xs text-red-500 mb-2">
              {errors.activeDates.message}
            </p>
          )}
          {errors.activeDates?.root?.message && (
            <p className="text-xs text-red-500 mb-2">
              {errors.activeDates.root.message}
            </p>
          )}

          <div className="space-y-3">
            <AnimatePresence>
              {fields.map((field, index) => (
                <motion.div
                  key={field.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-end gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl"
                >
                  {/* Day Select */}
                  <div className="flex-1">
                    <label className="block text-[10px] font-medium text-text-para-light mb-1 uppercase">
                      Day
                    </label>
                    <select
                      {...register(`activeDates.${index}.activeDay`)}
                      disabled={isSubmitting}
                      className="w-full px-2.5 py-2 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-[#0f172a] text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary disabled:opacity-50"
                    >
                      {getAvailableDays(index).map((day) => (
                        <option key={day} value={day}>
                          {day.charAt(0) + day.slice(1).toLowerCase()}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Start Time */}
                  <div className="w-28">
                    <label className="block text-[10px] font-medium text-text-para-light mb-1 uppercase">
                      Start
                    </label>
                    <input
                      type="text"
                      placeholder="09:00 AM"
                      {...register(`activeDates.${index}.startTime`)}
                      disabled={isSubmitting}
                      className="w-full px-2.5 py-2 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-[#0f172a] text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary disabled:opacity-50 font-mono"
                    />
                    {errors.activeDates?.[index]?.startTime && (
                      <p className="text-[10px] text-red-500 mt-0.5">
                        {errors.activeDates[index].startTime.message}
                      </p>
                    )}
                  </div>

                  {/* End Time */}
                  <div className="w-28">
                    <label className="block text-[10px] font-medium text-text-para-light mb-1 uppercase">
                      End
                    </label>
                    <input
                      type="text"
                      placeholder="05:00 PM"
                      {...register(`activeDates.${index}.endTime`)}
                      disabled={isSubmitting}
                      className="w-full px-2.5 py-2 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-[#0f172a] text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary disabled:opacity-50 font-mono"
                    />
                    {errors.activeDates?.[index]?.endTime && (
                      <p className="text-[10px] text-red-500 mt-0.5">
                        {errors.activeDates[index].endTime.message}
                      </p>
                    )}
                  </div>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    disabled={isSubmitting || fields.length <= 1}
                    className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors mb-0.5"
                    title="Remove day"
                  >
                    <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-3 justify-end pt-3 border-t border-border-light dark:border-border-dark">
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            {mode === "create" ? "Create Chamber" : "Update Chamber"}
          </Button>
        </div>
      </form>
    </Modal>
  );
});

export default ChamberModal;
