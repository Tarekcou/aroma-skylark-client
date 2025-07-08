import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router";
import toast from "react-hot-toast";
import axiosPublic from "../axios/AxiosPublic";

const TransactionFormModal = ({
  isModal,
  type = "cash-out",
  closeModal,
  onSuccess,
  entry,
}) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [newCategory, setNewCategory] = useState("");
  const [newField, setNewField] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: {
      type: entry?.type || type,
      bookId: id || "",
      date: entry?.date || new Date().toISOString().slice(0, 10),
      time: entry?.time || "",
      amount: entry?.amount || "",
      remarks: entry?.remarks || "",
      contact: entry?.contact || "",
      category: entry?.category || "",
      mode: entry?.mode || "",
      extraField: entry?.extraField || "",
    },
  });

  // ✅ FETCH CATEGORIES
  const { data: categories = [], refetch: refetchCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => (await axiosPublic.get(`/categories`)).data,
  });

  // ✅ FETCH FIELDS
  const { data: fields = [], refetch: refetchFields } = useQuery({
    queryKey: ["fields"],
    queryFn: async () => (await axiosPublic.get(`/fields`)).data,
  });

  // ✅ SUBMIT FORM (Create or Update)
  const mutation = useMutation({
    mutationFn: async (data) => {
      if (entry?._id) {
        return (await axiosPublic.patch(`/entries/${entry._id}`, data)).data;
      }
      return (await axiosPublic.post("/entries", data)).data;
    },
    onSuccess: () => {
      toast.success("Transaction saved");
      queryClient.invalidateQueries();
      if (onSuccess) onSuccess();
      if (closeModal) closeModal();
      reset();
    },
    onError: () => toast.error("Failed to save transaction"),
  });

  const onSubmit = (data) => mutation.mutate(data);

  const addCategory = async () => {
    if (!newCategory.trim()) return;
    await axiosPublic.post(`/categories`, { name: newCategory });
    toast.success("Category added");
    setNewCategory("");
    refetchCategories();
  };

  const addField = async () => {
    if (!newField.trim()) return;
    await axiosPublic.post(`/fields`, { name: newField });
    toast.success("Field added");
    setNewField("");
    refetchFields();
  };

  return (
    <div
      className={
        isModal
          ? "fixed inset-0 z-50 bg-black/50 flex justify-center items-center"
          : "p-4 max-w-md mx-auto"
      }
    >
      <div
        className={
          isModal
            ? "bg-white p-6 rounded-lg w-full max-w-md"
            : "bg-white shadow p-4 rounded"
        }
      >
        <h2 className="mb-4 font-bold text-xl">
          {entry ? "✏️ Edit Transaction" : "➕ Add Transaction"}
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input
            type="date"
            className="input-bordered w-full input"
            {...register("date", { required: true })}
          />
          <input
            type="time"
            className="input-bordered w-full input"
            {...register("time", { required: true })}
          />
          <input
            type="number"
            step="0.01"
            className="input-bordered w-full input"
            {...register("amount", { required: true })}
            placeholder="Amount"
          />
          <input
            type="text"
            className="input-bordered w-full input"
            {...register("remarks")}
            placeholder="Description"
          />
          <input
            type="text"
            className="input-bordered w-full input"
            {...register("contact")}
            placeholder="Contact Name"
          />

          {/* ✅ Category Select */}
          <div>
            <select
              className="w-full select-bordered select"
              {...register("category")}
            >
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c._id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>

            <div className="flex gap-2 mt-2">
              <input
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="New category"
                className="input-bordered w-full input input-sm"
              />
              <button
                type="button"
                onClick={addCategory}
                className="btn-outline btn btn-sm"
              >
                +
              </button>
            </div>
          </div>

          {/* ✅ Mode Select */}
          <select
            className="w-full select-bordered select"
            {...register("mode")}
          >
            <option value="">Select Payment Mode</option>
            <option value="Cash">Cash</option>
            <option value="Bank">Bank</option>
            <option value="Bkash">Bkash</option>
            <option value="Nagad">Nagad</option>
          </select>

          {/* ✅ Extra Field Select */}
          <div>
            <select
              className="w-full select-bordered select"
              {...register("extraField")}
            >
              <option value="">Select Extra Field</option>
              {fields.map((f) => (
                <option key={f._id} value={f.name}>
                  {f.name}
                </option>
              ))}
            </select>
            <div className="flex gap-2 mt-2">
              <input
                value={newField}
                onChange={(e) => setNewField(e.target.value)}
                placeholder="New field"
                className="input-bordered w-full input input-sm"
              />
              <button
                type="button"
                onClick={addField}
                className="btn-outline btn btn-sm"
              >
                +
              </button>
            </div>
          </div>

          {/* ✅ Buttons */}
          <div className="flex justify-end gap-3">
            {isModal && (
              <button
                type="button"
                onClick={closeModal}
                className="btn-outline btn"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionFormModal;
