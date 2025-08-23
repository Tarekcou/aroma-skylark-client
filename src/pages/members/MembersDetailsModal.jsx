import React, { useState } from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFViewer,
  pdf,
} from "@react-pdf/renderer";
import { PDFDownloadLink } from "@react-pdf/renderer";
import axiosPublic from "../../axios/AxiosPublic";
import toast from "react-hot-toast";
import { MdDelete } from "react-icons/md";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

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

  const [showPDFPreview, setShowPDFPreview] = useState(false);
  const [showExcelPreview, setShowExcelPreview] = useState(false);
  const [excelData, setExcelData] = useState([]);

  const handleAdd = () => {
    const newId = installments.length
      ? Number(installments[installments.length - 1].id) + 1
      : 1;
    setInstallments([
      ...installments,
      { id: newId, date: "", amount: 0, details: "" },
    ]);
  };

  const handleSave = async () => {
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
  };

  const handleDelete = async (id) => {
    setInstallments((prev) => prev.filter((i) => i.id !== id));
    const updates = {
      unset: {
        [`payment${id}Date`]: 1,
        [`payment${id}Amount`]: 1,
        [`payment${id}Details`]: 1,
      },
    };
    try {
      await axiosPublic.patch(`/members/${member._id}`, updates);
      toast.success(`Payment ${id} deleted`);
      refetch();
    } catch {
      toast.error("Failed to delete payment");
    }
  };

  const getCumulativeTotal = (idx) =>
    installments.slice(0, idx + 1).reduce((sum, i) => sum + (i.amount || 0), 0);

  const totalPayment = installments.reduce(
    (sum, i) => sum + (i.amount || 0),
    0
  );

  const styles = StyleSheet.create({
    page: { padding: 20 },
    header: { fontSize: 18, marginBottom: 10, textAlign: "center" },
    table: {
      display: "table",
      width: "auto",
      borderStyle: "solid",
      borderWidth: 1,
      borderColor: "#000",
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

  const colWidths = [0.1, 0.2, 0.2, 0.3, 0.2]; // relative widths of columns

  {
    /* PDFDocument component */
  }
  const PDFDocument = ({
    member,
    installments,
    getCumulativeTotal,
    totalPayment,
  }) => (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>Payment Details - {member.name}</Text>
        <View style={styles.table}>
          {/* Header */}
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

          {/* Data rows */}
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

          {/* Total row */}
          <View style={styles.tableRow}>
            <View style={{ ...styles.tableCol, flex: colWidths[0] }}>
              <Text style={styles.tableCell}>Total</Text>
            </View>
            <View style={{ ...styles.tableCol, flex: colWidths[1] }}></View>
            <View style={{ ...styles.tableCol, flex: colWidths[2] }}>
              <Text style={styles.tableCell}>{totalPayment}</Text>
            </View>
            <View style={{ ...styles.tableCol, flex: colWidths[3] }}></View>
            <View style={{ ...styles.tableCol, flex: colWidths[4] }}></View>
          </View>
        </View>
      </Page>
    </Document>
  );



  const handleDownloadPDF = async () => {
    const blob = await pdf(PDFDocument).toBlob();
    saveAs(blob, `${member.name}-payments.pdf`);
  };

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
    setShowExcelPreview(true);
  };

  const downloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Payments");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, `${member.name}-payments.xlsx`);
  };

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  return (
    <div className="z-50 fixed inset-0 flex justify-center items-center bg-black/50 p-2 overflow-y-auto">
      <div className="flex flex-col gap-4 bg-white p-4 rounded-lg w-full max-w-5xl">
        <h3 className="font-bold text-lg">Details for {member.name}</h3>
        {/* <div className="flex gap-2">
          <button
            className="btn-outline btn btn-sm"
            onClick={async () => {
              if (isMobile) {
                // Mobile → generate + open externally
                const blob = await pdf(MyPDFDoc).toBlob();
                const url = URL.createObjectURL(blob);
                window.open(url); // opens in Google Drive, Adobe, etc.
              } else {
                // Desktop → show preview modal
                setShowPDFPreview(true);
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
        </div> */}
        <div className="flex justify-end">
          <button
            className="btn-outline btn btn-sm"
            onClick={() =>
              isMobile ? handleDownloadPDF() : setShowPDFPreview(true)
            }
          >
            Preview / Export PDF
          </button>

          <button className="btn-outline btn btn-sm" onClick={prepareExcel}>
            Preview / Export Excel
          </button>
        </div>

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

        {/* Buttons */}
        <div className="flex flex-wrap justify-between gap-2 mt-4">
          <button className="btn btn-sm" onClick={handleAdd}>
            + Add Installment
          </button>

          <div>
            <button className="btn-outline btn" onClick={onClose}>
              Close
            </button>
            <button className="btn btn-primary" onClick={handleSave}>
              Save
            </button>
          </div>
        </div>

        {/* PDF Preview Modal */}
        {showPDFPreview && !isMobile && (
          <div className="z-50 fixed inset-0 flex justify-center items-center bg-black/70 p-4">
            <div className="relative bg-white p-2 rounded-lg w-full h-[90vh]">
              <PDFViewer width="100%" height="100%">
                <PDFDocument
                  member={member}
                  installments={installments}
                  getCumulativeTotal={getCumulativeTotal}
                  totalPayment={totalPayment}
                />
              </PDFViewer>
              <div className="right-4 bottom-4 absolute flex gap-2">
                <button className="btn btn-primary" onClick={handleDownloadPDF}>
                  Download PDF
                </button>
                <button
                  className="btn-active btn"
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
                  onClick={() => setShowExcelPreview(false)}
                >
                  Close
                </button>
                <button className="btn btn-success" onClick={downloadExcel}>
                  Download Excel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberDetailsModal;
