import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosPublic from "../axios/AxiosPublic";
import toast from "react-hot-toast";
import InstallmentEditModal from "./InstallmentEditModal";
import { MdAdd } from "react-icons/md";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const Installment = () => {
  const [editMember, setEditMember] = useState(null);

  // Get all members
  const { data: members = [], isLoading } = useQuery({
    queryKey: ["members"],
    queryFn: async () => {
      const res = await axiosPublic.get("/members");
      return res.data.members || [];
    },
  });

  const getInstallmentsFromMember = (member) => {
    const keys = Object.keys(member);
    const payments = keys.filter(
      (k) => k.startsWith("payment") && k.endsWith("Amount")
    );
    const numbers = payments.map((k) => k.match(/\d+/)?.[0]);
    const uniqueNumbers = Array.from(new Set(numbers)).sort((a, b) => +a - +b);
    return uniqueNumbers;
  };

  const [installments, setInstallments] = useState([]);

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

  // 📌 Download Excel
  const handleDownloadExcel = () => {
    if (members.length === 0) {
      toast.error("No members to export");
      return;
    }

    // Build data rows
    const rows = members.map((member, idx) => {
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

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Installments");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "installments.xlsx");
  };

  // 📌 Download PDF
  const handleDownloadPDF = () => {
    if (members.length === 0) {
      toast.error("No members to export");
      return;
    }

    const doc = new jsPDF("l", "pt", "a4"); // landscape for wide tables
    doc.text("Installment Collection", 40, 30);

    const head = [
      [
        "SL",
        "Flat Owner",
        "Subscription",
        ...installments.flatMap((i) => [`${i}-Date`, `${i}-Amount`]),
        "Total Paid",
        "Ind. Due",
      ],
    ];

    const body = members.map((member, idx) => [
      idx + 1,
      member.name,
      defaultSubscription,
      ...installments.flatMap((i) => [
        member[`payment${i}Date`] || "-",
        member[`payment${i}Amount`] || 0,
      ]),
      calculateTotalPaid(member),
      calculateDue(member),
    ]);

    autoTable(doc, {
      head,
      body,
      startY: 50,
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [41, 128, 185] },
    });

    doc.save("installments.pdf");
  };

  return (
    <div className="relative space-y-4">
      <div className="flex md:flex-row flex-col justify-between items-center gap-5">
        <h2 className="font-bold text-xl">💰 Construction Installment Collection</h2>
        <div className="flex gap-2">
          <button onClick={handleDownloadPDF} className="btn btn-sm btn-outline">
            ⬇ PDF
          </button>
          <button
            onClick={handleDownloadExcel}
            className="btn btn-sm btn-outline"
          >
            ⬇ Excel
          </button>
          <button onClick={handleAddInstallment} className="btn btn-sm btn-info">
            + Add Installment Column
          </button>
        </div>
      </div>

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
                  <td className="font-semibold text-green-600">{totalPaid || 0}</td>
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
  );
};

export default Installment;
