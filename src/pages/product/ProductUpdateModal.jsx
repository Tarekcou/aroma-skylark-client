import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import axiosPublic from "../../axios/AxiosPublic";

const ProductUpdateModal = ({
  productId,
  isOpen,
  closeModal,
  products = [],
}) => {
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    productId: productId || "",
    type: "in",
    quantity: "",
    remarks: "",
    date: new Date().toISOString().slice(0, 10),
  });

  useEffect(() => {
    if (productId) {
      setFormData((prev) => ({ ...prev, productId }));
    }
  }, [productId]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        resetForm();
        closeModal();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  const mutation = useMutation({
    mutationFn: async ({ productId, type, quantity }) => {
      if (!productId) throw new Error("Product ID is required");
      const qty = Number(quantity);
      if (isNaN(qty) || qty <= 0) throw new Error("Invalid quantity");

      // Assuming backend endpoint handles the logic:
      const res = await axiosPublic.put(`/products/${productId}`, {
        type,
        quantity: qty,
      });

      return res.data;
    },
    onSuccess: () => {
      toast.success("Stock updated");
      queryClient.invalidateQueries(["products"]);
      resetForm();
      closeModal();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Update failed");
    },
  });


  const resetForm = () => {
    setFormData({
      productId: productId || "",
      type: "in",
      quantity: "",
      remarks: "",
      date: new Date().toISOString().slice(0, 10),
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({
      productId: formData.productId,
      type: formData.type,
      quantity: formData.quantity,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="z-50 fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col space-y-4 bg-white shadow p-6 rounded-lg w-full max-w-md"
      >
        <h2 className="font-semibold text-xl">➕ Add Product Entry</h2>

        {!productId && (
          <div className="flex items-center gap-4">
            <label className="w-24 font-medium text-right">Product</label>
            <select
              className="flex-1 select-bordered select"
              value={formData.productId}
              onChange={(e) =>
                setFormData({ ...formData, productId: e.target.value })
              }
              required
            >
              <option value="">Select</option>
              {products.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} ({p.unit})
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex items-center gap-4">
          <label className="w-24 font-medium text-right">Type</label>
          <select
            className="flex-1 select-bordered select"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          >
            <option value="in">Stock In</option>
            <option value="out">Stock Out</option>
          </select>
        </div>

        <div className="flex items-center gap-4">
          <label className="w-24 font-medium text-right">Quantity</label>
          <input
            type="number"
            className="flex-1 input-bordered input"
            value={formData.quantity}
            onChange={(e) =>
              setFormData({ ...formData, quantity: e.target.value })
            }
            required
            min={1}
          />
        </div>

        <div className="flex items-center gap-4">
          <label className="w-24 font-medium text-right">Remarks</label>
          <input
            type="text"
            className="flex-1 input-bordered input"
            value={formData.remarks}
            onChange={(e) =>
              setFormData({ ...formData, remarks: e.target.value })
            }
          />
        </div>

        <div className="flex items-center gap-4">
          <label className="w-24 font-medium text-right">Date</label>
          <input
            type="date"
            className="flex-1 input-bordered input"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          />
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            type="button"
            onClick={() => {
              resetForm();
              closeModal();
            }}
            className="btn-outline btn btn-sm"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="btn btn-primary btn-sm"
            disabled={mutation.isLoading}
          >
            {mutation.isLoading ? "Updating..." : "Add Entry"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductUpdateModal;
