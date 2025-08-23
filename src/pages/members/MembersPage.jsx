// ✅ MembersPage.jsx
import React, { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import MemberModal from "./MemberModal";
import Swal from "sweetalert2";
import { MdAdd } from "react-icons/md";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import { FaFileExcel, FaFilePdf } from "react-icons/fa";
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
import MemberDetailsModal from "./MembersDetailsModal";
import axiosPublic from "../../axios/AxiosPublic";

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
    marginBottom: 10,
    fontWeight: "bold",
  },
  subHeader: { fontSize: 12, marginBottom: 10 },
  headerCell: { backgroundColor: "#f0f0f0", fontWeight: "bold" },
});

// 🔹 Shared table headers
const headers = [
  "#",
  "Date",
  "Name",
  "Phone",
  "Subscription",
  "Total Paid",
  "Due",
];
const colWidth = `${100 / headers.length}%`;

// 🔹 Extracted Document component
const MyDocument = ({
  members,
  formattedDate,
  calculateTotalPaid,
  calculateDue,
  getSubscription,
}) => (
  <Document>
    <Page size="A4" orientation="landscape" style={styles.page}>
      <Text style={styles.header}>Members Report</Text>
      <Text style={styles.subHeader}>Date: {formattedDate}</Text>

      <View style={styles.table}>
        <View style={styles.row}>
          {[
            "#",
            "Date",
            "Name",
            "Phone",
            "Subscription",
            "Total Paid",
            "Due",
          ].map((h, i) => (
            <Text
              key={i}
              style={[styles.cell, styles.headerCell, { width: `${100 / 7}%` }]}
            >
              {h}
            </Text>
          ))}
        </View>

        {members.map((m, idx) => {
          const totalPaid = calculateTotalPaid(m);
          const due = calculateDue(m);
          return (
            <View key={m._id || idx} style={styles.row}>
              <Text style={[styles.cell, { width: `${100 / 7}%` }]}>
                {idx + 1}
              </Text>
              <Text style={[styles.cell, { width: `${100 / 7}%` }]}>
                {formattedDate}
              </Text>
              <Text style={[styles.cell, { width: `${100 / 7}%` }]}>
                {m.name}
              </Text>
              <Text style={[styles.cell, { width: `${100 / 7}%` }]}>
                {m.phone}
              </Text>
              <Text style={[styles.cell, { width: `${100 / 7}%` }]}>
                {getSubscription(m)}
              </Text>
              <Text style={[styles.cell, { width: `${100 / 7}%` }]}>
                {totalPaid}
              </Text>
              <Text style={[styles.cell, { width: `${100 / 7}%` }]}>{due}</Text>
            </View>
          );
        })}
      </View>
    </Page>
  </Document>
);


const MembersPage = () => {
  const [modalData, setModalData] = useState(null);
  const queryClient = useQueryClient();
  const [showExcelPreview, setShowExcelPreview] = useState(false);
  const [showPDFPreview, setShowPDFPreview] = useState(false);

  const { refetch, data: members = [] } = useQuery({
    queryKey: ["members"],
    queryFn: async () => (await axiosPublic.get("/members")).data.members || [],
  });
  // ---- helpers: use member subscription (fallback), coerce numbers safely
  const DEFAULT_SUBSCRIPTION = 300000;

  const getSubscription = (m) => {
    const raw = m?.subscription ?? DEFAULT_SUBSCRIPTION;
    const n = Number(raw);
    return Number.isFinite(n) ? n : 0;
  };

  const getAllPaymentAmounts = (m) =>
    Object.entries(m || {})
      .filter(([k]) => k.startsWith("payment") && k.endsWith("Amount"))
      .map(([, v]) => Number(v) || 0);

  const calculateTotalPaid = (m) =>
    getAllPaymentAmounts(m).reduce((sum, x) => sum + x, 0);

  const calculateDue = (m) => {
    const due = getSubscription(m) - calculateTotalPaid(m);
    // clamp at 0 if you don’t want negative dues; remove Math.max if you want to show overpayment
    return Math.max(0, due);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This member will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        // API request to delete
        const res = await axiosPublic.delete(`/members/${id}`);

        if (res.status === 200) {
          // Remove the deleted member from frontend state
          refetch();
          toast.success("Member deleted successfully");
        } else {
          toast.error("Failed to delete member");
        }
      } catch (err) {
        toast.error("Failed to delete member");
        console.error(err);
      }
    }
  };

  // Build Excel rows (same structure for preview + download)
  const buildExcelRows = () => {
    return members.map((m, i) => ({
      SL: i + 1,
      Name: m.name,
      Phone: m.phone,
      Subscription: getSubscription(m),
      "Total Paid": calculateTotalPaid(m),
      "Ind. Due": calculateDue(m),
    }));
  };

  const handleDownloadExcel = () => {
    if (members.length === 0) return toast.error("No members to export");

    const rows = buildExcelRows();

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Members");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    saveAs(
      new Blob([excelBuffer], { type: "application/octet-stream" }),
      "members.xlsx"
    );
  };

  const formattedDate = new Date()
    .toLocaleDateString("en-GB")
    .replace(/\//g, "-");

  const handleDownloadPDF = async () => {
    if (!members || members.length === 0)
      return toast.error("No members to export");
    const blob = await pdf(
      <MyDocument
        members={members}
        formattedDate={formattedDate}
        calculateTotalPaid={calculateTotalPaid}
        calculateDue={calculateDue}
      />
    ).toBlob();
    saveAs(blob, `members_${formattedDate}.pdf`);
  };
  const [selectedMember, setSelectedMember] = useState(null);

  return (
    <div className="space-y-4 overflow-x-auto">
      {/* Header + Buttons */}
      <div className="flex justify-between items-center">
        <h2 className="font-bold text-xl">👥 Members</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowPDFPreview(true)}
            className="btn-outline btn btn-sm"
          >
            <FaFilePdf className="text-red-600" /> PDF
          </button>
          <button
            onClick={() => setShowExcelPreview(true)}
            className="btn-outline btn btn-sm"
          >
            <FaFileExcel /> Excel
          </button>
          <button
            onClick={() => setModalData({})}
            className="hidden md:block btn btn-primary"
          >
            + Add Member
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="table table-zebra w-full">
          <thead>
            <tr className="bg-base-200">
              <th>#</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Subscription</th>
              <th>Total Paid</th>
              <th>Due</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m, idx) => (
              <tr
                key={m._id}
                className="hover:bg-gray-100 cursor-pointer"
                onClick={() => setSelectedMember(m)}
              >
                <td>{idx + 1}</td>
                <td>{m.name}</td>
                <td>{m.phone}</td>
                <td>{getSubscription(m)}</td>
                <td className="font-semibold text-green-600">
                  {calculateTotalPaid(m)}
                </td>
                <td className="font-semibold text-red-600">
                  {calculateDue(m)}
                </td>

                <td className="flex">
                  <button
                    className="btn-outline btn btn-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setModalData(m);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="ml-2 btn btn-error btn-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(m._id);
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Excel Preview Modal */}
      {showExcelPreview && (
        <div className="z-50 fixed inset-0 flex justify-center items-center bg-black/60 p-4">
          <div className="bg-white p-6 rounded-lg w-full h-[90vh] overflow-auto">
            <h2 className="mb-4 font-bold text-lg">📊 Excel Preview</h2>
            <table className="border w-full text-sm border-collapse table-auto">
              <thead>
                <tr className="bg-gray-100">
                  {Object.keys(buildExcelRows()[0]).map((key) => (
                    <th key={key} className="px-2 py-1 border">
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {buildExcelRows().map((row, idx) => (
                  <tr key={idx}>
                    {Object.values(row).map((val, i) => (
                      <td key={i} className="px-2 py-1 border">
                        {val}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-end gap-2 mt-4">
              <button
                className="btn-active btn"
                onClick={() => setShowExcelPreview(false)}
              >
                Close
              </button>
              <button className="btn btn-primary" onClick={handleDownloadExcel}>
                Download
              </button>
            </div>
          </div>
        </div>
      )}
      {/* PDF Preview Modal */}
      {showPDFPreview && (
        <div className="z-50 fixed inset-0 flex justify-center items-center bg-black/70 p-4">
          <div className="bg-white p-2 rounded-lg w-full h-[90vh]">
            <PDFViewer width="100%" height="100%">
              <MyDocument
                members={members}
                formattedDate={formattedDate}
                calculateTotalPaid={calculateTotalPaid}
                calculateDue={calculateDue}
                getSubscription={getSubscription}
              />
            </PDFViewer>
            <div className="right-10 bottom-10 absolute flex justify-end gap-2">
              <button
                className="btn-active btn"
                onClick={() => setShowPDFPreview(false)}
              >
                Close
              </button>
              <button className="btn btn-primary" onClick={handleDownloadPDF}>
                Download
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal */}
      {modalData && (
        <MemberModal
          data={modalData}
          closeModal={() => setModalData(null)}
          refetch={refetch}
        />
      )}
      {selectedMember && (
        <MemberDetailsModal
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
          refetch={refetch}
        />
      )}
    </div>
  );
};

export default MembersPage;
