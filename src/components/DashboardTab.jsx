import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { FaPlus, FaMinus, FaEquals } from "react-icons/fa";
import TransactionFormModal from "./TransactionFormModal";
import AllTransactionList from "./AllTransactionList";
import CategoryList from "./CategoryList";
import axiosPublic from "../axios/AxiosPublic";
import { Link, Outlet, useLocation, useParams } from "react-router";

const DashboardTab = () => {
  const [modalOpen, setModalOpen] = useState(false);
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

  const cashIn = entries
    .filter((e) => e.type === "cash-in")
    .reduce((sum, e) => sum + e.amount, 0);
  const cashOut = entries
    .filter((e) => e.type === "cash-out")
    .reduce((sum, e) => sum + e.amount, 0);
  const netBalance = cashIn - cashOut;

  return (
    <div className="space-y-4 p-4">
      {/* Summary Cards */}
      <div className="gap-4 grid grid-cols-1 md:grid-cols-3">
        <div className="bg-green-100 shadow p-4 card">
          <p className="text-gray-500 text-sm">Cash In</p>
          <h2 className="font-bold text-green-700 text-2xl">
            <FaPlus /> {cashIn}
          </h2>
        </div>
        <div className="bg-red-100 shadow p-4 card">
          <p className="text-gray-500 text-sm">Cash Out</p>
          <h2 className="font-bold text-red-700 text-2xl">
            <FaMinus /> {cashOut}
          </h2>
        </div>
        <div className="bg-blue-100 shadow p-4 card">
          <p className="text-gray-500 text-sm">Net Balance</p>
          <h2 className="font-bold text-blue-700 text-2xl">
            <FaEquals /> {netBalance}
          </h2>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-gray-50 py-2 border-b">
        <div className="flex space-x-4 font-medium text-sm">
          <Link
            to="/dashboard"
            className={`px-4 py-2 rounded-t-md transition ${
              isTransactionsTab
                ? "bg-white border-b-2 border-blue-500 text-blue-600"
                : "text-gray-600 hover:text-blue-500"
            }`}
          >
            📊 All Transactions
          </Link>

          <Link
            to="/dashboard/categories"
            className={`px-4 py-2 rounded-t-md transition ${
              isCategoriesTab
                ? "bg-white border-b-2 border-purple-500 text-purple-600"
                : "text-gray-600 hover:text-purple-500"
            }`}
          >
            📚 Transaction Categories
          </Link>
        </div>
      </div>

      {/* Tab Content */}
      {/* {activeTab === "transactions" && (
        <>
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-semibold text-xl">💼 All Transactions</h2>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setModalOpen(true)}
            >
              ➕ Add Transaction
            </button>
          </div>

          {isLoading && <p>Loading...</p>}
          {isError && <p className="text-red-500">Failed to load data.</p>}
          {!isLoading && entries.length === 0 && (
            <p className="text-gray-500 text-center">No transactions found.</p>
          )}
          {entries.length > 0 && <AllTransactionList entries={entries} />}
        </>
      )} */}
      {isTransactionsTab && (
        <>
          {/* Show Transaction List & Button */}
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-semibold text-xl">💼 All Transactions</h2>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setModalOpen(true)}
            >
              ➕ Add Transaction
            </button>
          </div>

          {isLoading && <p>Loading...</p>}
          {isError && <p className="text-red-500">Failed to load data.</p>}
          {!isLoading && entries.length === 0 && (
            <p className="text-gray-500 text-center">No transactions found.</p>
          )}
          {entries.length > 0 && <AllTransactionList entries={entries} />}
        </>
      )}

      {isCategoriesTab && (
        <>
          {location.pathname === "/dashboard/categories" ? (
            <CategoryList />
          ) : (
            <Outlet />
          )}
        </>
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

export default DashboardTab;
