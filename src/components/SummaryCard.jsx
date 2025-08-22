import { useQuery } from '@tanstack/react-query';
import React from 'react'
import axiosPublic from '../axios/AxiosPublic';
import { FaEquals, FaMinus, FaPlus } from 'react-icons/fa';

const SummaryCard = () => {
    const {
      data: entries = [],
      isLoading,
      isError,
      refetch,
    } = useQuery({
      queryKey: ["all-entries"],
      queryFn: async () => {
        const res = await axiosPublic.get("/entries");
        return res.data?.entries || [];
      },
    });
    const { data: members = [] } = useQuery({
      queryKey: ["members"],
      queryFn: async () => {
        const res = await axiosPublic.get("/members");
        return res.data.members || [];
      },
    });

    const totalInstallmentCashIn = members.reduce(
      (sum, m) => sum + (m.installmentTotal || 0),
      0
    );

    const totalCashOut = entries
      .reduce((sum, e) => sum + e.amount, 0);

    const netBalance = totalInstallmentCashIn - totalCashOut;

  return (
    <div>
      <h1 className="my-2 font-bold text-xl md:text-2xl">
        {" "}
        Transaction Summary:
      </h1>

      <div className="gap-4 grid grid-cols-1 md:grid-cols-3">
        <div className="flex justify-between bg-green-100 shadow p-2 md:p-4 md:card">
          <p className="text-gray-700 text-sm">Total Balance</p>
          <h2 className="font-bold text-green-700 text-2xl">
            <FaPlus /> {totalInstallmentCashIn}
          </h2>
        </div>
        <div className="flex justify-between bg-red-100 shadow p-2 md:p-4 md:card">
          <p className="text-gray-700 text-sm">Total Expences</p>
          <h2 className="font-bold text-red-700 text-2xl">
            <FaMinus /> {totalCashOut}
          </h2>
        </div>
        <div className="flex justify-between bg-blue-100 shadow p-2 md:p-4 md:card">
          <p className="text-gray-700 text-sm">Net Balance</p>
          <h2 className="font-bold text-blue-700 text-2xl">
            <FaEquals /> {netBalance}
          </h2>
        </div>
      </div>
    </div>
  );
}

export default SummaryCard