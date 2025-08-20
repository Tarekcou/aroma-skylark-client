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
import jsPDF from "jspdf";
import "jspdf-autotable";
import autoTable from "jspdf-autotable";   // ✅ add this
import { FaFileExcel, FaFilePdf } from "react-icons/fa";

const MembersPage = () => {
  const [modalData, setModalData] = useState(null);
  const queryClient = useQueryClient();

  const { refetch, data: members = [], isLoading } = useQuery({
    queryKey: ["members"],
    queryFn: async () => {
      const res = await axiosPublic.get("/members");
      console.log(res.data.members)
      return res.data.members || [];
    },
  });
  const [installments, setInstallments] = useState([]);
 const getInstallmentsFromMember = (member) => {
    const keys = Object.keys(member);
    const payments = keys.filter(
      (k) => k.startsWith("payment") && k.endsWith("Amount")
    );
    const numbers = payments.map((k) => k.match(/\d+/)?.[0]);
    const uniqueNumbers = Array.from(new Set(numbers)).sort((a, b) => +a - +b);
    return uniqueNumbers;
  };
  useEffect(() => {
    if (members.length > 0) {
      const allNumbers = members.flatMap(getInstallmentsFromMember);
      const uniqueSorted = Array.from(new Set(allNumbers)).sort(
        (a, b) => +a - +b
      );
      setInstallments(uniqueSorted);
    }
  }, [members]);

  // Add new installment column dynamically
  const handleAddInstallment = () => {
    const nextNumber = installments.length
      ? `${Number(installments[installments.length - 1]) + 1}`
      : "1";
    setInstallments((prev) => [...prev, nextNumber]);
  };

  const defaultSubscription = 300000;
 // Calculate totals
  const calculateTotalPaid = (member) => {
    return installments.reduce((sum, i) => {
      return sum + (member[`payment${i}Amount`] || 0);
    }, 0);
  };

  const calculateDue = (member) => {
    return defaultSubscription - calculateTotalPaid(member);
  };
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
      text: "This transaction will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    try {
      deleteMutation.mutate(id);
      if (refetch) refetch();
    } catch (err) {
      toast.error("Failed to delete entry");
    }
  };

  // 📌 Download as Excel
  const handleDownloadExcel = () => {
    if (members.length === 0) {
      toast.error("No members to export");
      return;
    }
    const worksheet = XLSX.utils.json_to_sheet(members);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Members");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const data = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });
    saveAs(data, "members.xlsx");
  };

  // 📌 Download as PDF
 // 📌 Download as PDF
const handleDownloadPDF = () => {
  const doc = new jsPDF();
  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-GB").replace(/\//g, "-");

  autoTable(doc, {
    startY: 25,
    head: [["#", "Date", "Name", "Phone", "Subscription", "Total Paid", "Due"]],
    body: members.map((m, i) => {
      const totalPaid = calculateTotalPaid(m);
      const due = calculateDue(m);

      return [
        i + 1,
        formattedDate,
        m.name,
        m.phone,
        m.subscription,
        totalPaid || 0,
        due,
      ];
    }),
    styles: {
      lineWidth: 0.2, // Border thickness
      lineColor: [0, 0, 0], // Black border
    },
    headStyles: {
      fillColor: [220, 220, 220], // Light gray background for header
      textColor: [0, 0, 0],
      lineWidth: 0.3,
      lineColor: [0, 0, 0],
    },
    tableLineWidth: 0.2,
    tableLineColor: [0, 0, 0],
  });

  doc.save(`members_${formattedDate}.pdf`);
};



  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="font-bold text-xl">👥 Members</h2>
        <div className="flex gap-2">
          <button
            onClick={handleDownloadPDF}
            className="btn btn-outline btn-sm"
          >
            <FaFilePdf  className="text-red-600"/> PDF
          </button>
          <button
            onClick={handleDownloadExcel}
            className="btn btn-outline btn-sm"
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
                  return  <tr key={m._id}>
                  <td>{i + 1}</td>
                  <td>{m.name}</td>
                  <td>{m.phone}</td>
                  <td>{m.subscription}</td>
                    <td className="font-semibold text-green-600">{totalPaid || 0}</td>
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
            }
            
              
            )}
          </tbody>
        </table>
      </div>

      <button
        onClick={() => setModalData({})}
        className="md:hidden bottom-0 left-1/2 z-30 absolute -translate-x-1/2 transform btn btn-primary btn-sm"
      >
        <MdAdd /> Add Member
      </button>

      {members.length === 0 && (
        <p className="flex justify-center items-center min-h-[50vh] text-gray-500 text-center">
          No Members found.
        </p>
      )}

      {modalData && (
        <MemberModal data={modalData} closeModal={() => setModalData(null)} />
      )}
    </div>
  );
};

export default MembersPage;
