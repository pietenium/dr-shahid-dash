/* eslint-disable no-unused-vars */
import { memo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faUser,
  faUserPlus,
} from "@fortawesome/free-solid-svg-icons";
import Modal from "@components/ui/Modal";
import Input from "@components/ui/Input";
import Button from "@components/ui/Button";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { inviteModerator } from "@api/users.api";

/**
 * Zod validation schema for invite moderator form
 */
const inviteSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  email: z.string().min(1, "Email is required").email("Valid email required"),
});

/**
 * InviteModeratorModal - Modal form to invite a new moderator
 * Sends invitation email with temporary password
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Modal visibility
 * @param {Function} props.onClose - Close handler
 */
const InviteModeratorModal = memo(function InviteModeratorModal({
  isOpen,
  onClose,
}) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(inviteSchema),
    defaultValues: { name: "", email: "" },
  });

  const mutation = useMutation({
    mutationFn: inviteModerator,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success(
        `Moderator invited! Email sent to ${data.data?.email || "user"}`,
      );
      reset();
      onClose();
    },
    onError: (error) => {
      const status = error?.response?.status;
      if (status === 409) {
        toast.error("A user with this email already exists");
      } else {
        toast.error(
          error?.response?.data?.message || "Failed to invite moderator",
        );
      }
    },
  });

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Invite Moderator" size="sm">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <p className="text-sm text-text-para-light dark:text-text-para-dark mb-5">
          Send an invitation email with a temporary password. The moderator can
          change their password after logging in.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="Enter moderator name"
            leftIcon={faUser}
            error={errors.name?.message}
            disabled={mutation.isPending}
            {...register("name")}
          />
          <Input
            label="Email Address"
            type="email"
            placeholder="moderator@example.com"
            leftIcon={faEnvelope}
            error={errors.email?.message}
            disabled={mutation.isPending}
            {...register("email")}
          />

          <div className="flex gap-3 justify-end pt-3">
            <Button
              variant="ghost"
              onClick={onClose}
              disabled={mutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={mutation.isPending}
              disabled={mutation.isPending}
              leftIcon={faUserPlus}
            >
              Invite Moderator
            </Button>
          </div>
        </form>
      </motion.div>
    </Modal>
  );
});

export default InviteModeratorModal;
