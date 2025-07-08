import React from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosPublic from "../axios/AxiosPublic";
import toast from "react-hot-toast";

const MemberModal = ({ data, closeModal }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: data || {
      name: "",
      phone: "",
      email: "",
      subscription: "",
    },
  });

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (formData) => {
      console.log(data?._id, formData);
      if (data?._id) {
        return await axiosPublic.patch(`/members/${data._id}`, formData);
      }
      return await axiosPublic.post("/members", formData);
    },
    onSuccess: () => {
      toast.success(data ? "Member updated" : "Member added");
      queryClient.invalidateQueries(["members"]);
      closeModal();
    },
    onError: () => toast.error("Failed to save"),
  });

const onSubmit = (formData) => {
  const { _id, ...payload } = formData;
  mutation.mutate(payload);
};

  return (
    <div className="z-50 fixed inset-0 flex justify-center items-center bg-black/40 bg-opacity-30">
      <div className="bg-white shadow-lg p-6 rounded w-full max-w-md">
        <h3 className="mb-4 font-bold text-lg">
          {data ? "Edit Member" : "Add New Member"}
        </h3>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input
            {...register("name", { required: true })}
            placeholder="Name"
            className="input-bordered w-full input"
          />
          <input
            {...register("phone")}
            placeholder="Phone"
            className="input-bordered w-full input"
          />
          <input
            {...register("email")}
            placeholder="Email"
            type="email"
            className="input-bordered w-full input"
          />
          <input
            {...register("subscription")}
            placeholder="Subscription Amount"
            defaultValue={250000}
            className="input-bordered w-full input"
          />
          <div className="flex justify-between">
            <button
              type="button"
              onClick={closeModal}
              className="btn-outline btn"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MemberModal;
