// src/pages/products/ProductList.jsx
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router";
import axiosPublic from "../../axios/AxiosPublic";
import { MdAdd, MdDelete, MdDetails } from "react-icons/md";
import AddProductModal from "./AddProductModal";
import { useState } from "react";
import Swal from "sweetalert2";
import toast from "react-hot-toast";

const ProductList = () => {
  const [addOpen, setAddOpen] = useState(false);
  const navigate=useNavigate()
               const qc = useQueryClient();
        

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await axiosPublic.get("/products");
      return res.data || [];
    },
    networkMode: "always",
  });
  const deleteProduct = useMutation({
    mutationFn: async (id) => axiosPublic.delete(`/products/${id}`),
    onSuccess: () => {
      toast.success("Product deleted successfully");
      qc.invalidateQueries(["products"]); // refresh product list
    },
    onError: (e) => {
      toast.error(e?.response?.data?.error || "Failed to delete product");
    },
  });

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete this entry?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      await deleteProduct.mutateAsync(id);
    } catch (error) {
      console.log(error?.response?.data?.error || "Failed to delete product");
    }
  };



  if (isLoading) return <p>Loading...</p>;

  return (
    <div className="relative bg-white shadow p-4 rounded-lg h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-xl">📦 Product Stock List</h2>
        <button
          onClick={() => setAddOpen(true)}
          className="hidden md:flex btn btn-primary btn-sm"
        >
          <MdAdd /> Add Product
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="table table-zebra w-full">
          <thead className="">
            <tr className="bg-base-200 border-gray-200 border-b text-sm text-center">
              <th>#</th>
              <th>Product</th>
              <th>Total In</th>
              <th>Total Out</th>
              <th>Stock</th>
              <th>Remarks</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p, i) => (
              <tr
                className="hover:bg-base-200 border-gray-200 border-b text-center cursor-pointer"
                onClick={() => navigate(`/dashboard/products/${p._id}`)}
                key={p._id}
              >
                <td>{i + 1}</td>
                <td>
                  {p.name} ({p.unit})
                </td>
                <td className="text-green-600">{p.totalIn || 0}</td>
                <td className="text-red-600">{p.totalOut || 0}</td>
                <td className="font-semibold">
                  {p.stock ?? (p.totalIn || 0) - (p.totalOut || 0)}
                </td>
                <td>{p.remarks || "-"}</td>
                <td className="flex flex-col gap-3">
                  <Link
                    to={`/dashboard/products/${p._id}`}
                    className="max-w-36 text-xs btn-accent btn btn-xs"
                  >
                     Details
                  </Link>
                  <button
                    onClick={(e)=>{
                      e.stopPropagation(); // prevent parent click

                      handleDelete(p._id);
                    }}
                    className="max-w-36 text-white btn-error btn btn-xs"
                  >
                    <MdDelete className="text-xl"/>
                  </button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={7} className="py-6 text-gray-500 text-center">
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {addOpen && (
        <AddProductModal
          isOpen={addOpen}
          closeModal={() => setAddOpen(false)}
        />
      )}
      <button
        onClick={() => setAddOpen(true)}
        className="md:hidden bottom-6 left-1/2 fixed -translate-x-1/2 btn btn-primary btn-sm"
      >
        <MdAdd /> Add Product
      </button>
    </div>
  );
};

export default ProductList;
