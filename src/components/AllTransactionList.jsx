import React, { useMemo, useState } from "react";
import { FaSearch, FaUndo, FaFilePdf } from "react-icons/fa";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import TransactionFormModal from "./TransactionFormModal";
import axiosPublic from "../axios/AxiosPublic";
import toast from "react-hot-toast";

const ITEMS_PER_PAGE = 10;

const AllTransactionList = ({ entries = [] }) => {
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDate, setSelectedDate] = useState("");
  const [page, setPage] = useState(1);
  const [editEntry, setEditEntry] = useState(null);

  const categories = useMemo(
    () => ["All", ...new Set(entries.map((e) => e.category).filter(Boolean))],
    [entries]
  );

  const filteredEntries = useMemo(
    () =>
      entries.filter((entry) => {
        const matchSearch =
          !searchText ||
          entry.remarks?.toLowerCase().includes(searchText.toLowerCase()) ||
          entry.amount?.toString().includes(searchText);
        const matchCategory =
          selectedCategory === "All" || entry.category === selectedCategory;
        const matchDate =
          !selectedDate ||
          new Date(entry.date).toISOString().slice(0, 10) === selectedDate;
        return matchSearch && matchCategory && matchDate;
      }),
    [entries, searchText, selectedCategory, selectedDate]
  );

  const totalPages = Math.ceil(filteredEntries.length / ITEMS_PER_PAGE);
  const paginatedEntries = filteredEntries.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const handleReset = () => {
    setSearchText("");
    setSelectedCategory("All");
    setSelectedDate("");
    setPage(1);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await axiosPublic.delete(`/entries/${id}`);
      toast.success("Entry deleted");
    } catch (err) {
      toast.error("Failed to delete entry");
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Transaction List", 14, 16);
    autoTable(doc, {
      startY: 20,
      head: [["#", "Date", "Remarks", "Category", "Mode", "Bill", "Amount"]],
      body: filteredEntries.map((e, i) => [
        i + 1,
        new Date(e.date).toLocaleString(),
        e.remarks || "-",
        e.category || "-",
        e.mode || "-",
        e.billNo || "-",
        `${e.type === "cash-in" ? "+" : "-"} ${e.amount}`,
      ]),
    });
    doc.save("transactions.pdf");
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-end">
        <label className="flex flex-col text-sm">
          Date:
          <input
            type="date"
            className="input-bordered input"
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              setPage(1);
            }}
          />
        </label>
        <label className="flex flex-col text-sm">
          Category:
          <select
            className="select-bordered select"
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(1);
            }}
          >
            {categories.map((cat, i) => (
              <option key={i}>{cat}</option>
            ))}
          </select>
        </label>
        <button className="btn btn-sm btn-outline" onClick={handleReset}>
          <FaUndo className="mr-1" /> Reset
        </button>
        <button className="btn btn-sm btn-outline" onClick={exportToPDF}>
          <FaFilePdf className="mr-1" /> Export PDF
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          className="input-bordered input w-full max-w-sm"
          placeholder="Search by remark or amount..."
          value={searchText}
          onChange={(e) => {
            setSearchText(e.target.value);
            setPage(1);
          }}
        />
        <button className="btn btn-square">
          <FaSearch />
        </button>
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-lg overflow-x-auto">
        <table className="table table-zebra w-full">
          <thead>
            <tr className="bg-base-200 text-sm">
              <th>#</th>
              <th>Date</th>
              <th>Remarks</th>
              <th>Category</th>
              <th>Mode</th>
              <th>Bill</th>
              <th>Amount</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedEntries.map((e, i) => (
              <tr key={i}>
                <td>{(page - 1) * ITEMS_PER_PAGE + i + 1}</td>
                <td>{new Date(e.date).toLocaleString()}</td>
                <td>{e.remarks}</td>
                <td>{e.category}</td>
                <td>{e.mode}</td>
                <td>{e.billNo || "-"}</td>
                <td
                  className={
                    e.type === "cash-in" ? "text-green-600" : "text-red-600"
                  }
                >
                  {e.type === "cash-in" ? "+" : "-"} {e.amount}
                </td>
                <td>
                  <div className="flex gap-2">
                    <button
                      className="btn-outline btn-xs btn"
                      onClick={() => setEditEntry(e)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn-error btn-xs btn"
                      onClick={() => handleDelete(e._id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredEntries.length === 0 && (
          <p className="text-center text-gray-500 my-4">
            No entries found.
          </p>
        )}
      </div>

      {editEntry && (
        <TransactionFormModal
          isModal={true}
          entries={entries}
          closeModal={() => setEditEntry(null)}
          entry={editEntry}
          onSuccess={() => {
            setEditEntry(null);
          }}
        />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-4">
          <button
            className="btn btn-sm"
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
          >
            Prev
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            className="btn btn-sm"
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default AllTransactionList;
