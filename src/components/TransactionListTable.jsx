import React, { useMemo, useState } from "react";
import { FaSearch, FaUndo, FaFilePdf, FaFileExcel } from "react-icons/fa";
import TransactionFormModal from "./TransactionFormModal";
import axiosPublic from "../axios/AxiosPublic";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { useAuth } from "../context/AuthContext";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

// 🚨 Removed pdfMake import
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  pdf,
} from "@react-pdf/renderer";

const ITEMS_PER_PAGE = 10;

// 🔹 Register Bangla font once
Font.register({
  family: "NotoSansBengali",
  src: "/fonts/NotoSansBengali-Regular.ttf",
});

const styles = StyleSheet.create({
  page: {
    fontFamily: "NotoSansBengali",
    padding: 20,
    fontSize: 10,
  },
  table: {
    display: "table",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  row: {
    flexDirection: "row",
  },
  cell: {
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 4,
    flex: 1,
  },
  header: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
    fontWeight: "bold",
  },
  content: {
    fontSize: 12,
    lineHeight: 1.5,
  },
  headerCell: {
    backgroundColor: "#f0f0f0",
    fontWeight: "bold",
  },
});

const TransactionListTable = ({ entries = [], refetch }) => {
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedMode, setSelectedMode] = useState("All");
  const [selectedDate, setSelectedDate] = useState("");
  const [page, setPage] = useState(1);
  const [editEntry, setEditEntry] = useState(null);
  const { isAuthenticated } = useAuth();

  // 🔹 Unique filter options
  const categories = useMemo(
    () => ["All", ...new Set(entries.map((e) => e.category).filter(Boolean))],
    [entries]
  );
  const types = useMemo(
    () => ["All", ...new Set(entries.map((e) => e.extraField).filter(Boolean))],
    [entries]
  );
  const modes = useMemo(
    () => ["All", ...new Set(entries.map((e) => e.mode).filter(Boolean))],
    [entries]
  );

  // 🔹 Filtering logic
  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      const matchSearch =
        !searchText ||
        entry.remarks?.toLowerCase().includes(searchText.toLowerCase()) ||
        entry.amount?.toString().includes(searchText) ||
        entry.extraField?.toLowerCase().includes(searchText.toLowerCase()) ||
        entry.category?.toLowerCase().includes(searchText.toLowerCase()) ||
        entry.mode?.toLowerCase().includes(searchText.toLowerCase());

      const matchCategory =
        selectedCategory === "All" || entry.category === selectedCategory;
      const matchType =
        selectedType === "All" || entry.extraField === selectedType;
      const matchMode = selectedMode === "All" || entry.mode === selectedMode;
      const matchDate =
        !selectedDate ||
        new Date(entry.date).toISOString().slice(0, 10) === selectedDate;

      return (
        matchSearch && matchCategory && matchType && matchMode && matchDate
      );
    });
  }, [
    entries,
    searchText,
    selectedCategory,
    selectedType,
    selectedMode,
    selectedDate,
  ]);

  const totalPages = Math.ceil(filteredEntries.length / ITEMS_PER_PAGE);
  const paginatedEntries = filteredEntries.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  // 🔹 Reset filters
  const handleReset = () => {
    setSearchText("");
    setSelectedCategory("All");
    setSelectedType("All");
    setSelectedMode("All");
    setSelectedDate("");
    setPage(1);
  };

  // 🔹 Delete handler
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This transaction will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    try {
      await axiosPublic.delete(`/entries/${id}`);
      toast.success("Entry deleted");
      if (refetch) refetch();
    } catch {
      toast.error("Failed to delete entry");
    }
  };

  // 🔹 Export Excel (unchanged)
  const exportToExcel = () => {
    const worksheetData = filteredEntries.map((e, i) => ({
      "#": i + 1,
      Date: new Date(e.date).toLocaleString("bn-BD"),
      Remarks: e.remarks || "-",
      Category: e.category || "-",
      Type: e.extraField || "-",
      Mode: e.mode || "-",
      Amount: `${e.type === "cash-in" ? "+" : "-"} ${e.amount}`,
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const data = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });
    saveAs(data, "transactions.xlsx");
  };

  // 🔹 Export PDF with @react-pdf/renderer
  const exportToPDF = async () => {
    const MyDocument = (
      <Document>
        <Page size="A4" style={styles.page}>
          <Text style={styles.header}> Transactions </Text>

          <View style={styles.table}>
            {/* Header */}
            <View style={styles.row}>
              {[
                "#",
                "তারিখ",
                "Remarks",
                "Category",
                "Type",
                "Mode",
                "Amount",
              ].map((h, i) => (
                <Text key={i} style={[styles.cell, styles.headerCell]}>
                  {h}
                </Text>
              ))}
            </View>
            {/* Rows */}
            {paginatedEntries.map((e, i) => (
              <View key={i} style={styles.row}>
                <Text style={styles.cell}>
                  {(page - 1) * ITEMS_PER_PAGE + i + 1}
                </Text>
                <Text style={styles.cell}>
                  {new Date(e.date).toLocaleString("bn-BD")}
                </Text>
                <Text style={styles.cell}>{e.remarks || "-"}</Text>
                <Text style={styles.cell}>{e.category || "-"}</Text>
                <Text style={styles.cell}>{e.extraField || "-"}</Text>
                <Text style={styles.cell}>{e.mode || "-"}</Text>
                <Text style={styles.cell}>
                  {e.type === "cash-in" ? `+ ${e.amount}` : `- ${e.amount}`}
                </Text>
              </View>
            ))}
          </View>
        </Page>
      </Document>
    );

    const blob = await pdf(MyDocument).toBlob();
    saveAs(blob, `transactions_${new Date().toISOString().split("T")[0]}.pdf`);
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
            {categories.map((cat, i) => (
              <option key={i}>{cat}</option>
            ))}
          </select>
        </label>

        <label className="flex flex-col text-sm">
          Type:
          <select
            className="select-bordered select"
            value={selectedType}
            onChange={(e) => {
              setSelectedType(e.target.value);
              setPage(1);
            }}
          >
            {types.map((t, i) => (
              <option key={i}>{t}</option>
            ))}
          </select>
        </label>

        <label className="flex flex-col text-sm">
          Mode:
          <select
            className="select-bordered select"
            value={selectedMode}
            onChange={(e) => {
              setSelectedMode(e.target.value);
              setPage(1);
            }}
          >
            {modes.map((m, i) => (
              <option key={i}>{m}</option>
            ))}
          </select>
        </label>

        <button className="btn-outline btn btn-sm" onClick={handleReset}>
          <FaUndo className="mr-1" /> Reset
        </button>
        <button className="btn-outline btn btn-sm" onClick={exportToPDF}>
          <FaFilePdf className="mr-1" /> Export PDF
        </button>
        <button className="btn-outline btn btn-sm" onClick={exportToExcel}>
          <FaFileExcel className="mr-1 text-green-600" /> Export Excel
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          className="input-bordered w-full max-w-sm input"
          placeholder="Search by remark, amount, type, category, mode..."
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
      <div
        id="pdfContent"
        style={{ fontFamily: "'Noto Sans Bengali', sans-serif" }}
        className="bg-white shadow rounded-lg overflow-x-auto"
      >
        <table className="table table-zebra w-full">
          <thead>
            <tr className="bg-base-200 text-sm">
              <th>#</th>
              <th>Date</th>
              <th>Remarks</th>
              <th>Category</th>
              <th>Type</th>
              <th>Mode</th>
              <th>Amount</th>
              {isAuthenticated && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {paginatedEntries.map((e, i) => (
              <tr key={i}>
                <td>{(page - 1) * ITEMS_PER_PAGE + i + 1}</td>
                <td>{new Date(e.date).toLocaleString("bn-BD")}</td>
                <td>{e.remarks}</td>
                <td>{e.category}</td>
                <td>{e.extraField}</td>
                <td>{e.mode}</td>
                <td
                  className={
                    e.type === "cash-in" ? "text-green-600" : "text-red-600"
                  }
                >
                  {e.type === "cash-in" ? "+" : "-"} {e.amount}
                </td>
                {isAuthenticated && (
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
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {filteredEntries.length === 0 && (
          <p className="my-4 text-gray-500 text-center">No entries found.</p>
        )}
      </div>

      {/* Edit Modal */}
      {editEntry && (
        <TransactionFormModal
          isModal={true}
          entries={entries}
          closeModal={() => setEditEntry(null)}
          entry={editEntry}
          onSuccess={() => setEditEntry(null)}
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

export default TransactionListTable;
