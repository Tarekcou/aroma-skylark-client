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
import { BiPencil } from "react-icons/bi";
import { MdAdd } from "react-icons/md";

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
      console.log(res.data.entries)
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
    <div
      className={`space-y-4 relative mx-auto    ${
        isAuthenticated && " "
      } w-full  min-h-screen `}
    >
      {/* Summary} Cards */}
      <SummaryCard />

      {/* Show Transaction List & Button */}
      <div className="flex justify-between items-center my-10 mb-2">
        <h2 className="my-5 font-semibold text-xl md:text-2xl text-center">
          💼 All Transactions
        </h2>
        {isAuthenticated && (
          <button
            className="hidden md:flex btn btn-primary btn-sm"
            onClick={() => setModalOpen(true)}
          >
            <MdAdd className="" /> Add Transaction
          </button>
        )}
      </div>

      {isLoading && <p>Loading...</p>}
      {isError && <p className="text-red-500">Failed to load data.</p>}
      {!isLoading && entries.length === 0 && (
        <p className="flex justify-center items-center min-h-[50vh] text-gray-500 text-center">
          No transactions found.
        </p>
      )}
      {entries.length > 0 && (
        <TransactionListTable entries={entries} refetch={refetch} />
      )}
      <button
        className="md:hidden bottom-2 flex justify-center mx-auto mt-20 text-center btn btn-primary btn-sm"
        onClick={() => setModalOpen(true)}
      >
        <MdAdd className="text-xl" /> Add Transaction
      </button>

      {/* Transaction Modal */}
      {modalOpen && (
        <TransactionFormModal
          isModal={true}
          type="cash-out"
          closeModal={() => setModalOpen(false)}
          refetch={refetch}
          onSuccess={() => {
            setModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default AllTransactions;
