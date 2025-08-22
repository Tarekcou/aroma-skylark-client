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
import { useQuery } from "@tanstack/react-query";

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
  const [selectedDivision, setSelectedDivision] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedMode, setSelectedMode] = useState("All");
  const [selectedDate, setSelectedDate] = useState("");
  const [page, setPage] = useState(1);
  const [editEntry, setEditEntry] = useState(null);
  const { isAuthenticated } = useAuth();
const [previewDoc, setPreviewDoc] = useState(null);

  // 🔹 Unique filter options
  const categories = useMemo(
    () => ["All", ...new Set(entries.map((e) => e.category).filter(Boolean))],
    [entries]
  );
  const types = useMemo(
    () => ["All", ...new Set(entries.map((e) => e.type).filter(Boolean))],
    [entries]
  );
  const modes = useMemo(
    () => ["All", ...new Set(entries.map((e) => e.mode).filter(Boolean))],
    [entries]
  );

  const division = useMemo(
    () => ["All", ...new Set(entries.map((e) => e.division).filter(Boolean))],
    [entries]
  );

  const { data: members = [] } = useQuery({
    queryKey: ["members"],
    queryFn: async () => {
      const res = await axiosPublic.get("/members");
      return res.data.members || [];
    },
  });

  // 🔹 Filtering logic
  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      const matchSearch =
        !searchText ||
        entry.remarks?.toLowerCase().includes(searchText.toLowerCase()) ||
        entry.amount?.toString().includes(searchText) ||
        entry.division?.toString().includes(searchText) ||
        entry.type?.toLowerCase().includes(searchText.toLowerCase()) ||
        entry.category?.toLowerCase().includes(searchText.toLowerCase()) ||
        entry.mode?.toLowerCase().includes(searchText.toLowerCase());

      const matchCategory =
        selectedCategory === "All" || entry.category === selectedCategory;
      const matchType = selectedType === "All" || entry.type === selectedType;
      const matchMode = selectedMode === "All" || entry.mode === selectedMode;
      const matchDivision =
        selectedDivision === "All" || entry.division === selectedDivision;
      const matchDate =
        !selectedDate ||
        new Date(entry.date).toISOString().slice(0, 10) === selectedDate;

      return (
        matchSearch &&
        matchCategory &&
        matchType &&
        matchMode &&
        matchDate &&
        matchDivision
      );
    });
  }, [
    entries,
    searchText,
    selectedCategory,
    selectedType,
    selectedMode,
    selectedDate,
    selectedDivision,
  ]);

  const totalPages = Math.ceil(filteredEntries.length / ITEMS_PER_PAGE);

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
 
  // 🔹 Compute running balance and expenses dynamically
 const entriesWithBalanceAndExpense = useMemo(() => {
   // Total cash available from members
   const totalInstallmentCashIn = members.reduce(
     (sum, m) => sum + Number(m.installmentTotal || 0),
     0
   );

   let runningBalance = totalInstallmentCashIn;
   let runningExpenses = 0;

   return filteredEntries.map((entry) => {
     const amount = Number(entry.amount || 0);

     runningExpenses += amount; // cumulative expense
     runningBalance -= amount; // subtract from balance

     return {
       ...entry,
       balance: runningBalance,
       expense: runningExpenses, // cumulative expense up to this row
     };
   });
 }, [filteredEntries, members]);





  // 🔹 Total expense for footer
  const totalExpense = useMemo(() => {
    return filteredEntries
      .reduce((sum, e) => sum + (e.amount || 0), 0);
  }, [filteredEntries]);

  // 🔹 Use entriesWithBalanceAndExpense for table & pagination
  const paginatedEntries = entriesWithBalanceAndExpense.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  // 🔹 Export PDF with @react-pdf/renderer
//  const exportToPDF = async () => {
//    const today = new Date();
//    const dateStr = today.toLocaleDateString("en-GB"); // dd/mm/yyyy

//    // Calculate total expense
//    const totalExpense = paginatedEntries.reduce(
//      (sum, e) => sum + Number(e.expense || 0),
//      0
//    );

//    const MyDocument = (
//      <Document>
//        <Page size="A4" style={styles.page}>
//          <Text style={styles.header}>All Transactions</Text>
//          <Text style={styles.subHeader}>Date: {dateStr}</Text>

//          <View style={styles.table}>
//            {/* Header */}
//            <View style={styles.row}>
//              {[
//                "#",
//                "Date",
//                "Remarks",
//                "Category",
//                "Type",
//                "Division",
//                "Pmt Mode",
//                "Amount",
//                "Balance",
//                "Expenses",
//              ].map((h, i) => (
//                <Text key={i} style={[styles.cell, styles.headerCell]}>
//                  {h}
//                </Text>
//              ))}
//            </View>

//            {/* Rows */}
//            {paginatedEntries.map((e, i) => (
//              <View key={i} style={styles.row}>
//                <Text style={styles.cell}>
//                  {(page - 1) * ITEMS_PER_PAGE + i + 1}
//                </Text>
//                <Text style={styles.cell}>
//                  {new Date(e.date).toLocaleDateString("bn-BD")}
//                </Text>
//                <Text style={styles.cell}>{e.remarks || "-"}</Text>
//                <Text style={styles.cell}>{e.category || "-"}</Text>
//                <Text style={styles.cell}>{e.type || "-"}</Text>
//                <Text style={styles.cell}>{e.division || "-"}</Text>
//                <Text style={styles.cell}>{e.mode || "-"}</Text>
//                <Text style={styles.cell}>{e.amount || "-"}</Text>
//                <Text style={styles.cell}>{e.balance || "-"}</Text>
//                <Text style={styles.cell}>{e.expense || "-"}</Text>
//              </View>
//            ))}

//            {/* Total Expense Row */}
//            <View style={styles.row}>
//              <Text style={styles.cell}></Text>
//              <Text style={styles.cell}></Text>
//              <Text style={styles.cell}></Text>
//              <Text style={styles.cell}></Text>
//              <Text style={styles.cell}></Text>
//              <Text style={styles.cell}></Text>
//              <Text style={styles.cell}>Total Expense</Text>
//              <Text style={styles.cell}></Text>
//              <Text style={styles.cell}></Text>
//              <Text style={styles.cell}>{totalExpense}</Text>
//            </View>
//          </View>
//        </Page>
//      </Document>
//    );

//    const blob = await pdf(MyDocument).toBlob();
//    saveAs(blob, `transactions_${new Date().toISOString().split("T")[0]}.pdf`);
//  };
const handlePrintPreview = () => {
  if (!paginatedEntries || paginatedEntries.length === 0) {
    toast.error("No entries to print");
    return;
  }

  const totalExpense = paginatedEntries.reduce(
    (sum, e) => sum + Number(e.expense || 0),
    0
  );

  // Build HTML table for print
  const tableRows = paginatedEntries
    .map(
      (e, i) => `
      <tr>
        <td>${(page - 1) * ITEMS_PER_PAGE + i + 1}</td>
        <td>${new Date(e.date).toLocaleDateString("bn-BD")}</td>
        <td>${e.remarks || "-"}</td>
        <td>${e.category || "-"}</td>
        <td>${e.type || "-"}</td>
        <td>${e.division || "-"}</td>
                <td>${e.details || "-"}</td>

        <td>${e.mode || "-"}</td>
        <td>${e.amount || "-"}</td>
        <td>${e.balance || "-"}</td>
        <td>${e.expense || "-"}</td>
      </tr>
    `
    )
    .join("");

  const html = `
    <html>
      <head>
        <title>All Transactions</title>
        <style>
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #000; padding: 5px; text-align: center; }
          th { background-color: #f0f0f0; }
        </style>
      </head>
      <body>
        <h2>All Transactions</h2>
        <p>Date: ${new Date().toLocaleDateString("en-GB")}</p>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Date</th>
              <th>Remarks</th>
              <th>Category</th>
              <th>Type</th>
              <th>Division</th>
                            <th>Details</th>

              <th>Pmt Mode</th>
              <th>Amount</th>
              <th>Balance</th>
              <th>Expenses</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
            <tr>
              <td colspan="6"></td>
              <td><b>Total Expense</b></td>
              <td colspan="3">${totalExpense}</td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  `;

  // Open new window and trigger print
  const printWindow = window.open("", "");
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
};


 

  // const exportToExcel = () => {
  //   const worksheetData = paginatedEntries.map((e, i) => ({
  //     "#": i + 1,
  //     Date: new Date(e.date).toLocaleString("bn-BD"),
  //     Remarks: e.remarks || "-",
  //     Category: e.category || "-",
  //     Type: e.type || "-",
  //     PaymentMode: e.mode || "-",
  //     Amount: e.amount || "-",
  //     Balance: e.balance || "-",
  //     Expenses: e.expense || "-",
  //   }));

  //   // Calculate total expense
  //   const totalExpense = paginatedEntries.reduce(
  //     (sum, e) => sum + Number(e.expense || 0),
  //     0
  //   );

  //   // Add a total row
  //   worksheetData.push({
  //     "#": "",
  //     Date: "",
  //     Remarks: "",
  //     Category: "",
  //     Type: "",
  //     PaymentMode: "Total Expense",
  //     Amount: "",
  //     Balance: "",
  //     Expenses: totalExpense,
  //   });

  //   const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  //   const workbook = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");

  //   const excelBuffer = XLSX.write(workbook, {
  //     bookType: "xlsx",
  //     type: "array",
  //   });

  //   // Save file
  //   const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
  //   saveAs(blob, "Transactions.xlsx");
  // };
  
  
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewData, setPreviewData] = useState([]);

  const preparePreview = () => {
    const worksheetData = paginatedEntries.map((e, i) => ({
      "#": i + 1,
      Date: new Date(e.date).toLocaleString("bn-BD"),
      Remarks: e.remarks || "-",
      Category: e.category || "-",
      Type: e.type || "-",
      details: e.details || "-",

      PaymentMode: e.mode || "-",
      Amount: e.amount || "-",
      Balance: e.balance || "-",
      Expenses: e.expense || "-",
    }));

    const totalExpense = paginatedEntries.reduce(
      (sum, e) => sum + Number(e.expense || 0),
      0
    );

    worksheetData.push({
      "#": "",
      Date: "",
      Remarks: "",
      Category: "",
      Type: "",
      Details: "",
      PaymentMode: "Total Expense",
      Amount: "",
      Balance: "",
      Expenses: totalExpense,
    });

    setPreviewData(worksheetData);
    setPreviewVisible(true);
  };

  const downloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(previewData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "Transactions.xlsx");
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
          Division:
          <select
            className="select-bordered select"
            value={selectedDivision}
            onChange={(e) => {
              setSelectedDivision(e.target.value);
              setPage(1);
            }}
          >
            {division.map((div, i) => (
              <option key={i}>{div}</option>
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
        <button className="btn-outline btn btn-sm" onClick={handlePrintPreview}>
          <FaFilePdf className="mr-1" /> Export PDF
        </button>
        <button className="btn-outline btn btn-sm" onClick={preparePreview}>
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
            <tr className="bg-base-200 text-sm text-center">
              <th>#</th>
              <th>Date</th>
              <th>Remarks</th>
              <th>Category</th>
              <th>Type</th>
              <th>Division</th>
              <th>Details</th>
              <th>Pmt Mode</th>
              <th>Amount</th>
              <th>Balance</th>
              <th>Expenses</th> {/* NEW */}
              {isAuthenticated && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {paginatedEntries.map((e, i) => (
              <tr className="text-center" key={i}>
                <td>{(page - 1) * ITEMS_PER_PAGE + i + 1}</td>
                <td>{new Date(e.date).toLocaleDateString("bn-BD")}</td>
                <td>{e.remarks || "-"}</td>
                <td>{e.category || "-"}</td>
                <td>{e.type || "-"}</td>
                <td>{e.division || "-"}</td> {/* 🔹 NEW */}
                <td>{e.details || "-"}</td>
                <td>{e.mode || "-"}</td>
                <td
                  className={
                    e.type === "cash-in" ? "text-green-600" : "text-red-600"
                  }
                >
                  {e.type === "cash-in" ? "+" : "-"} {e.amount}
                </td>
                <td
                  className={e.balance >= 0 ? "text-green-600" : "text-red-600"}
                >
                  {e.balance}
                </td>
                <td className="text-red-600">{e.expense}</td> {/* NEW */}
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
          {/* 🔹 Footer for total expense */}
          <tfoot>
            <tr className="bg-base-200 font-bold text-sm text-center">
              <td colSpan={9}>Total Expenses</td>
              {/* <td>-</td> */}
              <td className="text-red-600">{totalExpense}</td>
              {isAuthenticated && <td></td>}
            </tr>
          </tfoot>
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
          refetch={refetch}
        />
      )}
      {previewVisible && (
        <div className="z-50 fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
          <div className="bg-white p-4 rounded w-[90vw] max-h-[80vh] overflow-auto">
            <h2 className="mb-4 font-bold text-xl">Excel Preview</h2>
            <table className="border w-full border-collapse">
              <thead>
                <tr>
                  {Object.keys(previewData[0]).map((key) => (
                    <th key={key} className="px-2 py-1 border">
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewData.map((row, i) => (
                  <tr key={i}>
                    {Object.values(row).map((val, j) => (
                      <td key={j} className="px-2 py-1 border text-center">
                        {val}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-end gap-2 mt-4">
              <button
                className="bg-gray-300 px-4 py-2 rounded"
                onClick={() => setPreviewVisible(false)}
              >
                Cancel
              </button>
              <button
                className="bg-green-500 px-4 py-2 rounded text-white"
                onClick={downloadExcel}
              >
                Download Excel
              </button>
            </div>
          </div>
        </div>
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
