import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";
import axiosPublic from "../axios/AxiosPublic";
import { useBook } from "../context/BookContext";

// Fetch all categories
const fetchCategories = async () => {
  const res = await axiosPublic.get("/categories");
  return res.data;
};

// Create new category
const createCategory = async ({ name }) => {
  const res = await axiosPublic.post("/categories", { name });
  return res.data;
};

// Update category
const updateCategory = async ({ id, name }) => {
  const res = await axiosPublic.put(`/categories/${id}`, { name });
  return res.data;
};

// Delete category
const deleteCategory = async (id) => {
  const res = await axiosPublic.delete(`/categories/${id}`);
  return res.data;
};

const CategoryList = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { setBookName } = useBook();

  const [newCategoryName, setNewCategoryName] = useState("");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [editedName, setEditedName] = useState("");

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      toast.success("Category created!");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setNewCategoryName("");
    },
    onError: () => toast.error("Failed to create category"),
  });

  const updateMutation = useMutation({
    mutationFn: updateCategory,
    onSuccess: () => {
      toast.success("Category updated!");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setEditModalOpen(false);
    },
    onError: () => toast.error("Failed to update category"),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      toast.success("Category deleted");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: () => toast.error("Failed to delete category"),
  });

  const handleCreateCategory = () => {
    if (!newCategoryName.trim()) return toast.error("Please enter a name");
    createMutation.mutate({ name: newCategoryName.trim() });
  };

  const openEditModal = (category) => {
    setSelectedCategory(category);
    setEditedName(category.name);
    setEditModalOpen(true);
    document.getElementById("edit_modal").showModal();
  };

  const handleUpdate = () => {
    updateMutation.mutate({ id: selectedCategory._id, name: editedName });
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleCategoryClick = (category) => {
    setBookName(category.name); // still using BookContext
      navigate(`/dashboard/categories/${category.name}`,{
      replace: true,
    });
  };

  return (
    <div onClick={() => handleCategoryClick(book)} className="space-y-4">
      {/* Add Category Input */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="New Category Name"
          className="input-bordered w-full max-w-xs input"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
        />
        <button className="btn btn-primary" onClick={handleCreateCategory}>
          Add Category
        </button>
      </div>

      {/* Category List */}
      <div className="space-y-3">
        {categories.map((cat) => (
          <div
            key={cat._id}
            onClick={() => handleCategoryClick(cat)}
            className="flex justify-between bg-white hover:bg-gray-100 shadow p-4 rounded-lg transition-colors cursor-pointer"
          >
            <div>
              <h3 className="font-bold text-blue-600 hover:underline">
                {cat.name}
              </h3>
              <p className="text-gray-500 text-sm">
                Updated: {new Date(cat.updatedAt).toLocaleString()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => openEditModal(cat)}
                className="btn-outline btn btn-sm btn-info"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(cat._id)}
                className="btn-outline btn btn-sm btn-error"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      <dialog id="edit_modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Edit Category</h3>
          <input
            type="text"
            className="mt-4 input-bordered w-full input"
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
          />
          <div className="modal-action">
            <form method="dialog" className="space-x-2">
              <button className="btn">Cancel</button>
              <button
                className="btn btn-primary"
                type="button"
                onClick={handleUpdate}
              >
                Save
              </button>
            </form>
          </div>
        </div>
      </dialog>
    </div>
  );
};

export default CategoryList;
