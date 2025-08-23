import React, { useState } from "react";
import axiosPublic from "../../axios/AxiosPublic";
import toast from "react-hot-toast";
import { MdDelete } from "react-icons/md";

const MemberDetailsModal = ({ member, onClose, refetch }) => {
  const [installments, setInstallments] = useState(() => {
    // extract installments from member object
    return Object.keys(member)
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
      .sort((a, b) => Number(a.id) - Number(b.id)); // sort ascending
  });

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
  // Remove from local state first
  setInstallments((prev) => prev.filter((i) => i.id !== id));

  // Prepare fields to remove in DB under 'unset'
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
    refetch(); // refetch fresh data from DB
  } catch (err) {
    toast.error("Failed to delete payment");
    console.error(err);
  }
};


  // calculate cumulative total
  const getCumulativeTotal = (idx) =>
    installments.slice(0, idx + 1).reduce((sum, i) => sum + (i.amount || 0), 0);

  const totalPayment = installments.reduce(
    (sum, i) => sum + (i.amount || 0),
    0
  );

  return (
    <div className="z-50 fixed inset-0 flex justify-center items-center bg-black/50 overflow-y-auto">
      <div className="bg-white p-6 rounded-lg w-full max-w-4xl">
        <h3 className="mb-4 font-bold">Details for {member.name}</h3>

        {/* ✅ Scrollable wrapper */}
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
                  <td className="font-semibold text-green-600">
                    {getCumulativeTotal(idx)}
                  </td>
                  <td>
                    <button onClick={() => handleDelete(i.id)}>
                      <MdDelete className="text-error text-lg btn-xs btn" />
                    </button>
                  </td>
                </tr>
              ))}

              {/* Footer Row */}
              <tr className="bg-gray-100 font-bold">
                <td colSpan={4} className="pr-2 text-right">
                  Total Payment
                </td>
                <td className="text-green-700">{totalPayment}</td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="flex justify-between mt-4">
          <button className="btn btn-sm" onClick={handleAdd}>
            + Add Installment
          </button>
          <div className="flex gap-2">
            <button className="btn-outline btn" onClick={onClose}>
              Close
            </button>
            <button className="btn btn-primary" onClick={handleSave}>
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberDetailsModal;
