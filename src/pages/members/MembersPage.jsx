// ✅ MembersPage.jsx
import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import MemberModal from "./MemberModal";
import MemberDetailsModal from "./MembersDetailsModal";
import Swal from "sweetalert2";
import { FaFileExcel, FaFilePdf } from "react-icons/fa";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import axiosPublic from "../../axios/AxiosPublic";
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

// Register Bangla font
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
    marginBottom: 10,
    fontWeight: "bold",
  },
  subHeader: { fontSize: 12, marginBottom: 10 },
  headerCell: { backgroundColor: "#f0f0f0", fontWeight: "bold" },
});

// PDF Document Component
const MyPDFDoc = ({
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
        {members.map((m, idx) => (
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
              {calculateTotalPaid(m)}
            </Text>
            <Text style={[styles.cell, { width: `${100 / 7}%` }]}>
              {calculateDue(m)}
            </Text>
          </View>
        ))}
      </View>
    </Page>
  </Document>
);

const MembersPage = () => {
  const [modalData, setModalData] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showExcelPreview, setShowExcelPreview] = useState(false);
  const [showPDFPreview, setShowPDFPreview] = useState(false);

  const queryClient = useQueryClient();
  const { refetch, data: members = [] } = useQuery({
    queryKey: ["members"],
    queryFn: async () => (await axiosPublic.get("/members")).data.members || [],
  });

  const DEFAULT_SUBSCRIPTION = 300000;
  const getSubscription = (m) => {
    const n = Number(m?.subscription ?? DEFAULT_SUBSCRIPTION);
    return Number.isFinite(n) ? n : 0;
  };
  const getAllPaymentAmounts = (m) =>
    Object.entries(m || {})
      .filter(([k]) => k.startsWith("payment") && k.endsWith("Amount"))
      .map(([, v]) => Number(v) || 0);
  const calculateTotalPaid = (m) =>
    getAllPaymentAmounts(m).reduce((sum, x) => sum + x, 0);
  const calculateDue = (m) =>
    Math.max(0, getSubscription(m) - calculateTotalPaid(m));

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
        const res = await axiosPublic.delete(`/members/${id}`);
        if (res.status === 200) {
          refetch();
          toast.success("Member deleted successfully");
        } else toast.error("Failed to delete member");
      } catch (err) {
        toast.error("Failed to delete member");
        console.error(err);
      }
    }
  };

  const formattedDate = new Date()
    .toLocaleDateString("en-GB")
    .replace(/\//g, "-");
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  // PDF Download
  const handleDownloadPDF = async () => {
    if (!members.length) return toast.error("No members to export");
    const blob = await pdf(
      <MyPDFDoc
        members={members}
        formattedDate={formattedDate}
        calculateTotalPaid={calculateTotalPaid}
        calculateDue={calculateDue}
        getSubscription={getSubscription}
      />
    ).toBlob();
    saveAs(blob, `members_${formattedDate}.pdf`);
  };

  // Excel Build & Download
  const buildExcelRows = () =>
    members.map((m, i) => ({
      SL: i + 1,
      Name: m.name,
      Phone: m.phone,
      Subscription: getSubscription(m),
      "Total Paid": calculateTotalPaid(m),
      "Ind. Due": calculateDue(m),
    }));

  const handleDownloadExcel = () => {
    if (!members.length) return toast.error("No members to export");
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

  return (
    <div className="space-y-4 overflow-x-auto">
      {/* Header + Buttons */}
      <div className="flex justify-between items-center">
        <h2 className="font-bold text-xl">👥 Members</h2>
        <div className="flex gap-2">
          {/* PDF */}
          <button
            className="btn-outline btn btn-sm"
            onClick={async () => {
              if (isMobile) {
                const blob = await pdf(
                  <MyPDFDoc
                    members={members}
                    formattedDate={formattedDate}
                    calculateTotalPaid={calculateTotalPaid}
                    calculateDue={calculateDue}
                    getSubscription={getSubscription}
                  />
                ).toBlob();
                const url = URL.createObjectURL(blob);
                window.open(url); // open in mobile app
              } else {
                setShowPDFPreview(true); // Desktop preview modal
              }
            }}
          >
            <FaFilePdf className="mr-1" /> PDF
          </button>

          {/* Excel */}
          <button
            className="btn btn-secondary btn-sm"
            onClick={() =>
              isMobile ? handleDownloadExcel() : setShowExcelPreview(true)
            }
          >
            <FaFileExcel /> Excel
          </button>

          {/* Add Member */}
          <button
            onClick={() => setModalData({})}
            className="hidden md:block btn btn-primary"
          >
            + Add Member
          </button>
        </div>
      </div>

      {/* Members Table */}
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
      {showPDFPreview && !isMobile && (
        <div className="z-50 fixed inset-0 flex justify-center items-center bg-black/70 p-4">
          <div className="bg-white p-2 rounded-lg w-full h-[90vh]">
            <PDFViewer width="100%" height="100%">
              <MyPDFDoc
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

      {/* Modals */}
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
