/* eslint-disable no-unused-vars */
import { useParams, useNavigate } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { getArticleBySlug, updateArticle } from "@api/article.api";
import PageHeader from "@components/shared/PageHeader";
import ArticleForm from "@components/articles/ArticleForm";
import Spinner from "@components/ui/Spinner";
import { toast } from "sonner";

/**
 * ArticleUpdatePage - Edit existing article
 * Fetches article by slug, pre-fills form, submits update mutation
 */
function ArticleUpdatePage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  /**
   * Fetch article data for pre-filling form
   */
  const { data: articleData, isLoading } = useQuery({
    queryKey: ["article", "edit", slug],
    queryFn: async () => {
      const listRes = await getArticleBySlug(slug);
      return listRes.data;
    },
  });

  const mutation = useMutation({
    mutationFn: (formData) => updateArticle(articleData?._id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      toast.success("Article updated successfully!");
      navigate("/articles");
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to update article");
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!articleData) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-semibold mb-2">Article Not Found</h2>
        <button
          onClick={() => navigate("/articles")}
          className="text-brand-primary hover:underline"
        >
          Back to Articles
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
        title="Update Article"
        subtitle={articleData.title}
        breadcrumb={[
          { label: "Dashboard", path: "/dashboard" },
          { label: "Articles", path: "/articles" },
          { label: "Edit", active: true },
        ]}
      />
      <ArticleForm
        defaultValues={articleData}
        onSubmit={(formData) => mutation.mutate(formData)}
        isSubmitting={mutation.isPending}
        mode="edit"
      />
    </motion.div>
  );
}

export default ArticleUpdatePage;
