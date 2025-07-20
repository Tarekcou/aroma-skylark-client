import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router";
import axiosPublic from "../../axios/AxiosPublic";
import AddProductModal from "./AddProductModal";
import { BiPencil } from "react-icons/bi";
import { FaRemoveFormat } from "react-icons/fa";
import { MdAdd, MdDelete } from "react-icons/md";
import Swal from "sweetalert2";
import { useQueryClient } from "@tanstack/react-query";
import ProductUpdateModal from "./ProductUpdateModal";
import toast from "react-hot-toast";

const ProductList = () => {
  const navigate = useNavigate();
  const [entryModalOpen, setEntryModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
const [addModalOpen, setAddModalOpen] = useState(false);
const queryClient = useQueryClient();

  // ✅ Get the product list
 const {
   refetch,
   data: products = [],
   isLoading: loadingProducts,
 } = useQuery({
   queryKey: ["products"],
   queryFn: async () => {
     const res = await axiosPublic.get("/products");
    console.log("🧪 /products fetched after deletion:", res.data.entries);
     return res.data.entries || [];
   },
   networkMode: "always", // ✅ forces fetch from network every time
 });


const handleDelete = async (productId) => {
  if (!productId) {
    console.error("No product ID provided for deletion");
    return;
  }

  const result = await Swal.fire({
    title: "Are you sure?",
    text: "This action cannot be undone!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Yes, delete it!",
  });

  if (!result.isConfirmed) return;

  try {
    await axiosPublic.delete(`/products/${productId}`);
    toast.success("Product deleted successfully!");
    await refetch(); // This guarantees fresh data now
  } catch (error) {
    console.error("Error deleting product:", error);
    toast.error("Failed to delete product.");
  }
};




  // 🔢 Calculate stock
 const calculateStock = (product) => ({
   totalIn: product.totalIn || 0,
   totalOut: product.totalOut || 0,
   current: (product.totalIn || 0) - (product.totalOut || 0),
 });


  if (loadingProducts ) return <p>Loading...</p>;

  return (
    <div className="relative bg-white shadow p-4 rounded-lg h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-xl">📦 Product Stock List</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setAddModalOpen(true)}
            className="hidden md:flex btn btn-primary btn-sm"
          >
            <MdAdd className="" /> Add Product
          </button>
          <AddProductModal
            isOpen={addModalOpen}
            closeModal={() => setAddModalOpen(false)}
          />

          {/* <button
            className="btn-outline btn btn-sm"
            onClick={() => {
              setEntryModalOpen(true);
              setSelectedProductId(null); // Global modal (no specific product)
            }}
          >
            ➕ Add Entry
          </button> */}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="table table-zebra w-full">
          <thead>
            <tr className="bg-base-200 text-sm">
              <th>#</th>
              <th>Product</th>
              <th>In</th>
              <th>Out</th>
              <th>Stock</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {!Array.isArray(products) && (
              <pre className="bg-yellow-100 p-2 rounded text-red-500 text-xs">
                ⚠️ Invalid `products`: {JSON.stringify(products, null, 2)}
              </pre>
            )}

            {products?.map((product, i) => {
              const { totalIn, totalOut, current } = calculateStock(product);
              return (
                <tr key={product._id}>
                  <td>{i + 1}</td>
                  <td>
                    {product.name} ({product.unit})
                  </td>
                  <td className="text-green-600">{totalIn}</td>
                  <td className="text-red-600">{totalOut}</td>
                  <td className="font-bold">{current}</td>
                  <td>
                    <div className="flex gap-2">
                      {/* <Link
                        to={`/dashboard/products/${product._id}`}
                        className="btn-outline btn btn-xs"
                      >
                        View
                      </Link> */}
                      <button
                        onClick={() => {
                          setEntryModalOpen(true);
                          setSelectedProductId(product._id);
                        }}
                        className="text-base btn btn-primary btn-xs"
                      >
                        <BiPencil />
                      </button>
                      <div
                        onClick={() => handleDelete(product._id)}
                        className="flex items-center text-red-500 text-base btn btn-primary btn-xs"
                      >
                        <MdDelete />
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {products.length === 0 && (
          <p className="flex justify-center items-center min-h-[50vh] text-gray-500 text-center">
            No products found.
          </p>
        )}
        <button
          onClick={() => setAddModalOpen(true)}
          className="md:hidden bottom-6 left-1/2 z-30 absolute -translate-x-1/2 transform btn btn-primary btn-sm"
        >
          <MdAdd /> Add Product
        </button>
      </div>

      {/* ✅ Only one modal, reused */}
      {entryModalOpen && (
        <ProductUpdateModal
          isOpen={entryModalOpen}
          closeModal={() => setEntryModalOpen(false)}
          productId={selectedProductId}
          products={products} // ✅ Pass this to avoid `.map` crash
        />
      )}
    </div>
  );
};

export default ProductList;
