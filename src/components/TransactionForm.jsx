import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosPublic from "../axios/AxiosPublic";
import toast from "react-hot-toast";
import { useState } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router";

const TransactionForm = ({ type }) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { id,bookName } = useParams(); // book id from URL
    const { refetchBook } = useOutletContext();


  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: {
      type,
      bookId: id,
    },
  });

  const [newCategory, setNewCategory] = useState("");
  const [newField, setNewField] = useState("");

 const { refetch: refetchCategories, data: categories = [] } = useQuery({
   queryKey: ["categories", bookName],
   queryFn: async () => (await axiosPublic.get(`${bookName}/categories`)).data,
 });

 const { refetch: refetchFields, data: fields = [] } = useQuery({
   queryKey: ["fields", bookName],
   queryFn: async () => (await axiosPublic.get(`${bookName}/fields`)).data,
 });

  const entryMutation = useMutation({
    mutationFn: async (data) => (await axiosPublic.post(`/${bookName}/entries`, data)).data,
    onSuccess: () => {
      toast.success("Entry added!");
      reset();
      refetch(); // Refetch categories to update the list
      refetchBook(); // ✅ This updates the summary card!

      queryClient.invalidateQueries({ queryKey: ["entries"] });
      // Go back to book details page after save
      // navigate(`/books/${id}`, { replace: true });
    },
    onError: () => toast.error("Something went wrong!"),
  });

  const addCategory = async () => {
    if (!newCategory.trim()) return;
    await axiosPublic.post(`${bookName}/categories`, { name: newCategory });
    toast.success("Category added");
    setNewCategory("");
  refetchCategories();
    queryClient.invalidateQueries({ queryKey: ["categories"] });
  };

  const addField = async () => {
    if (!newField.trim()) return;
    await axiosPublic.post(`${bookName}/fields`, { name: newField });
    toast.success("Field added");
    setNewField("");
    refetchFields(); // not refetch()
    queryClient.invalidateQueries({ queryKey: ["fields"] });
  };

  const onSubmit = (data) => {
    // Ensure type and bookId are always sent
    entryMutation.mutate({ ...data, type, bookId: id });
  };

  return (
    <div className="bg-white shadow mx-auto p-4 rounded max-w-md">
      <h2 className="mb-4 font-semibold text-xl">
        Add {type === "cash-in" ? "Cash In" : "Cash Out"} Entry
      </h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input
          type="date"
          {...register("date", { required: true })}
          className="input-bordered w-full input"
        />
        <input
          type="time"
          {...register("time", { required: true })}
          className="input-bordered w-full input"
        />
        <input
          type="number"
          step="0.01"
          placeholder="Amount *"
          {...register("amount", { required: true })}
          className="input-bordered w-full input"
        />
        <input
          type="text"
          placeholder="Contact Name"
          {...register("contact")}
          className="input-bordered w-full input"
        />
        <input
          type="text"
          placeholder="Remarks"
          {...register("remarks")}
          className="input-bordered w-full input"
        />

        {/* Category */}
        <div>
          <select
            {...register("category")}
            className="w-full select-bordered select"
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
          <div className="flex gap-2 mt-2">
            <input
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Add new category"
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

        {/* Mode */}
        <select {...register("mode")} className="w-full select-bordered select">
          <option value="">Select Mode</option>
          <option>Cash</option>
          <option>Bank</option>
          <option>Bkash</option>
          <option>Nagad</option>
        </select>

        {/* Extra Field */}
        <div>
          <select
            {...register("extraField")}
            className="w-full select-bordered select"
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
              placeholder="Add new field"
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

        <div className="flex justify-between">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate(`/dashboard/books/${id}`)}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
};

export default TransactionForm;
