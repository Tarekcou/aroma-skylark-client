import { useQuery } from "@tanstack/react-query";
import { FaSearch, FaPlus, FaMinus, FaEquals } from "react-icons/fa";
import axiosPublic from "../axios/AxiosPublic";
import { Link, Outlet, useLocation, useParams } from "react-router";

import TransactionListTable from "./TransactionListTable";


const BookDetails = () => {
  const { id,bookName } = useParams();
  const location = useLocation();
const fetchBookDetails = async (bookName) => {
  const res = await axiosPublic.get(`/${bookName}/entries`);
  return res.data || { entries: [] };
};
  const {
    refetch: refetchBook,
    data: book,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["bookName", bookName],

    queryFn: () => fetchBookDetails(bookName),
  });

  if (isLoading) return <p className="text-center">Loading...</p>;
  if (isError )
    return <p className="text-red-500 text-center">Failed to load book.</p>;

 
const entries = Array.isArray(book?.entries) ? book.entries : [];

  const cashIn = entries
    .filter((e) => e.type === "cash-in")
    .reduce((sum, e) => sum + e.amount, 0);
  const cashOut = entries
    .filter((e) => e.type === "cash-out")
    .reduce((sum, e) => sum + e.amount, 0);
  const netBalance = cashIn - cashOut;

  const activeTab = location.pathname.includes("/cashin")
    ? "cashin"
    : location.pathname.includes("/cashout")
    ? "cashout"
    : location.pathname.includes("/transactions")
    ? "transactions"
    : null;

 const showEmptyState = entries.length === 0 && activeTab === "transactions";
  return (
    <div className="space-y-4 p-4">
      {/* Summary Cards */}
      <div className="gap-4 grid grid-cols-1 md:grid-cols-3 mt-2">
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

      <div className="bg-gray-50 mb-4 py-2 border-gray-200 border-b">
        <div role="tablist" className="flex space-x-4 font-medium text-sm">
          <Link
            to="transactions"
            role="tab"
            className={`px-4 py-2 rounded-t-md transition-colors duration-200 ${
              activeTab === "transactions"
                ? "bg-white border-b-2 border-blue-500 text-blue-600"
                : "text-gray-600 hover:text-blue-500"
            }`}
          >
            📋 Transactions
          </Link>
          {/* <Link
            to="cashin"
            role="tab"
            className={`px-4 py-2 rounded-t-md transition-colors duration-200 ${
              activeTab === "cashin"
                ? "bg-white border-b-2 border-green-500 text-green-600"
                : "text-gray-600 hover:text-green-500"
            }`}
          >
            ➕ Cash In
          </Link> */}
          <Link
            to="cashout"
            role="tab"
            className={`px-4 py-2 rounded-t-md transition-colors duration-200 ${
              activeTab === "cashout"
                ? "bg-white border-b-2 border-red-500 text-red-600"
                : "text-gray-600 hover:text-red-500"
            }`}
          >
            ➖ Cash Out
          </Link>
        </div>
      </div>

      {/* Outlet route content */}
      <Outlet context={{ refetchBook }} />

      {/* Show table if on transactions tab */}
      {activeTab === "transactions" &&
        (showEmptyState ? (
          <p className="mt-10 text-gray-500 text-center">
            No transactions found for this book.
          </p>
        ) : (
          <TransactionListTable entries={entries} />
        ))}
    </div>
  );
};

export default BookDetails;
