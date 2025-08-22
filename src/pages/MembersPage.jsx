// ✅ MembersPage.jsx
import React, { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosPublic from "../axios/AxiosPublic";
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
}) => (
  <Document>
    <Page size="A4" orientation="landscape" style={styles.page}>
      <Text style={styles.header}>Members Report</Text>
      <Text style={styles.subHeader}>Date: {formattedDate}</Text>

      <View style={styles.table}>
        {/* Header Row */}
        <View style={styles.row}>
          {headers.map((h, i) => (
            <Text
              key={i}
              style={[styles.cell, styles.headerCell, { width: colWidth }]}
            >
              {h}
            </Text>
          ))}
        </View>

        {/* Body Rows */}
        {members.map((m, idx) => {
          const totalPaid = calculateTotalPaid(m);
          const due = calculateDue(m);

          return (
            <View key={idx} style={styles.row}>
              <Text style={[styles.cell, { width: colWidth }]}>{idx + 1}</Text>
              <Text style={[styles.cell, { width: colWidth }]}>
                {formattedDate}
              </Text>
              <Text style={[styles.cell, { width: colWidth }]}>{m.name}</Text>
              <Text style={[styles.cell, { width: colWidth }]}>{m.phone}</Text>
              <Text style={[styles.cell, { width: colWidth }]}>
                {m.subscription || 0}
              </Text>
              <Text style={[styles.cell, { width: colWidth }]}>
                {totalPaid || 0}
              </Text>
              <Text style={[styles.cell, { width: colWidth }]}>{due || 0}</Text>
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

  const defaultSubscription = 300000;
  const calculateTotalPaid = (member) =>
    Object.keys(member)
      .filter((k) => k.startsWith("payment") && k.endsWith("Amount"))
      .reduce((sum, k) => sum + (member[k] || 0), 0);

  const calculateDue = (member) =>
    defaultSubscription - calculateTotalPaid(member);

  const deleteMutation = useMutation({
    mutationFn: async (id) => await axiosPublic.delete(`/members/${id}`),
    onSuccess: () => {
      toast.success("Member deleted");
      queryClient.invalidateQueries(["members"]);
    },
  });

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
    if (result.isConfirmed) deleteMutation.mutate(id);
  };

 const handleDownloadExcel = () => {
   if (members.length === 0) return toast.error("No members to export");

   // Build rows just like your table
   const rows = members.map((m, i) => {
     const totalPaid = calculateTotalPaid(m);
     const due = calculateDue(m);
     return {
       SL: i + 1,
       Name: m.name,
       Phone: m.phone,
       Subscription: m.subscription,
       "Total Paid": totalPaid || 0,
       "Ind. Due": due,
     };
   });

   // Convert rows -> sheet
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

  return (
    <div className="space-y-4">
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
      {/* Members Table */}
      <div className="bg-white shadow rounded overflow-x-auto">
        <table className="table table-zebra w-full">
          <thead>
            <tr className="bg-base-200">
              <th>#</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Subscription</th>
              <th>Total Pmt</th>
              <th>Ind. Due</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m, i) => {
              const totalPaid = calculateTotalPaid(m);
              const due = calculateDue(m);
              return (
                <tr key={m._id}>
                  <td>{i + 1}</td>
                  <td>{m.name}</td>
                  <td>{m.phone}</td>
                  <td>{m.subscription}</td>
                  <td className="font-semibold text-green-600">
                    {totalPaid || 0}
                  </td>
                  <td className="font-semibold text-red-600">{due}</td>
                  <td>
                    <button
                      className="btn-outline btn btn-sm"
                      onClick={() => setModalData(m)}
                    >
                      Edit
                    </button>
                    <button
                      className="ml-2 btn btn-error btn-sm"
                      onClick={() => handleDelete(m._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {/* Excel Preview Modal */}
      {showExcelPreview && (
        <div className="z-50 fixed inset-0 flex justify-center items-center bg-black/60 p-4">
          <div className="bg-white p-6 rounded-lg w-full h-full overflow-auto">
            <h2 className="mb-4 font-bold text-lg">📊 Excel Preview</h2>
            <table className="border w-full text-sm border-collapse table-auto">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-2 py-1 border">SL</th>
                  <th className="px-2 py-1 border">Name</th>
                  <th className="px-2 py-1 border">Phone</th>
                  <th className="px-2 py-1 border">Subscription</th>
                  <th className="px-2 py-1 border">Total Paid</th>
                  <th className="px-2 py-1 border">Ind. Due</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m, i) => {
                  const totalPaid = calculateTotalPaid(m);
                  const due = calculateDue(m);
                  return (
                    <tr key={m._id}>
                      <td className="px-2 py-1 border">{i + 1}</td>
                      <td className="px-2 py-1 border">{m.name}</td>
                      <td className="px-2 py-1 border">{m.phone}</td>
                      <td className="px-2 py-1 border">{m.subscription}</td>
                      <td className="px-2 py-1 border font-semibold text-green-600">
                        {totalPaid || 0}
                      </td>
                      <td className="px-2 py-1 border font-semibold text-red-600">
                        {due}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="flex justify-end gap-2 mt-4">
              <button
                className="btn-outline btn"
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
        <MemberModal data={modalData} closeModal={() => setModalData(null)} />
      )}
    </div>
  );
};

export default MembersPage;
