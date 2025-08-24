import { useNavigate, useParams } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosPublic from "../../axios/AxiosPublic";
import { useState } from "react";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import { MdArrowBack } from "react-icons/md";
import { FaFileExcel, FaFilePdf } from "react-icons/fa";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  pdf,
  PDFViewer,
} from "@react-pdf/renderer";

const ITEMS_PER_PAGE = 10;

// 🔹 Register Bangla font once
Font.register({
  family: "NotoSansBengali",
  src: "/fonts/NotoSansBengali-Regular.ttf",
});

const styles = StyleSheet.create({
  page: { fontFamily: "NotoSansBengali", padding: 20, fontSize: 10 },
  table: {
    display: "table",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  row: { flexDirection: "row" },
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
  headerCell: { backgroundColor: "#f0f0f0", fontWeight: "bold" },
});

const MyPDFDoc = ({ logs = [], productName = "" }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.header}>{productName} - Stock Logs</Text>
      <View style={[styles.table, { marginBottom: 5 }]}>
        <View style={styles.row}>
          {["Date", "Type", "Quantity", "Remarks", "Stock"].map((header) => (
            <Text key={header} style={[styles.cell, styles.headerCell]}>
              {header}
            </Text>
          ))}
        </View>
        {logs.map((log, idx) => (
          <View key={idx} style={styles.row}>
            <Text style={styles.cell}>{log.date || "-"}</Text>
            <Text style={styles.cell}>{log.type || "-"}</Text>
            <Text style={styles.cell}>{log.quantity ?? "-"}</Text>
            <Text style={styles.cell}>{log.remarks || "-"}</Text>
            <Text style={styles.cell}>{log.balance ?? "-"}</Text>
          </View>
        ))}
      </View>
    </Page>
  </Document>
);

const ProductDetails = () => {
  const { id } = useParams();
  const qc = useQueryClient();
  const navigate = useNavigate();

  const [range, setRange] = useState({ from: "", to: "" });
  const [form, setForm] = useState({
    type: "in",
    quantity: "",
    remarks: "",
    date: new Date().toISOString().slice(0, 10),
  });
  const [editing, setEditing] = useState(null);
  const [editData, setEditData] = useState({
    type: "in",
    quantity: "",
    remarks: "",
    date: "",
  });
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);
  const [pdfBlob, setPdfBlob] = useState(null);
  const [showPDFPreview, setShowPDFPreview] = useState(false);
  const [showExcelPreview, setShowExcelPreview] = useState(false);

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  const {
    data: product,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["product", id, range],
    queryFn: async () => {
      const res = await axiosPublic.get(`/products/${id}`, { params: range });
      return res.data;
    },
    enabled: !!id,
  });

  const addLog = useMutation({
    mutationFn: async (payload) =>
      axiosPublic.post(`/products/${id}/logs`, payload),
    onSuccess: () => {
      toast.success("Entry added");
      qc.invalidateQueries({ queryKey: ["product", id] });
      setForm({
        type: "in",
        quantity: "",
        remarks: "",
        date: new Date().toISOString().slice(0, 10),
      });
    },
    onError: (e) =>
      toast.error(e?.response?.data?.error || "Failed to add entry"),
  });

  const updateLog = useMutation({
    mutationFn: async ({ index, payload }) =>
      axiosPublic.patch(`/products/${id}/logs/${index}`, payload),
    onSuccess: () => {
      toast.success("Entry updated");
      setEditing(null);
      qc.invalidateQueries({ queryKey: ["product", id] });
    },
    onError: (e) =>
      toast.error(e?.response?.data?.error || "Failed to update entry"),
  });

  const deleteLog = useMutation({
    mutationFn: async (index) =>
      axiosPublic.delete(`/products/${id}/logs/${index}`),
    onSuccess: () => {
      toast.success("Entry deleted");
      qc.invalidateQueries({ queryKey: ["product", id] });
    },
    onError: (e) =>
      toast.error(e?.response?.data?.error || "Failed to delete entry"),
  });

  if (isLoading) return <p>Loading...</p>;
  if (!product) return <p>Not found</p>;

  const onFilter = () => refetch();

  const startEdit = (log, idx) => {
    setEditing(idx);
    setEditData({
      type: log.type || "in",
      quantity: log.quantity,
      remarks: log.remarks || "",
      date: log.date ? new Date(log.date).toISOString().slice(0, 10) : "",
    });
  };

  const generatePDFBlob = async () => {
    const blob = await pdf(
      <MyPDFDoc logs={product.logs || []} productName={product.name || ""} />
    ).toBlob();
    setPdfBlob(blob);
    setPdfBlobUrl(URL.createObjectURL(blob));
    return blob;
  };

  const handleOpenInBrowser = async () => {
    if (!pdfBlobUrl) await generatePDFBlob();
    window.open(pdfBlobUrl, "_blank");
  };

  const handleDownloadPDF = async () => {
    const blob = pdfBlob || (await generatePDFBlob());
    saveAs(blob, `transactions_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  const exportExcel = (logs = [], productName = "") => {
    const worksheet = XLSX.utils.json_to_sheet(
      logs.map((log) => ({
        Date: log.date,
        Type: log.type,
        Quantity: log.quantity,
        Remarks: log.remarks,
        Stock: log.balance,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Stock Logs");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, `${productName}-stock-logs.xlsx`);
  };
  return (
    <div className="space-y-4 md:p-4">
      {/* Product summary */}
      <div className="bg-white shadow-sm p-4 border-gray-200 rounded-lg">
        {/* Header with back button */}
        <div className="flex items-center gap-2 mb-2 font-bold text-xl">
          <MdArrowBack
            onClick={() => navigate(-1)}
            className="hover:text-blue-600 transition cursor-pointer"
          />
          <h1>
            {product.name} {product.unit ? `(${product.unit})` : ""}
          </h1>
        </div>

        {/* Created date */}
        <p className="mb-2 text-gray-500 text-sm">
          Created:{" "}
          {product.createdAt
            ? new Date(product.createdAt).toLocaleDateString()
            : "-"}
        </p>

        {/* In / Out / Stock summary */}
        <div className="gap-4 grid grid-cols-3 mb-4">
          {/* In Card */}
          <div className="flex flex-col justify-center items-center bg-green-50 shadow-sm p-4 rounded-xl">
            <span className="font-semibold text-green-700 text-lg">
              {product.totalIn || 0}
            </span>
            <span className="text-gray-600 text-sm">In</span>
          </div>

          {/* Out Card */}
          <div className="flex flex-col justify-center items-center bg-red-50 shadow-sm p-4 rounded-xl">
            <span className="font-semibold text-red-700 text-lg">
              {product.totalOut || 0}
            </span>
            <span className="text-gray-600 text-sm">Out</span>
          </div>

          {/* Stock Card */}
          <div className="flex flex-col justify-center items-center bg-gray-50 shadow-sm p-4 rounded-xl">
            <span className="font-bold text-gray-900 text-lg">
              {product.stock || 0}
            </span>
            <span className="text-gray-600 text-sm">Stock</span>
          </div>
        </div>

        {/* Remarks */}
        <p className="text-gray-700">
          <span className="font-semibold">Remarks:</span>{" "}
          {product.remarks || "-"}
        </p>
      </div>

      <div className="flex md:flex-row flex-col justify-between items-center gap-3 shadow-md p-3 card">
        {/* Date filter */}
        <div className="flex items-end gap-2 w-full">
          <div className="flex flex-col">
            <label className="text-xs">From</label>
            <input
              type="date"
              className="input-bordered input"
              value={range.from}
              onChange={(e) =>
                setRange((r) => ({ ...r, from: e.target.value }))
              }
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs">To</label>
            <input
              type="date"
              className="input-bordered input"
              value={range.to}
              onChange={(e) => setRange((r) => ({ ...r, to: e.target.value }))}
            />
          </div>
          <button onClick={onFilter} className="btn btn-sm btn-primary">
            Filter
          </button>
        </div>
        <div className="flex gap-2">
          <button
            className="btn-outline btn btn-sm"
            onClick={async () => {
              if (isMobile) {
                setShowPDFPreview(true); // 📱 show modal with open/download options
              } else {
                await generatePDFBlob();
                setShowPDFPreview(true); // 🖥️ desktop preview
              }
            }}
          >
            <FaFilePdf className="mr-1" /> Export PDF
          </button>

          <button
            className="btn btn-secondary btn-sm"
            onClick={() => {
              if (isMobile) {
                // 📱 Mobile → skip preview, directly export & open
                exportExcel(product.logs, product.name);
              } else {
                // 💻 Desktop → show preview modal
                setShowExcelPreview(true);
              }
            }}
          >
            <FaFileExcel /> Excel
          </button>
        </div>

        {/* <div className="flex gap-2">
          <button
            className="btn btn-primary btn-sm"
            onClick={() => exportPDF(product.logs, product.name)}
          >
            <FaFilePdf /> PDF
          </button>

          <button
            className="btn btn-secondary btn-sm"
            onClick={() => exportExcel(product.logs, product.name)}
          >
            <FaFileExcel /> Excel
          </button>
        </div> */}
      </div>

      {/* Add new log */}
      <div className="bg-white shadow mx-auto p-3 rounded-lg">
        <h4 className="mb-2 font-semibold">Add Entry</h4>
        <div className="gap-2 grid grid-cols-1 md:grid-cols-5">
          <select
            className="w-full select-bordered select"
            value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
          >
            <option value="in">In</option>
            <option value="out">Out</option>
          </select>
          <input
            type="number"
            min={1}
            className="input-bordered w-full input"
            placeholder="Quantity"
            value={form.quantity}
            onChange={(e) =>
              setForm((f) => ({ ...f, quantity: e.target.value }))
            }
          />
          <input
            type="text"
            className="input-bordered w-full input"
            placeholder="Remarks"
            value={form.remarks}
            onChange={(e) =>
              setForm((f) => ({ ...f, remarks: e.target.value }))
            }
          />
          <input
            type="date"
            className="input-bordered w-full input"
            value={form.date}
            onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
          />
          <button
            className="w-full btn btn-primary"
            onClick={() =>
              addLog.mutate({
                type: form.type,
                quantity: Number(form.quantity),
                remarks: form.remarks,
                date: form.date,
              })
            }
            disabled={addLog.isLoading}
          >
            {addLog.isLoading ? "Saving..." : "Add"}
          </button>
        </div>
      </div>

      {/* Logs table */}
      {/* Logs table */}
      <div className="bg-white shadow rounded-lg overflow-x-auto text-xl">
        <table className="table table-zebra w-full">
          <thead>
            <tr className="bg-base-200">
              <th>Date</th>
              <th>Type</th>
              <th>Qty</th>
              <th>Remarks</th>
              <th>Stock</th> {/* <-- running balance after this txn */}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(product.logs || []).map((log, idx) => {
              const isEdit = editing === idx;
              return (
                <tr key={idx}>
                  <td>
                    {isEdit ? (
                      <input
                        type="date"
                        className="input-bordered input input-sm"
                        value={editData.date}
                        onChange={(e) =>
                          setEditData((d) => ({ ...d, date: e.target.value }))
                        }
                      />
                    ) : log.date ? (
                      new Date(log.date).toLocaleDateString()
                    ) : (
                      "-"
                    )}
                  </td>
                  <td
                    className={
                      log.type === "in" ? "text-green-600" : "text-red-600"
                    }
                  >
                    {isEdit ? (
                      <select
                        className="select-bordered select-sm select"
                        value={editData.type}
                        onChange={(e) =>
                          setEditData((d) => ({ ...d, type: e.target.value }))
                        }
                      >
                        <option value="in">In</option>
                        <option value="out">Out</option>
                      </select>
                    ) : (
                      log.type || "-"
                    )}
                  </td>
                  <td>
                    {isEdit ? (
                      <input
                        type="number"
                        min={1}
                        className="input-bordered input input-sm"
                        value={editData.quantity}
                        onChange={(e) =>
                          setEditData((d) => ({
                            ...d,
                            quantity: e.target.value,
                          }))
                        }
                      />
                    ) : (
                      log.quantity
                    )}
                  </td>
                  <td>
                    {isEdit ? (
                      <input
                        type="text"
                        className="input-bordered input input-sm"
                        value={editData.remarks}
                        onChange={(e) =>
                          setEditData((d) => ({
                            ...d,
                            remarks: e.target.value,
                          }))
                        }
                      />
                    ) : (
                      log.remarks || "-"
                    )}
                  </td>

                  {/* NEW: show the running balance stored by the backend */}
                  <td>{log.balance ?? "-"}</td>

                  <td className="flex gap-2">
                    {isEdit ? (
                      <>
                        <button
                          className="btn btn-xs btn-primary"
                          onClick={() =>
                            updateLog.mutate({
                              index: idx,
                              payload: {
                                ...editData,
                                quantity: Number(editData.quantity),
                              },
                            })
                          }
                          disabled={updateLog.isLoading}
                        >
                          {updateLog.isLoading ? "Saving..." : "Save"}
                        </button>
                        <button
                          className="btn btn-xs"
                          onClick={() => setEditing(null)}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="btn-outline btn btn-xs"
                          onClick={() => startEdit(log, idx)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-xs btn-error"
                          onClick={async () => {
                            const result = await Swal.fire({
                              title: "Delete this entry?",
                              icon: "warning",
                              showCancelButton: true,
                            });
                            if (!result.isConfirmed) return;
                            deleteLog.mutate(idx);
                          }}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
            {(product.logs || []).length === 0 && (
              <tr>
                <td colSpan={6} className="py-6 text-gray-500 text-center">
                  No transactions found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {showPDFPreview && (
        <div className="z-50 fixed inset-0 flex justify-center items-center bg-black/70 p-4">
          <div className="relative flex flex-col bg-white p-4 rounded-lg w-full max-w-5xl h-[90vh]">
            <h3 className="mb-2 font-bold text-lg">📄 Transactions Report</h3>
            {!isMobile ? (
              <PDFViewer width="100%" height="100%">
                <MyPDFDoc
                  logs={product.logs || []}
                  productName={product.name || ""}
                />
              </PDFViewer>
            ) : (
              <p className="flex-1 text-gray-600 text-sm">
                On mobile, preview is not supported. Please choose{" "}
                <b>Open in Browser Tab</b> or <b>Download PDF</b>.
              </p>
            )}
            <div className="flex justify-end gap-2 mt-4">
              {isMobile && (
                <button
                  className="btn btn-info btn-sm"
                  onClick={handleOpenInBrowser}
                >
                  🌐 Open in Browser Tab
                </button>
              )}
              <button
                className="btn btn-success btn-sm"
                onClick={handleDownloadPDF}
              >
                📥 Download PDF
              </button>
              <button
                className="btn-outline btn btn-sm"
                onClick={() => setShowPDFPreview(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Excel Preview Modal */}
      {showExcelPreview && (
        <div className="z-50 fixed inset-0 flex justify-center items-center bg-black/70 p-4">
          <div className="relative bg-white shadow-lg p-4 rounded-lg w-full max-w-4xl h-[90vh] overflow-auto">
            <h2 className="mb-4 font-bold text-lg">
              {product.name || ""} - Stock Logs (Excel Preview)
            </h2>
            <table className="table table-zebra border w-full text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-2 py-1 border">Date</th>
                  <th className="px-2 py-1 border">Type</th>
                  <th className="px-2 py-1 border">Quantity</th>
                  <th className="px-2 py-1 border">Remarks</th>
                  <th className="px-2 py-1 border">Stock</th>
                </tr>
              </thead>
              <tbody>
                {(product.logs || []).map((log, i) => (
                  <tr key={i}>
                    <td className="px-2 py-1 border">
                      {log.date ? new Date(log.date).toLocaleDateString() : "-"}
                    </td>
                    <td className="px-2 py-1 border">{log.type}</td>
                    <td className="px-2 py-1 border">{log.quantity}</td>
                    <td className="px-2 py-1 border">{log.remarks || "-"}</td>
                    <td className="px-2 py-1 border">{log.balance ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="right-3 bottom-3 absolute flex gap-2">
              <button
                className="btn"
                onClick={() => setShowExcelPreview(false)}
              >
                Close
              </button>
              <button
                className="btn btn-primary"
                onClick={() => exportExcel(product.logs, product.name)}
              >
                Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
