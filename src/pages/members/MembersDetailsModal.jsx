import React, { useState } from "react";
import {
  Document as PDFDocGen,
  Page as PDFPageGen,
  Text,
  View,
  StyleSheet,
  pdf,
  Font,
} from "@react-pdf/renderer";
import { Document, Page, pdfjs } from "react-pdf"; // 👈 For preview
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import axiosPublic from "../../axios/AxiosPublic";
import toast from "react-hot-toast";
import { MdDelete } from "react-icons/md";


// ✅ Load Bangla font for @react-pdf/renderer
Font.register({
  family: "NotoSansBengali",
  src: "/fonts/NotoSansBengali-Regular.ttf",
});

// ✅ react-pdf worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const MemberDetailsModal = ({ member, onClose, refetch }) => {
  const [installments, setInstallments] = useState(
    Object.keys(member)
      .filter((k) => k.startsWith("payment") && k.endsWith("Amount"))
      .map((k) => {
        const num = k.match(/\d+/)?.[0];
        return {
          id: num,
          date: member[`payment${num}Date`] || "",
          amount: member[`payment${num}Amount`] || 0,
          details: member[`payment${num}Details`] || "",
        };
      })
      .sort((a, b) => Number(a.id) - Number(b.id))
  );

  const [showPDFModal, setShowPDFModal] = useState(false);
  const [showExcelModal, setShowExcelModal] = useState(false);
  const [excelData, setExcelData] = useState([]);
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);
  const [numPages, setNumPages] = useState(null);

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  const getCumulativeTotal = (idx) =>
    installments.slice(0, idx + 1).reduce((sum, i) => sum + (i.amount || 0), 0);
  const totalPayment = installments.reduce(
    (sum, i) => sum + (i.amount || 0),
    0
  );

  // ✅ PDF Styles
  const styles = StyleSheet.create({
    page: { padding: 20, fontFamily: "NotoSansBengali" },
    header: {
      fontSize: 16,
      marginBottom: 10,
      textAlign: "center",
      fontFamily: "NotoSansBengali",
    },

    table: {
      display: "table",
      width: "auto",
      borderStyle: "solid",
      borderWidth: 1,
    },
    tableRow: { flexDirection: "row" },
    tableCol: {
      borderStyle: "solid",
      borderWidth: 1,
      borderColor: "#000",
      padding: 4,
    },
    tableCell: { fontSize: 10 },
  });

  const colWidths = [0.1, 0.2, 0.2, 0.3, 0.2];

  const PDFDocument = () => (
    <PDFDocGen>
      <PDFPageGen size="A4" style={styles.page}>
        <Text style={styles.header}>Payment Details - {member.name}</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            {["#", "Date", "Amount", "Details", "Total Paid"].map(
              (header, idx) => (
                <View
                  key={header}
                  style={{ ...styles.tableCol, flex: colWidths[idx] }}
                >
                  <Text style={styles.tableCell}>{header}</Text>
                </View>
              )
            )}
          </View>

          {installments.map((i, idx) => (
            <View style={styles.tableRow} key={i.id}>
              <View style={{ ...styles.tableCol, flex: colWidths[0] }}>
                <Text style={styles.tableCell}>{idx + 1}</Text>
              </View>
              <View style={{ ...styles.tableCol, flex: colWidths[1] }}>
                <Text style={styles.tableCell}>{i.date}</Text>
              </View>
              <View style={{ ...styles.tableCol, flex: colWidths[2] }}>
                <Text style={styles.tableCell}>{i.amount}</Text>
              </View>
              <View style={{ ...styles.tableCol, flex: colWidths[3] }}>
                <Text style={styles.tableCell}>{i.details}</Text>
              </View>
              <View style={{ ...styles.tableCol, flex: colWidths[4] }}>
                <Text style={styles.tableCell}>{getCumulativeTotal(idx)}</Text>
              </View>
            </View>
          ))}

          <View style={styles.tableRow}>
            <View style={{ ...styles.tableCol, flex: colWidths[0] }}>
              <Text style={styles.tableCell}>Total</Text>
            </View>
            <View style={{ ...styles.tableCol, flex: colWidths[1] }} />
            <View style={{ ...styles.tableCol, flex: colWidths[2] }}>
              <Text style={styles.tableCell}>{totalPayment}</Text>
            </View>
            <View style={{ ...styles.tableCol, flex: colWidths[3] }} />
            <View style={{ ...styles.tableCol, flex: colWidths[4] }} />
          </View>
        </View>
      </PDFPageGen>
    </PDFDocGen>
  );

  // ✅ PDF Actions
  const openPDFModal = async () => {
    const blob = await pdf(PDFDocument()).toBlob();
    const url = URL.createObjectURL(blob);
    setPdfBlobUrl(url);
    setShowPDFModal(true);
  };
  

  const handleDownloadPDF = async () => {
    if (!pdfBlobUrl) {
      const blob = await pdf(PDFDocument()).toBlob();
      setPdfBlobUrl(URL.createObjectURL(blob));
      saveAs(blob, `${member.name}-payments.pdf`);
    } else {
      saveAs(pdfBlobUrl, `${member.name}-payments.pdf`);
    }
    setShowPDFModal(false);
  };



  // const handleOpenInApp = async () => {
  //   if (!pdfBlobUrl) {
  //     const blob = await pdf(PDFDocument()).toBlob();
  //     const url = URL.createObjectURL(blob);
  //     setPdfBlobUrl(url);
  //     window.open(url, "_blank");
  //   } else {
  //     window.open(pdfBlobUrl, "_blank");
  //   }
  //   setShowPDFModal(false);
  // };
  const handleOpenInBrowser = async () => {
    if (!pdfBlobUrl) {
      const blob = await pdf(PDFDocument()).toBlob();
      const url = URL.createObjectURL(blob);
      setPdfBlobUrl(url);
      window.open(url, "_blank"); // 👉 Opens in new browser tab
    } else {
      window.open(pdfBlobUrl, "_blank");
    }
    setShowPDFModal(false);
  };



  // ✅ Excel Actions
  const prepareExcel = () => {
    const data = installments.map((i, idx) => ({
      "#": idx + 1,
      Date: i.date,
      Amount: i.amount,
      Details: i.details,
      "Total Paid": getCumulativeTotal(idx),
    }));
    data.push({
      "#": "",
      Date: "",
      Amount: "Total",
      Details: "",
      "Total Paid": totalPayment,
    });
    setExcelData(data);
    setShowExcelModal(true);
  };

  const downloadExcel = () => {
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Payments");
    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(
      new Blob([buf], { type: "application/octet-stream" }),
      `${member.name}-payments.xlsx`
    );
    setShowExcelModal(false);
  };

  // ✅ Delete installment
  const handleDelete = async (id) => {
    setInstallments((prev) => prev.filter((i) => i.id !== id));
    try {
      await axiosPublic.patch(`/members/${member._id}`, {
        unset: {
          [`payment${id}Date`]: 1,
          [`payment${id}Amount`]: 1,
          [`payment${id}Details`]: 1,
        },
      });
      toast.success(`Payment ${id} deleted`);
      refetch();
    } catch {
      toast.error("Failed to delete payment");
    }
  };

  return (
    <div className="z-50 fixed inset-0 flex justify-center items-center bg-black/50 p-2 overflow-y-auto">
      <div className="flex flex-col gap-4 bg-white p-4 rounded-lg w-full max-w-5xl">
        <h3 className="font-bold text-lg">Details for {member.name}</h3>

        {/* Export Buttons */}
        <div className="flex justify-end gap-2">
          <button className="btn-outline btn btn-sm" onClick={openPDFModal}>
            Export PDF
          </button>
          <button className="btn-outline btn btn-sm" onClick={prepareExcel}>
            Export Excel
          </button>
        </div>

        {/* ✅ PDF Modal */}
        {/* ✅ PDF Modal */}
        {showPDFModal && (
          <div className="z-50 fixed inset-0 flex justify-center items-center bg-black/70 p-4">
            <div className="relative flex flex-col gap-4 bg-white p-4 rounded-lg w-full max-w-4xl">
              <h3 className="font-bold text-lg">PDF Export Options</h3>

              {/* Desktop: show preview */}
              {!isMobile && pdfBlobUrl ? (
                <div className="border h-[70vh] overflow-auto">
                  <Document
                    file={pdfBlobUrl}
                    onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                  >
                    {Array.from(new Array(numPages), (_, index) => (
                      <Page key={`page_${index + 1}`} pageNumber={index + 1} />
                    ))}
                  </Document>
                </div>
              ) : (
                // Mobile: only instructions
                <p className="text-gray-600 text-sm">
                  On mobile, preview isn’t supported. Please choose{" "}
                  <b>Open in App</b> or <b>Download</b>.
                </p>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-2">
                {isMobile && (
                  // <button className="btn btn-info" onClick={handleOpenInApp}>
                  //   📂 Open in App
                  // </button>
                  <button
                    className="btn btn-info btn-sm"
                    onClick={handleOpenInBrowser}
                  >
                    🌐 Open in Browser Tab
                  </button>
                )}
                <button className="btn btn-success btn-sm" onClick={handleDownloadPDF}>
                  📥 Download PDF
                </button>
                <button
                  className="btn-outline btn btn-sm"
                  onClick={() => setShowPDFModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ✅ Excel Modal */}
        {showExcelModal && (
          <div className="z-50 fixed inset-0 flex justify-center items-center bg-black/70 p-4">
            <div className="relative bg-white p-4 rounded-lg w-full max-w-4xl overflow-auto">
              <h3 className="mb-2 font-bold text-lg">Excel Preview</h3>
              <table className="table border w-full border-collapse">
                <thead>
                  <tr>
                    {Object.keys(excelData[0] || {}).map((key) => (
                      <th key={key} className="px-2 py-1 border">
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {excelData.map((row, i) => (
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
                  className="btn-outline btn"
                  onClick={() => setShowExcelModal(false)}
                >
                  Close
                </button>
                <button className="btn btn-success" onClick={downloadExcel}>
                  📥 Download Excel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ... your installments table and add/save/close buttons remain same ... */}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="table border w-full min-w-max">
            <thead>
              <tr className="bg-gray-100">
                <th>#</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Details</th>
                <th>Total Paid</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {installments.map((i, idx) => (
                <tr key={i.id}>
                  <td>{idx + 1}</td>
                  <td>
                    <input
                      type="date"
                      value={i.date}
                      onChange={(e) =>
                        setInstallments((prev) =>
                          prev.map((x) =>
                            x.id === i.id ? { ...x, date: e.target.value } : x
                          )
                        )
                      }
                      className="input-bordered input input-sm"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={i.amount}
                      onChange={(e) =>
                        setInstallments((prev) =>
                          prev.map((x) =>
                            x.id === i.id
                              ? { ...x, amount: Number(e.target.value) }
                              : x
                          )
                        )
                      }
                      className="input-bordered input input-sm"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={i.details}
                      onChange={(e) =>
                        setInstallments((prev) =>
                          prev.map((x) =>
                            x.id === i.id
                              ? { ...x, details: e.target.value }
                              : x
                          )
                        )
                      }
                      className="input-bordered input input-sm"
                    />
                  </td>
                  <td>{getCumulativeTotal(idx)}</td>
                  <td>
                    <button onClick={() => handleDelete(i.id)}>
                      <MdDelete className="text-error text-lg btn-xs btn" />
                    </button>
                  </td>
                </tr>
              ))}
              <tr className="bg-gray-100 font-bold">
                <td colSpan={4} className="pr-2 text-right">
                  Total Payment
                </td>
                <td>{totalPayment}</td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Add / Save / Close */}
        <div className="flex justify-between gap-2 mt-4">
          <button
            className="btn btn-sm"
            onClick={() => {
              const newId = installments.length
                ? Number(installments[installments.length - 1].id) + 1
                : 1;
              setInstallments([
                ...installments,
                { id: newId, date: "", amount: 0, details: "" },
              ]);
            }}
          >
            + Add Installment
          </button>
          <div>
            <button className="mr-2 btn-outline btn" onClick={onClose}>
              Close
            </button>
            <button
              className="btn btn-primary"
              onClick={async () => {
                const updates = {};
                installments.forEach((inst) => {
                  updates[`payment${inst.id}Date`] = inst.date;
                  updates[`payment${inst.id}Amount`] = inst.amount;
                  updates[`payment${inst.id}Details`] = inst.details;
                });
                try {
                  await axiosPublic.patch(`/members/${member._id}`, updates);
                  toast.success("Installments updated");
                  refetch();
                  onClose();
                } catch {
                  toast.error("Failed to update");
                }
              }}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberDetailsModal;
