import React, { useState } from "react";
import toast from "react-hot-toast";
import axiosPublic from "../axios/AxiosPublic";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const InstallmentEditModal = ({ member, installments, close }) => {
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState(() => {
    const data = {};
    installments.forEach((i) => {
      data[`payment${i}Date`] = member[`payment${i}Date`] || "";
      data[`payment${i}Amount`] = member[`payment${i}Amount`] || 0;
    });
    return data;
  });

  const mutation = useMutation({
    mutationFn: async (updated) =>
      await axiosPublic.patch(`/members/${member._id}`, updated),
    
    onSuccess: () => {
      toast.success("Installment updated");
      queryClient.invalidateQueries(["members"]);
      close();
      console.log(updated,formData)
    },
    onError: () => toast.error("Update failed"),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <div className="z-50 fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
      <div className="bg-white shadow-lg p-6 rounded-lg w-full max-w-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg">Edit Installments</h3>
          <button className="font-bold text-red-600 text-xl" onClick={close}>
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {installments.map((i) => (
            <div key={i} className="flex gap-2">
              <label className="flex flex-col w-1/2 text-sm">
                Payment {i} Date:
                <input
                  type="date"
                  className="input-bordered input"
                  value={formData[`payment${i}Date`]}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      [`payment${i}Date`]: e.target.value,
                    }))
                  }
                />
              </label>
              <label className="flex flex-col w-1/2 text-sm">
                Payment {i} Amount:
                <input
                  type="number"
                  className="input-bordered input"
                  value={formData[`payment${i}Amount`]}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      [`payment${i}Amount`]: Number(e.target.value),
                    }))
                  }
                />
              </label>
            </div>
          ))}
          <button className="w-full btn btn-primary" type="submit">
            Update Installments
          </button>
        </form>
      </div>
    </div>
  );
};

export default InstallmentEditModal;
