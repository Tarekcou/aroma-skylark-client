// src/pages/products/AddProductModal.jsx
import React, { useState } from "react";
import axiosPublic from "../../axios/AxiosPublic";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";

const AddProductModal = ({ isOpen, closeModal }) => {
  const [formData, setFormData] = useState({ name: "", unit: "bag" });
  const queryClient = useQueryClient();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.unit) {
      toast.error("All fields required");
      return;
    }

    try {
      const unitToPost =
        formData.unit === "custom" ? formData.customUnit : formData.unit;
      await axiosPublic.post("/products", {
        ...formData,
        unit: unitToPost,
      });

      // await axiosPublic.post("/products", formData);
      toast.success("Product added!");
      closeModal();
      setFormData({ name: "", unit: "bag" }); // Reset
      queryClient.invalidateQueries(["products"]); // Refresh list
    } catch (err) {
      toast.error("Failed to add product");
    }
  };

  return (
    <div className="z-50 fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-white shadow p-6 rounded-lg w-full max-w-md"
      >
        <h2 className="font-semibold text-xl">➕ Add Product</h2>

        <label className="form-control">
          <span className="label-text">Product Name</span>
          <input
            type="text"
            className="input-bordered input"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </label>

        <label className="form-control">
          <span className="label-text">Unit</span>
          <select
            className="select-bordered select"
            value={formData.unit}
            onChange={(e) => {
              const selected = e.target.value;
              setFormData({
                ...formData,
                unit: selected,
                customUnit: selected === "custom" ? "" : undefined, // handle custom separately
              });
            }}
          >
            <option value="">Select</option>
            <option value="bag">Bag</option>
            <option value="kg">Kg</option>
            <option value="piece">Piece</option>
            <option value="cft">CFT</option>
            <option value="m3">Cubic Meter (m³)</option>
            <option value="rft">Running Feet (RFT)</option>
            <option value="set">Set</option>
            <option value="custom">➕ Add Custom</option>
          </select>
        </label>

        {formData.unit === "custom" && (
          <label className="form-control">
            <span className="label-text">Custom Unit</span>
            <input
              type="text"
              className="input-bordered input"
              value={formData.customUnit || ""}
              onChange={(e) =>
                setFormData({ ...formData, customUnit: e.target.value })
              }
              placeholder="Enter custom unit (e.g., drum, roll)"
              required
            />
          </label>
        )}

        <div className="flex justify-end gap-2 pt-2">
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
