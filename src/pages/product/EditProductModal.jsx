// src/pages/products/EditProductModal.jsx
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosPublic from "../../axios/AxiosPublic";
import toast from "react-hot-toast";

const EditProductModal = ({ product, isOpen, closeModal }) => {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: product,
  });
  const qc = useQueryClient();

  const updateProduct = useMutation({
    mutationFn: async (payload) =>
      axiosPublic.patch(`/products/${product._id}`, payload),
    onSuccess: () => {
      toast.success("Product updated successfully");
      qc.invalidateQueries(["products"]);
      closeModal();
    },
    onError: (e) => {
      toast.error(e?.response?.data?.error || "Failed to update product");
    },
  });

  const onSubmit = (data) => {
    updateProduct.mutate(data);
  };

  if (!isOpen) return null;

  return (
    <div className="z-50 fixed inset-0 flex justify-center items-center bg-black/40">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <h2 className="mb-4 font-semibold text-lg">✏️ Edit Product</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <input
            {...register("name", { required: true })}
            className="input-bordered w-full input"
            placeholder="Product Name"
          />
          <input
            {...register("unit", { required: true })}
            className="input-bordered w-full input"
            placeholder="Unit (kg, pcs, etc)"
          />
          {/* <textarea
            {...register("remarks")}
            className="textarea-bordered w-full textarea"
            placeholder="Remarks"
          /> */}

          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={closeModal}
              className="btn btn-sm btn-ghost"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-sm btn-primary">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductModal;
