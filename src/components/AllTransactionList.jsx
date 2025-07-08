import React, { useMemo, useState } from "react";
import { FaSearch, FaUndo, FaFilePdf } from "react-icons/fa";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import TransactionFormModal from "./TransactionFormModal";
import axiosPublic from "../axios/AxiosPublic";
import toast from "react-hot-toast";

const ITEMS_PER_PAGE = 10;

const AllTransactionList = ({ entries = [] } ) => {
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDate, setSelectedDate] = useState("");
  const [page, setPage] = useState(1);
  const [editEntry, setEditEntry] = useState(null); // ✅ for editing modal

  // Unique categories
  const categories = useMemo(() => {
    const unique = new Set();
    entries.forEach((e) => e.category && unique.add(e.category));
    return ["All", ...Array.from(unique)];
  }, [entries]);

  // Filtered entries
  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      const matchSearch =
        searchText === "" ||
        entry.remarks?.toLowerCase().includes(searchText.toLowerCase()) ||
        entry.amount?.toString().includes(searchText);
      const matchCategory =
        selectedCategory === "All" || entry.category === selectedCategory;
      const matchDate =
        selectedDate === "" ||
        new Date(entry.date).toISOString().slice(0, 10) === selectedDate;
      return matchSearch && matchCategory && matchDate;
    });
  }, [entries, searchText, selectedCategory, selectedDate]);

  // Paginated entries
  const totalPages = Math.ceil(filteredEntries.length / ITEMS_PER_PAGE);
  const paginatedEntries = filteredEntries.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  // Reset all filters
  const handleReset = () => {
    setSearchText("");
    setSelectedCategory("All");
    setSelectedDate("");
    setPage(1);
  };

  const handleEdit = (entry) => {
    // TODO: Open a modal or navigate to edit form
    console.log("Editing entry:", entry);
    // alert("Edit not implemented yet. Entry ID: " + entry._id);
      setEditEntry(entry);

  };

  const handleDelete = async (id) => {
    const confirm = window.confirm("Are you sure?");
    if (!confirm) return;

    try {
      await axiosPublic.delete(`/entries/${id}`);
      toast.success("Entry deleted");
      // onDeleteSuccess?.(); // ✅ trigger parent refetch
    } catch (err) {
      toast.error("Failed to delete entry");
    }
  };

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Transaction List", 14, 16);
    autoTable(doc, {
      startY: 20,
      head: [
        ["#", "Date & Time", "Remarks", "Category", "Mode", "Bill", "Amount"],
      ],
      body: filteredEntries.map((entry, i) => [
        i + 1,
        new Date(entry.date).toLocaleString(),
        entry.remarks || "-",
        entry.category || "-",
        entry.mode || "-",
        entry.billNo || "-",
        `${entry.type === "cash-in" ? "+" : "-"} ${entry.amount}`,
      ]),
    });
    doc.save("transactions.pdf");
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
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
            {categories.map((cat, idx) => (
              <option key={idx} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </label>

        <button onClick={handleReset} className="btn-outline btn btn-sm">
          <FaUndo className="mr-2" /> Reset
        </button>

        <button onClick={exportToPDF} className="btn-outline btn btn-sm">
          <FaFilePdf className="mr-2" /> Export PDF
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Search by remark or amount..."
          className="input-bordered w-full max-w-sm input"
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
              <th>Date & Time</th>
              <th>Details</th>
              <th>Category</th>
              <th>Mode</th>
              <th>Bill</th>
              <th>Amount</th>
              <th>Balance</th>
              <th>Actions</th> {/* ✅ NEW */}
            </tr>
          </thead>
          <tbody>
            {paginatedEntries.map((entry, i) => (
              <tr key={i}>
                <td>{(page - 1) * ITEMS_PER_PAGE + i + 1}</td>
                <td>{new Date(entry.date).toLocaleString()}</td>
                <td>{entry.remarks}</td>
                <td>{entry.category}</td>
                <td>{entry.mode}</td>
                <td>{entry.billNo || "-"}</td>
                <td
                  className={
                    entry.type === "cash-in" ? "text-green-600" : "text-red-600"
                  }
                >
                  {entry.type === "cash-in" ? "+" : "-"} {entry.amount}
                </td>
                <td>{/* Running balance (optional) */}</td>
                <td>
                  <div className="flex gap-2">
                    <button
                      className="btn-outline btn btn-xs"
                      onClick={() => handleEdit(entry)}
                    >
                      Edit
                    </button>
                    <button
                      className="text-white btn btn-xs btn-error"
                      onClick={() => handleDelete(entry._id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>

          {filteredEntries.length > 0 && (
            <tfoot>
              <tr className="bg-base-100 font-bold text-base">
                <td colSpan={6} className="pr-4 text-right">
                  Totals
                </td>
                <td colSpan={2}>
                  <span className="text-green-600">
                    +{" "}
                    {filteredEntries
                      .filter((e) => e.type === "cash-in")
                      .reduce((sum, e) => sum + e.amount, 0)}
                  </span>{" "}
                  |{" "}
                  <span className="text-red-600">
                    -{" "}
                    {filteredEntries
                      .filter((e) => e.type === "cash-out")
                      .reduce((sum, e) => sum + e.amount, 0)}
                  </span>{" "}
                  ={" "}
                  <span className="text-blue-600">
                    {filteredEntries.reduce((sum, e) => {
                      return e.type === "cash-in"
                        ? sum + e.amount
                        : sum - e.amount;
                    }, 0)}
                  </span>
                </td>
              </tr>
            </tfoot>
          )}
        </table>

        {filteredEntries.length === 0 && (
          <p className="my-4 text-gray-500 text-center">
            No entries found for the selected filter.
          </p>
        )}

        {editEntry && (
          <TransactionFormModal
            isModal={true}
            entry={editEntry}
            closeModal={() => setEditEntry(null)}
            onSuccess={() => {
              setEditEntry(null);
              // Optional: refetch entries
            }}
          />
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-4">
          <button
            className="btn btn-sm"
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
          >
            Prev
          </button>
          <span className="font-semibold">
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
