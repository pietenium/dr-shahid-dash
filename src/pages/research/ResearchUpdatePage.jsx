/* eslint-disable no-unused-vars */
import { useParams, useNavigate } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { getResearchById, updateResearch } from "@api/research.api";
import PageHeader from "@components/shared/PageHeader";
import ResearchForm from "@components/research/ResearchForm";
import Spinner from "@components/ui/Spinner";
import { toast } from "sonner";

/**
 * ResearchUpdatePage - Edit existing research paper
 * Fetches paper by ID, pre-fills form, submits update mutation
 */
function ResearchUpdatePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: paperData, isLoading } = useQuery({
    queryKey: ["research", "edit", id],
    queryFn: () => getResearchById(id),
  });

  const mutation = useMutation({
    mutationFn: (formData) => updateResearch(id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["research"] });
      toast.success("Research paper updated successfully!");
      navigate("/research");
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || "Failed to update research paper",
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

  if (!paperData?.data) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-semibold mb-2">Research Paper Not Found</h2>
        <button
          onClick={() => navigate("/research")}
          className="text-brand-primary hover:underline"
        >
          Back to Research
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
        title="Update Research Paper"
        subtitle={paperData.data.title}
        breadcrumb={[
          { label: "Dashboard", path: "/dashboard" },
          { label: "Research", path: "/research" },
          { label: "Edit", active: true },
        ]}
      />
      <ResearchForm
        defaultValues={paperData.data}
        onSubmit={(fd) => mutation.mutate(fd)}
        isSubmitting={mutation.isPending}
        mode="edit"
      />
    </motion.div>
  );
}

export default ResearchUpdatePage;
