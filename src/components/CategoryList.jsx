import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { useBook } from "../context/BookContext";
import axiosPublic from "../axios/AxiosPublic";

const CategoryList = () => {
  const { setBookName } = useBook();
  const navigate = useNavigate();
  const [newCategory, setNewCategory] = useState("");

  const {isLoading, data: entries = [] } = useQuery({
    queryKey: ["entries"],
    queryFn: async () => {
      const res = await axiosPublic.get("/entries");
      return res.data?.entries || [];
    },
  });

  const categories = useMemo(() => {
    const set = new Set(entries.map((e) => e.category).filter(Boolean));
    return [...set];
  }, [entries]);

  const handleCategoryClick = (name) => {
    setBookName(name);
    navigate(`/dashboard/categories/${name}`, { replace: true });
  };

  const handleCreateCategory = () => {
    if (!newCategory.trim()) return;
    handleCategoryClick(newCategory.trim());
  };
  if( isLoading) return <p className="text-center">Loading categories...</p>;

  return (
    <div className="space-y-4">
      {/* Add Category */}
      {/* <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="New Category Name"
          className="input-bordered w-full max-w-xs input"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
        />
        <button className="btn btn-primary" onClick={handleCreateCategory}>
          Add Category
        </button>
      </div> */}

      {/* Category List */}
      <div className="space-y-3">
        <h1 className="font-bold text-2xl">Different Category List</h1>
        {categories.map((cat, idx) => (
          <div
            key={idx}
            onClick={() => handleCategoryClick(cat)}
            className="flex justify-between bg-white hover:bg-gray-100 shadow p-4 rounded-lg transition-colors cursor-pointer"
          >
            <h3 className="font-bold text-blue-600 hover:underline">{cat}</h3>
          </div>
        ))}
        {categories.length == 0 && (
          <p className="flex justify-center items-center min-h-[50vh] text-gray-500 text-center">
            No Category transactions found.
          </p>
        )}
       
      </div>
    </div>
  );
};

export default CategoryList;
