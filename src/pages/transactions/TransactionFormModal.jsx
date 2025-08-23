import React, { useState, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router";
import toast from "react-hot-toast";
import axiosPublic from "../../axios/AxiosPublic";

const TransactionFormModal = ({
  isModal,
  type = "cash-out",
  closeModal,
  onSuccess,
  entry,
  refetch,
  entries: propEntries = [],
}) => {
  const { id } = useParams();
  const queryClient = useQueryClient();

  const [entries, setEntries] = useState(propEntries);
  const [newCategory, setNewCategory] = useState("");
  const [newType, setNewType] = useState("");
  const [newDivision, setNewDivision] = useState("");
  const [customCategories, setCustomCategories] = useState([]);
  const [customTypes, setCustomTypes] = useState([]);
  const [customDivisions, setCustomDivisions] = useState([]);

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

  const allTypes = useMemo(() => {
    const existing = entries.map((e) => e.type).filter(Boolean);
    return [...new Set([...existing, ...customTypes])];
  }, [entries, customTypes]);

  const allDivisions = useMemo(() => {
    const existing = entries.map((e) => e.division).filter(Boolean);
    return [...new Set([...existing, ...customDivisions])];
  }, [entries, customDivisions]);

  const handleAddCategory = () => {
    const trimmed = newCategory.trim();
    if (trimmed && !allCategories.includes(trimmed)) {
      setCustomCategories((prev) => [...prev, trimmed]);
      setNewCategory("");
    }
  };

  const handleAddType = () => {
    const trimmed = newType.trim();
    if (trimmed && !allTypes.includes(trimmed)) {
      setCustomTypes((prev) => [...prev, trimmed]);
      setNewType("");
    }
  };

  const handleAddDivision = () => {
    const trimmed = newDivision.trim();
    if (trimmed && !allDivisions.includes(trimmed)) {
      setCustomDivisions((prev) => [...prev, trimmed]);
      setNewDivision("");
    }
  };
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: {
      date:
        entry?.date ||
        new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Dhaka" }),
      time:
        entry?.time ||
        new Date().toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
          timeZone: "Asia/Dhaka",
        }),
      amount: entry?.amount || "",
      remarks: entry?.remarks || "",
      category: entry?.category || "",
      mode: entry?.mode || "",
      type: entry?.type || type,
      division: entry?.division || "",
      balance: entry?.balance || 0,
      details: entry?.details || "",
    },
  });

  // 🔹 Mutation for save
  // Save mutation
  const onSubmit = async (data) => {
    try {
      const amount = parseFloat(data.amount || 0);

      // ✅ Prepare payload (no balance saved)
      const payload = {
        ...data,
        amount,
      };

      console.log("Payload to save:", payload);

      // ✅ Direct Axios request (no react-query for now)
      let response;
      if (entry?._id) {
        response = await axiosPublic.patch(`/entries/${entry._id}`, payload);
      } else {
        response = await axiosPublic.post("/entries", payload);
      }
      refetch();
      // ✅ Update local state
      console.log("Saved successfully:", response.data);
      toast.success("Transaction saved!");
      // ✅ Reset form & close modal
      reset?.();
      closeModal?.();
      onSuccess?.();
    } catch (err) {
      console.error("Error saving transaction:", err);
      toast.error("Failed to save transaction");
    }
  };
  // extra states
  const [editingCategory, setEditingCategory] = useState(false);
  const [editingType, setEditingType] = useState(false);
  const [editingDivision, setEditingDivision] = useState(false);

  const [editCategoryValue, setEditCategoryValue] = useState(
    entry?.category || ""
  );
  const [editTypeValue, setEditTypeValue] = useState(entry?.type || "");
  const [editDivisionValue, setEditDivisionValue] = useState(
    entry?.division || ""
  );

  // 🔹 handle updates
  const handleUpdateField = async (field, value) => {
    try {
      if (!entry?._id) return;
      await axiosPublic.patch(`/entries/${entry._id}`, { [field]: value });
      toast.success(`${field} updated`);
      refetch?.();
      if (field === "category") setEditingCategory(false);
      if (field === "type") setEditingType(false);
      if (field === "division") setEditingDivision(false);
    } catch (err) {
      toast.error(`Failed to update ${field}`);
      console.error(err);
    }
  };

  return (
    <div
      className={
        isModal
          ? "fixed inset-0 z-50 bg-black/70 flex justify-center items-center overflow-auto p-4 pt-10"
          : "p-4 max-w-md mx-auto"
      }
    >
      <div
        className={
          isModal
            ? "bg-white p-6 rounded-lg w-full max-w-lg"
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

          {/* Category */}
          {/* Category */}
          <div>
            {!editingCategory ? (
              <>
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
                    onClick={handleAddCategory}
                    className="btn-outline btn btn-sm"
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingCategory(true)}
                    className="btn-outline btn btn-sm"
                  >
                    ✏️
                  </button>
                </div>
              </>
            ) : (
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  value={editCategoryValue}
                  onChange={(e) => setEditCategoryValue(e.target.value)}
                  className="input-bordered w-full input input-sm"
                />
                <button
                  type="button"
                  className="btn btn-success btn-sm"
                  onClick={() =>
                    handleUpdateField("category", editCategoryValue)
                  }
                >
                  Save
                </button>
                <button
                  type="button"
                  className="btn-outline btn btn-sm"
                  onClick={() => setEditingCategory(false)}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Type */}
          {/* Type */}
          <div>
            {!editingType ? (
              <>
                <select
                  {...register("type")}
                  className="w-full select-bordered select"
                >
                  <option value="">Select Type</option>
                  {allTypes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    placeholder="New Type"
                    className="input-bordered w-full input input-sm"
                  />
                  <button
                    type="button"
                    onClick={handleAddType}
                    className="btn-outline btn btn-sm"
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingType(true)}
                    className="btn-outline btn btn-sm"
                  >
                    ✏️
                  </button>
                </div>
              </>
            ) : (
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  value={editTypeValue}
                  onChange={(e) => setEditTypeValue(e.target.value)}
                  className="input-bordered w-full input input-sm"
                />
                <button
                  type="button"
                  className="btn btn-success btn-sm"
                  onClick={() => handleUpdateField("type", editTypeValue)}
                >
                  Save
                </button>
                <button
                  type="button"
                  className="btn-outline btn btn-sm"
                  onClick={() => setEditingType(false)}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Division */}
          {/* Division */}
          <div>
            {!editingDivision ? (
              <>
                <select
                  {...register("division")}
                  className="w-full select-bordered select"
                >
                  <option value="">Select Division</option>
                  {allDivisions.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    value={newDivision}
                    onChange={(e) => setNewDivision(e.target.value)}
                    placeholder="New Division"
                    className="input-bordered w-full input input-sm"
                  />
                  <button
                    type="button"
                    onClick={handleAddDivision}
                    className="btn-outline btn btn-sm"
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingDivision(true)}
                    className="btn-outline btn btn-sm"
                  >
                    ✏️
                  </button>
                </div>
              </>
            ) : (
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  value={editDivisionValue}
                  onChange={(e) => setEditDivisionValue(e.target.value)}
                  className="input-bordered w-full input input-sm"
                />
                <button
                  type="button"
                  className="btn btn-success btn-sm"
                  onClick={() =>
                    handleUpdateField("division", editDivisionValue)
                  }
                >
                  Save
                </button>
                <button
                  type="button"
                  className="btn-outline btn btn-sm"
                  onClick={() => setEditingDivision(false)}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          <input
            type="text"
            className="input-bordered w-full input"
            {...register("details")}
            placeholder="Add Details"
          />

          {/* Mode */}
          <select
            {...register("mode")}
            className="w-full select-bordered select"
          >
            <option value="">Select Payment Mode</option>
            <option value="Cash">Cash</option>
            <option value="Bank">Bank</option>
            <option value="Bkash">Bkash</option>
            <option value="Nagad">Nagad</option>
          </select>

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
