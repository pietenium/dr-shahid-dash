/* eslint-disable no-unused-vars */
import { useNavigate } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { createResearch } from "@api/research.api";
import PageHeader from "@components/shared/PageHeader";
import ResearchForm from "@components/research/ResearchForm";
import { toast } from "sonner";

/**
 * ResearchCreatePage - Create new research paper
 * Uses ResearchForm shared component with create mode
 */
function ResearchCreatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createResearch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["research"] });
      toast.success("Research paper created successfully!");
      navigate("/research");
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || "Failed to create research paper",
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
        title="Add Research Paper"
        breadcrumb={[
          { label: "Dashboard", path: "/dashboard" },
          { label: "Research", path: "/research" },
          { label: "Create", active: true },
        ]}
      />
      <ResearchForm
        onSubmit={(fd) => mutation.mutate(fd)}
        isSubmitting={mutation.isPending}
        mode="create"
      />
    </motion.div>
  );
}

export default ResearchCreatePage;
