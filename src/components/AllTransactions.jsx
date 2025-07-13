import { useQuery } from "@tanstack/react-query";
import { useContext, useState } from "react";
import { FaPlus, FaMinus, FaEquals } from "react-icons/fa";
import TransactionFormModal from "./TransactionFormModal";
import CategoryList from "./CategoryList";
import axiosPublic from "../axios/AxiosPublic";
import { Link, Outlet, useLocation, useParams } from "react-router";
import SummaryCard from "./SummaryCard";
import TransactionListTable from "./TransactionListTable";
import { useAuth } from "../context/AuthContext";

const AllTransactions = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const { login, isAuthenticated } = useAuth();
  // const [activeTab, setActiveTab] = useState("transactions"); // 👈 Use state, not URL
const location = useLocation();
const isCategoriesTab = location.pathname.startsWith("/dashboard/categories");
// const isCategorySelected = location.pathname.split("/").length > 3;
const isTransactionsTab = location.pathname === "/dashboard";

  const {
    data: entries = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["all-entries"],
    queryFn: async () => {
      const res = await axiosPublic.get("/entries");
      return res.data?.entries || [];
    },
  });
  const { data: members = [] } = useQuery({
  queryKey: ["members"],
  queryFn: async () => {
    const res = await axiosPublic.get("/members");
    return res.data.members || [];
  },
});

const totalInstallmentCashIn = members.reduce(
  (sum, m) => sum + (m.installmentTotal || 0),
  0
);
  const cashOut = entries
    .filter((e) => e.type === "cash-out")
    .reduce((sum, e) => sum + e.amount, 0);
  const netBalance =  totalInstallmentCashIn-cashOut;

  return (
    <div className={`space-y-4 mx-auto  py-10 ${isAuthenticated&& "w-full p-4"} w-11/12 min-h-screen `}>
      {/* Summary} Cards */}
      <SummaryCard />

     
          {/* Show Transaction List & Button */}
          <div className="flex justify-between items-center my-10 mb-2">
            <h2 className="my-5 font-semibold text-2xl md:text-3xl text-center">💼 All Transactions</h2>
            {isAuthenticated&&
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setModalOpen(true)}
            >
              ➕ Add Transaction
            </button>
}
          </div>

          {isLoading && <p>Loading...</p>}
          {isError && <p className="text-red-500">Failed to load data.</p>}
          {!isLoading && entries.length === 0 && (
            <p className="text-gray-500 text-center">No transactions found.</p>
          )}
          {entries.length > 0 && (
            <TransactionListTable entries={entries} refetch={refetch} />
          )}
       

      

      {/* Transaction Modal */}
      {modalOpen && (
        <TransactionFormModal
          isModal={true}
          type="cash-out"
          closeModal={() => setModalOpen(false)}
          onSuccess={() => {
            refetch();
            setModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default AllTransactions;
