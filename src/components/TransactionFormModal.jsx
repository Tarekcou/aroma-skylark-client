import React, { useState, useMemo, useEffect } from "react";
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
  entries: propEntries = [],
}) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [entries, setEntries] = useState(propEntries);
  const [newCategory, setNewCategory] = useState("");
  const [newField, setNewField] = useState("");
  const [customCategories, setCustomCategories] = useState([]);
  const [customFields, setCustomFields] = useState([]);

  const { data: fetchedEntries = [] } = useQuery({
    queryKey: ["entries"],
    queryFn: async () => {
      const res = await axiosPublic.get("/entries");
      return res.data.entries || [];
    },
    enabled: propEntries.length === 0,
  });

  useEffect(() => {
    setEntries(propEntries.length > 0 ? propEntries : fetchedEntries);
  }, [propEntries, fetchedEntries]);

  const allCategories = useMemo(() => {
    const existing = entries.map((e) => e.category).filter(Boolean);
    return [...new Set([...existing, ...customCategories])];
  }, [entries, customCategories]);

  const allFields = useMemo(() => {
    const existing = entries.map((e) => e.extraField).filter(Boolean);
    return [...new Set([...existing, ...customFields])];
  }, [entries, customFields]);

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

  const handleAddCategory = () => {
    const trimmed = newCategory.trim();
    if (trimmed && !allCategories.includes(trimmed)) {
      setCustomCategories((prev) => [...prev, trimmed]);
      setNewCategory("");
    }
  };

  const addField = () => {
    const trimmed = newField.trim();
    if (trimmed && !allFields.includes(trimmed)) {
      setCustomFields((prev) => [...prev, trimmed]);
      setNewField("");
    }
  };

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
      onSuccess?.();
      closeModal?.();
      reset();
    },
    onError: () => toast.error("Failed to save transaction"),
  });

  const onSubmit = (data) => {
    data.amount = parseFloat(data.amount);
    mutation.mutate(data);
  };

  return (
    <div
      className={
        isModal
          ? "fixed inset-0 z-50 bg-black/50 flex justify-center items-center overflow-auto p-4 pt-10"
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

          <div>
            <select
              {...register("category")}
              className="w-full select-bordered select"
            >
              <option value="">Select Category</option>
              {allCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="New category"
                className="input-bordered w-full input input-sm"
              />
              <button
                type="button"
                className="btn-outline btn btn-sm"
                onClick={handleAddCategory}
              >
                +
              </button>
            </div>
          </div>

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

          <div>
            <select
              className="w-full select-bordered select"
              {...register("extraField")}
            >
              <option value="">Select Extra Field</option>
              {allFields.map((f) => (
                <option key={f} value={f}>
                  {f}
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
