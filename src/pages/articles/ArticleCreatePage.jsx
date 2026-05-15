/* eslint-disable no-unused-vars */
import { useNavigate } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { createArticle } from "@api/article.api";
import PageHeader from "@components/shared/PageHeader";
import ArticleForm from "@components/articles/ArticleForm";
import { toast } from "sonner";

/**
 * ArticleCreatePage - Create new article
 * Uses ArticleForm shared component
 * Submits multipart FormData via React Query mutation
 */
function ArticleCreatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createArticle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      toast.success("Article created successfully!");
      navigate("/articles");
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to create article");
    },
  });

  const handleSubmit = (formData) => {
    mutation.mutate(formData);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-5"
    >
      <PageHeader
        title="Create Article"
        breadcrumb={[
          { label: "Dashboard", path: "/dashboard" },
          { label: "Articles", path: "/articles" },
          { label: "Create", active: true },
        ]}
      />
      <ArticleForm
        onSubmit={handleSubmit}
        isSubmitting={mutation.isPending}
        mode="create"
      />
    </motion.div>
  );
}

export default ArticleCreatePage;
