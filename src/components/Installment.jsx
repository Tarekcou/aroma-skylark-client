import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosPublic from "../axios/AxiosPublic";
import toast from "react-hot-toast";
import InstallmentEditModal from "./InstallmentEditModal";

const Installment = () => {
  const [installments, setInstallments] = useState(["1", "2", "3"]);
const [editMember, setEditMember] = useState(null);

  // Get all members
  const { data: members = [], isLoading } = useQuery({
    queryKey: ["members"],
    queryFn: async () => {
      const res = await axiosPublic.get("/members");
      return res.data.members || [];
    },
  });

  // Add new installment column dynamically
  const handleAddInstallment = () => {
    setInstallments((prev) => [...prev, `${prev.length + 1}`]);
  };

  // Sample default value for subscription
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

  return (
    <div className="space-y-4 p-4">
      <div className="flex justify-between items-center">
        <h2 className="font-bold text-xl">
          💰 Construction Installment Collection
        </h2>
        <button onClick={handleAddInstallment} className="btn btn-sm btn-info">
          + Add Installment Column
        </button>
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
          <p className="mt-4 text-gray-500 text-center">
            No members found in database.
          </p>
        )}
      </div>
    </div>
  );
};

export default Installment;
