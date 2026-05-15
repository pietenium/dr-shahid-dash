/* eslint-disable no-unused-vars */
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@api/article.api";
import PageHeader from "@components/shared/PageHeader";
import Button from "@components/ui/Button";
import Modal from "@components/ui/Modal";
import Input from "@components/ui/Input";
import DataTable from "@components/shared/DataTable";
import ConfirmDialog from "@components/ui/ConfirmDialog";
import { toast } from "sonner";

/**
 * ArticleCategoriesPage - Manage article categories
 */
function ArticleCategoriesPage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });
  const categories = data?.data || [];

  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category created");
      closeModal();
    },
    onError: () => toast.error("Failed to create category"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category updated");
      closeModal();
    },
    onError: () => toast.error("Failed to update category"),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category deleted");
      setDeleteTarget(null);
    },
    onError: (error) => {
      toast.error(
        error?.response?.status === 409
          ? "Category is in use"
          : "Failed to delete",
      );
      setDeleteTarget(null);
    },
  });

  const openCreateModal = () => {
    setEditingCategory(null);
    setName("");
    setDescription("");
    setModalOpen(true);
  };
  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description || "");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingCategory(null);
    setName("");
    setDescription("");
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (editingCategory)
      updateMutation.mutate({
        id: editingCategory._id,
        data: { name: name.trim(), description: description.trim() },
      });
    else
      createMutation.mutate({
        name: name.trim(),
        description: description.trim(),
      });
  };

  const generateSlug = () =>
    name
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

  const columns = [
    {
      key: "name",
      label: "Name",
      render: (row) => <span className="font-medium text-sm">{row.name}</span>,
    },
    {
      key: "slug",
      label: "Slug",
      render: (row) => (
        <span className="text-sm text-text-para-light font-mono">
          {row.slug}
        </span>
      ),
    },
    {
      key: "description",
      label: "Description",
      render: (row) => (
        <span className="text-sm text-text-para-light">
          {row.description || "—"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      className: "text-right",
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => openEditModal(row)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-blue-600"
            title="Edit"
          >
            <FontAwesomeIcon icon={faEdit} className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeleteTarget(row)}
            className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"
            title="Delete"
          >
            <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-5"
    >
      <PageHeader
        title="Categories"
        breadcrumb={[
          { label: "Dashboard", path: "/dashboard" },
          { label: "Articles", path: "/articles" },
          { label: "Categories", active: true },
        ]}
        actions={
          <Button variant="primary" leftIcon={faPlus} onClick={openCreateModal}>
            Add Category
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={categories}
        loading={isLoading}
        emptyText="No categories yet"
        emptyDescription="Create your first category"
        emptyAction={
          <Button variant="primary" onClick={openCreateModal}>
            Add Category
          </Button>
        }
      />

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editingCategory ? "Edit Category" : "Create Category"}
        size="sm"
      >
        <div className="space-y-4">
          <Input
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Category name"
          />
          {name && (
            <div className="text-xs text-text-para-light">
              Slug:{" "}
              <span className="font-mono text-brand-primary">
                {generateSlug()}
              </span>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              rows={3}
              className="w-full rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-[#0f172a] px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="ghost" onClick={closeModal}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              loading={createMutation.isPending || updateMutation.isPending}
              disabled={!name.trim()}
            >
              {editingCategory ? "Update" : "Create"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMutation.mutate(deleteTarget._id)}
        title="Delete Category"
        message={`Delete "${deleteTarget?.name}"? This will fail if articles exist in this category.`}
        confirmText="Delete"
        variant="danger"
        loading={deleteMutation.isPending}
      />
    </motion.div>
  );
}

export default ArticleCategoriesPage;
