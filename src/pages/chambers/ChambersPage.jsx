/* eslint-disable no-unused-vars */
import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faHospital } from "@fortawesome/free-solid-svg-icons";
import {
  getChambers,
  createChamber,
  updateChamber,
  deleteChamber,
} from "@api/chamber.api";
import PageHeader from "@components/shared/PageHeader";
import Button from "@components/ui/Button";
import ConfirmDialog from "@components/ui/ConfirmDialog";
import EmptyState from "@components/ui/EmptyState";
import ChamberCard from "@components/chambers/ChamberCard";
import ChamberModal from "@components/chambers/ChamberModal";
import { toast } from "sonner";

/**
 * Skeleton array for loading state
 */
const SKELETONS = [1, 2, 3];

/**
 * ChambersPage - Manage consultation chambers
 */
function ChambersPage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingChamber, setEditingChamber] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  /**
   * Fetch chambers
   */
  const { data, isLoading } = useQuery({
    queryKey: ["chambers"],
    queryFn: getChambers,
    staleTime: 5 * 60 * 1000,
  });

  const chambers = useMemo(() => data?.data || [], [data]);

  /**
   * Create mutation
   */
  const createMutation = useMutation({
    mutationFn: createChamber,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chambers"] });
      toast.success("Chamber created successfully! 🏥");
      closeModal();
    },
    onError: (error) => {
      const msg = error?.response?.data?.message || "Failed to create chamber";
      toast.error(msg);
    },
  });

  /**
   * Update mutation
   */
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateChamber(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chambers"] });
      toast.success("Chamber updated successfully! ✏️");
      closeModal();
    },
    onError: (error) => {
      const msg = error?.response?.data?.message || "Failed to update chamber";
      toast.error(msg);
    },
  });

  /**
   * Delete mutation
   */
  const deleteMutation = useMutation({
    mutationFn: deleteChamber,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chambers"] });
      toast.success("Chamber deleted successfully");
      setDeleteTarget(null);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to delete chamber");
      setDeleteTarget(null);
    },
  });

  /**
   * Open modal for create
   */
  const handleAdd = useCallback(() => {
    setEditingChamber(null);
    setModalOpen(true);
  }, []);

  /**
   * Open modal for edit
   */
  const handleEdit = useCallback((chamber) => {
    setEditingChamber(chamber);
    setModalOpen(true);
  }, []);

  /**
   * Close modal and reset
   */
  const closeModal = useCallback(() => {
    setModalOpen(false);
    setEditingChamber(null);
  }, []);

  /**
   * Handle form submit (create or update)
   */
  const handleSubmit = useCallback(
    (formData) => {
      if (editingChamber) {
        updateMutation.mutate({ id: editingChamber._id, data: formData });
      } else {
        createMutation.mutate(formData);
      }
    },
    [editingChamber, createMutation, updateMutation],
  );

  /**
   * Handle delete confirmation
   */
  const handleDeleteConfirm = useCallback(() => {
    if (deleteTarget) {
      deleteMutation.mutate(deleteTarget._id);
    }
  }, [deleteTarget, deleteMutation]);

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <PageHeader
        title="Chambers Management"
        subtitle="Manage consultation chambers and schedules"
        breadcrumb={[
          { label: "Dashboard", path: "/dashboard" },
          { label: "Chambers", active: true },
        ]}
        actions={
          <Button variant="primary" leftIcon={faPlus} onClick={handleAdd}>
            Add Chamber
          </Button>
        }
      />

      {/* Chambers Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SKELETONS.map((i) => (
            <div key={i} className="skeleton h-[480px] rounded-2xl" />
          ))}
        </div>
      ) : chambers.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <EmptyState
            title="No chambers added yet"
            description="Add consultation chambers to manage schedules and locations"
            icon={faHospital}
            action={
              <Button variant="primary" onClick={handleAdd} leftIcon={faPlus}>
                Add Your First Chamber
              </Button>
            }
          />
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {chambers.map((chamber, index) => (
            <ChamberCard
              key={chamber._id}
              chamber={chamber}
              index={index}
              onEdit={handleEdit}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <ChamberModal
        isOpen={modalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        defaultValues={editingChamber}
        mode={editingChamber ? "edit" : "create"}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Chamber"
        message={`Are you sure you want to delete "${deleteTarget?.chemberName}"? This will not delete existing appointments linked to this chamber.`}
        confirmText="Delete Chamber"
        variant="danger"
        loading={deleteMutation.isPending}
      />
    </motion.div>
  );
}

export default ChambersPage;
