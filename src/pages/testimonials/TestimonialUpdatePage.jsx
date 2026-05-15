/* eslint-disable no-unused-vars */
import { useParams, useNavigate } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { getTestimonialById, updateTestimonial } from "@api/testimonial.api";
import PageHeader from "@components/shared/PageHeader";
import TestimonialForm from "@components/testimonials/TestimonialForm";
import Spinner from "@components/ui/Spinner";
import { toast } from "sonner";

/**
 * TestimonialUpdatePage - Edit existing testimonial
 * Fetches by ID, pre-fills form, submits update mutation
 */
function TestimonialUpdatePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["testimonial", id],
    queryFn: () => getTestimonialById(id),
  });

  const mutation = useMutation({
    mutationFn: (formData) => updateTestimonial(id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
      toast.success("Testimonial updated successfully!");
      navigate("/testimonials");
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || "Failed to update testimonial",
      );
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!data?.data) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-semibold mb-2">Testimonial Not Found</h2>
        <button
          onClick={() => navigate("/testimonials")}
          className="text-brand-primary hover:underline"
        >
          Back to Testimonials
        </button>
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
        title="Update Testimonial"
        subtitle={data.data.name}
        breadcrumb={[
          { label: "Dashboard", path: "/dashboard" },
          { label: "Testimonials", path: "/testimonials" },
          { label: "Edit", active: true },
        ]}
      />
      <TestimonialForm
        defaultValues={data.data}
        onSubmit={(fd) => mutation.mutate(fd)}
        isSubmitting={mutation.isPending}
        mode="edit"
      />
    </motion.div>
  );
}

export default TestimonialUpdatePage;
