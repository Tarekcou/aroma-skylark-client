import React, { useMemo, useState } from "react";
import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import axiosPublic from "../axios/AxiosPublic";
import TransactionFormModal from "./TransactionFormModal";
import AllTransactionList from "./AllTransactionList";

const CategoryTransactions = () => {
  const { categoryName } = useParams();
  const [modalOpen, setModalOpen] = useState(false);

  // Fetch all entries (not just by category)
  const {
    data: allEntries = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["entries"],
    queryFn: async () => {
      const res = await axiosPublic.get("/entries");
      return res.data?.entries || [];
    },
  });

  // Memoized filtered entries by category
  const entries = useMemo(() => {
    return allEntries.filter((e) => e.category === categoryName);
  }, [allEntries, categoryName]);

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="font-bold text-purple-600 text-xl">
          🗂 Transactions for Category: {categoryName}
        </h2>
        <button
          onClick={() => setModalOpen(true)}
          className="btn-outline btn btn-sm btn-primary"
        >
          ➕ Add Transaction
        </button>
      </div>

      {isLoading && <p>Loading...</p>}
      {isError && <p className="text-red-500">Failed to load entries</p>}
      {!isLoading && entries.length === 0 && (
        <p className="text-gray-500">No transactions found.</p>
      )}
      {entries.length > 0 && <AllTransactionList entries={entries} />}

      {modalOpen && (
        <TransactionFormModal
          isModal={true}
          type="cash-out"
          closeModal={() => setModalOpen(false)}
          onSuccess={() => {
            refetch();
            setModalOpen(false);
          }}
          entry={{ category: categoryName }}
        />
      )}
    </div>
  );
};

export default CategoryTransactions;
