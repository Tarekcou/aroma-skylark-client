import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosPublic from "../axios/AxiosPublic";
import InstallmentEditModal from "./InstallmentEditModal";
import * as XLSX from "xlsx";
import { FaFileExcel, FaFilePdf } from "react-icons/fa";
import {
  pdf,
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  PDFViewer,
} from "@react-pdf/renderer";
import { saveAs } from "file-saver";
import toast from "react-hot-toast";

// 🔹 Register Bangla/English font
Font.register({
  family: "NotoSans",
  src: "/fonts/NotoSansBengali-Regular.ttf",
});

const styles = StyleSheet.create({
  page: { padding: 20, fontSize: 10, fontFamily: "NotoSans" },
  header: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 10,
    fontWeight: "bold",
  },
  subHeader: { fontSize: 10, textAlign: "right", marginBottom: 15 },
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
    fontSize: 8,
    textAlign: "center",
    flexGrow: 1,
  },
  headCell: { fontWeight: "bold", backgroundColor: "#2980b9", color: "white" },
});

const Installment = () => {
  const [editMember, setEditMember] = useState(null);
  const [showExcelPreview, setShowExcelPreview] = useState(false);
  const [showPDFPreview, setShowPDFPreview] = useState(false);
  const [excelRows, setExcelRows] = useState([]);

  const { data: members = [], isLoading } = useQuery({
    queryKey: ["members"],
    queryFn: async () => {
      const res = await axiosPublic.get("/members");
      return res.data.members || [];
    },
  });

  const [installments, setInstallments] = useState([]);
  const defaultSubscription = 300000;

  useEffect(() => {
    if (members.length > 0) {
      const allNumbers = members.flatMap((member) =>
        Object.keys(member)
          .filter((k) => k.startsWith("payment") && k.endsWith("Amount"))
          .map((k) => k.match(/\d+/)?.[0])
      );
      const uniqueSorted = Array.from(new Set(allNumbers)).sort(
        (a, b) => +a - +b
      );
      setInstallments(uniqueSorted);
    }
  }, [members]);

  const handleAddInstallment = () => {
    const nextNumber = installments.length
      ? `${Number(installments[installments.length - 1]) + 1}`
      : "1";
    setInstallments((prev) => [...prev, nextNumber]);
  };

  const calculateTotalPaid = (member) =>
    installments.reduce(
      (sum, i) => sum + (member[`payment${i}Amount`] || 0),
      0
    );

  const calculateDue = (member) =>
    defaultSubscription - calculateTotalPaid(member);

  // 🔹 Prepare Excel rows
  const prepareExcelRows = () =>
    members.map((member, idx) => {
      const row = {
        SL: idx + 1,
        "Flat Owner": member.name,
        Subscription: defaultSubscription,
      };
      installments.forEach((i) => {
        row[`${i}-Payment Date`] = member[`payment${i}Date`] || "-";
        row[`${i}-Amount`] = member[`payment${i}Amount`] || 0;
      });
      row["Total Paid"] = calculateTotalPaid(member);
      row["Ind. Due"] = calculateDue(member);
      return row;
    });

  const handlePreviewExcel = () => {
    if (members.length === 0) {
      toast.error("No members to export");
      return;
    }
    setExcelRows(prepareExcelRows());
    setShowExcelPreview(true);
  };

  const handleDownloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(excelRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Installments");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, `transactions_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  // 🔹 PDF Document
  const today = new Date();
  const dateStr = today.toLocaleDateString("en-GB");
  const headers = [
    "SL",
    "Flat Owner",
    "Subscription",
    ...installments.flatMap((i) => [`${i} - Date`, `${i} - Amount`]),
    "Total Paid",
    "Ind. Due",
  ];
  const colWidth = `${100 / headers.length}%`;

  const MyDocument = (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <Text style={styles.header}>Installment Collection Report</Text>
        <Text style={styles.subHeader}>Date: {dateStr}</Text>

        <View style={styles.table}>
          {/* Header */}
          <View style={styles.row}>
            {headers.map((h, i) => (
              <Text
                key={i}
                style={[styles.cell, styles.headCell, { width: colWidth }]}
              >
                {h}
              </Text>
            ))}
          </View>
          {/* Rows */}
          {members.map((m, idx) => (
            <View key={idx} style={styles.row}>
              <Text style={[styles.cell, { width: colWidth }]}>{idx + 1}</Text>
              <Text style={[styles.cell, { width: colWidth }]}>{m.name}</Text>
              <Text style={[styles.cell, { width: colWidth }]}>
                {defaultSubscription}
              </Text>
              {installments.flatMap((i, k) => [
                <Text
                  key={`${idx}-d-${k}`}
                  style={[styles.cell, { width: colWidth }]}
                >
                  {m[`payment${i}Date`] || "-"}
                </Text>,
                <Text
                  key={`${idx}-a-${k}`}
                  style={[styles.cell, { width: colWidth }]}
                >
                  {m[`payment${i}Amount`] || 0}
                </Text>,
              ])}
              <Text style={[styles.cell, { width: colWidth }]}>
                {calculateTotalPaid(m)}
              </Text>
              <Text style={[styles.cell, { width: colWidth }]}>
                {calculateDue(m)}
              </Text>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );

  const handleDownloadPDF = async () => {
    const blob = await pdf(MyDocument).toBlob();
    saveAs(blob, `installments_${today.toISOString().split("T")[0]}.pdf`);
  };

  if (isLoading) return <p className="text-center">Loading...</p>;
  return (
    <div className="relative space-y-4">
      <div className="flex md:flex-row flex-col justify-between items-center gap-5">
        <h2 className="font-bold text-xl">
          💰 Construction Installment Collection
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowPDFPreview(true)}
            className="btn-outline btn btn-sm"
          >
            <FaFilePdf className="text-red-600" /> PDF
          </button>
          <button
            onClick={handlePreviewExcel}
            className="btn-outline btn btn-sm"
          >
            <FaFileExcel /> Excel
          </button>
          <button
            onClick={handleAddInstallment}
            className="btn btn-sm btn-info"
          >
            + Add Installment Column
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-auto">
        {/* your table remains same */}

        <div className="overflow-auto">
          <table className="table table-zebra w-full text-sm">
            <thead className="bg-base-200">
              <tr>
                <th>SL</th>
                <th>Flat Owner</th>
                <th>Subsc.</th>
                {installments.map((i) => (
                  <React.Fragment key={i}>
                    <th>{i}-Payment Date</th>
                    <th>{i}-Amount</th>
                  </React.Fragment>
                ))}
                <th>Total Pmt</th>
                <th>Ind. Due</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member, idx) => {
                const totalPaid = calculateTotalPaid(member);
                const due = calculateDue(member);

                return (
                  <tr key={member._id}>
                    <td>{idx + 1}</td>
                    <td>{member.name}</td>
                    <td>{defaultSubscription}</td>
                    {installments.map((i) => (
                      <React.Fragment key={i}>
                        <td>{member[`payment${i}Date`] || "-"}</td>
                        <td>{member[`payment${i}Amount`] || 0}</td>
                      </React.Fragment>
                    ))}
                    <td className="font-semibold text-green-600">
                      {totalPaid || 0}
                    </td>
                    <td className="font-semibold text-red-600">{due}</td>
                    <td>
                      <button
                        className="btn-outline btn btn-xs"
                        onClick={() => setEditMember(member)}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {editMember && (
            <InstallmentEditModal
              member={editMember}
              installments={installments}
              close={() => setEditMember(null)}
            />
          )}

          {!isLoading && members.length === 0 && (
            <p className="flex justify-center items-center min-h-[50vh] text-gray-500 text-center">
              Please add members before adding installment
            </p>
          )}
        </div>
      </div>

      {/* Excel Preview Modal */}
      {showExcelPreview && (
        <div className="z-50 fixed inset-0 flex justify-center items-center bg-black/70">
          <div className="bg-white p-4 rounded-lg w-full h-full overflow-auto">
            <h2 className="mb-2 font-bold text-lg">Excel Preview</h2>
            <table className="table table-sm border">
              <thead>
                <tr>
                  {Object.keys(excelRows[0] || {}).map((col) => (
                    <th key={col}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {excelRows.map((row, idx) => (
                  <tr key={idx}>
                    {Object.values(row).map((val, i) => (
                      <td key={i}>{val}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-end gap-2 mt-3">
              <button
                onClick={() => setShowExcelPreview(false)}
                className="btn-outline btn"
              >
                Close
              </button>
              <button onClick={handleDownloadExcel} className="btn btn-success">
                Download Excel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PDF Preview Modal */}
      {showPDFPreview && (
        <div className="z-50 fixed inset-0 flex justify-center items-center bg-black/70 p-2">
          <div className="flex flex-col bg-white rounded-lg w-full h-[95vh]">
            <PDFViewer width="100%" height="100%">
              {MyDocument}
            </PDFViewer>
            <div className="flex justify-end gap-2 p-2">
              <button
                onClick={() => setShowPDFPreview(false)}
                className="btn-outline btn"
              >
                Close
              </button>
              <button onClick={handleDownloadPDF} className="btn btn-primary">
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Installment;
