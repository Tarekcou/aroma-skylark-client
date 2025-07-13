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
    const cashOut = entries
      .filter((e) => e.type === "cash-out")
      .reduce((sum, e) => sum + e.amount, 0);
    const netBalance = totalInstallmentCashIn - cashOut;
  return (
    <div className="gap-4 grid grid-cols-1 md:grid-cols-3">
      <div className="bg-green-100 shadow p-2 md:p-4 card">
        <p className="text-gray-500 text-sm">Total Balance</p>
        <h2 className="font-bold text-green-700 text-2xl">
          <FaPlus /> {totalInstallmentCashIn}
        </h2>
      </div>
      <div className="bg-red-100 shadow p-2 md:p-4 card">
        <p className="text-gray-500 text-sm">Total Expences</p>
        <h2 className="font-bold text-red-700 text-2xl">
          <FaMinus /> {cashOut}
        </h2>
      </div>
      <div className="bg-blue-100 shadow p-2 md:p-4 card">
        <p className="text-gray-500 text-sm">Net Balance</p>
        <h2 className="font-bold text-blue-700 text-2xl">
          <FaEquals /> {netBalance}
        </h2>
      </div>
    </div>
  );
}

export default SummaryCard