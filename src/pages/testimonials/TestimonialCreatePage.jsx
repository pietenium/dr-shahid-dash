/* eslint-disable no-unused-vars */
import { useNavigate } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { createTestimonial } from "@api/testimonial.api";
import PageHeader from "@components/shared/PageHeader";
import TestimonialForm from "@components/testimonials/TestimonialForm";
import { toast } from "sonner";

/**
 * TestimonialCreatePage - Create new testimonial
 */
function TestimonialCreatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createTestimonial,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
      toast.success("Testimonial added successfully!");
      navigate("/testimonials");
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || "Failed to add testimonial",
      );
    },
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-5"
    >
      <PageHeader
        title="Add Testimonial"
        breadcrumb={[
          { label: "Dashboard", path: "/dashboard" },
          { label: "Testimonials", path: "/testimonials" },
          { label: "Create", active: true },
        ]}
      />
      <TestimonialForm
        onSubmit={(fd) => mutation.mutate(fd)}
        isSubmitting={mutation.isPending}
        mode="create"
      />
    </motion.div>
  );
}

export default TestimonialCreatePage;
