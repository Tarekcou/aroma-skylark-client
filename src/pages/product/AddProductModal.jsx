// src/pages/products/AddProductModal.jsx
import React, { useState } from "react";
import axiosPublic from "../../axios/AxiosPublic";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";

const AddProductModal = ({ isOpen, closeModal }) => {
  const [formData, setFormData] = useState({
    name: "",
    unit: "bag",
    remarks: "",
  });
  const qc = useQueryClient();
  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosPublic.post("/products", formData);
      toast.success("Product added");
      qc.invalidateQueries({ queryKey: ["products"] });
      closeModal();
      setFormData({ name: "", unit: "bag", remarks: "" });
    } catch (e) {
      toast.error(e?.response?.data?.error || "Failed to add product");
    }
  };

  return (
    <div className="z-50 fixed inset-0 flex justify-center items-center bg-black/50">
      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-white shadow p-6 rounded-lg w-full max-w-md"
      >
        <h2 className="font-semibold text-xl">➕ Add Product</h2>
        <label className="form-control">
          <span className="label-text">Product Name</span>
          <input
            className="input-bordered input"
            value={formData.name}
            onChange={(e) =>
              setFormData((f) => ({ ...f, name: e.target.value }))
            }
            required
          />
        </label>
        <label className="flex flex-col mt-2 form-control">
          <span className="label-text">Unit</span>
          <input
            className="input-bordered input"
            value={formData.unit}
            onChange={(e) =>
              setFormData((f) => ({ ...f, unit: e.target.value }))
            }
            placeholder="e.g., bag, kg, piece"
            required
          />
        </label>
        {/* <label className="flex flex-col form-control">
          <span className="label-text">Remarks</span>
          <input
            className="input-bordered input"
            value={formData.remarks}
            onChange={(e) =>
              setFormData((f) => ({ ...f, remarks: e.target.value }))
            }
          />
        </label> */}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            className="btn-outline btn btn-sm"
            onClick={closeModal}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary btn-sm">
            Add Product
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProductModal;
