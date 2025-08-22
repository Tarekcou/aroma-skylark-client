import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosPublic from "../axios/AxiosPublic"; // make sure import is correct

import DailyExpenseChart from "../components/charts/DailyExpenseChart";
import MonthlyCategoryPieChart from "../components/charts/MonthlyCategoryPieChart";
import ProductStockBarChart from "../components/charts/ProductStockBarChart";
import MemberInstallmentProgress from "../components/charts/MemberInstallmentProgress";
import ExpenseModePieChart from "../components/charts/ExpenseModePieChart";

const Dashboard = () => {
  const {
    data: entries = [],
    isLoading: loadingEntries,
    error: errorEntries,
  } = useQuery({
    queryKey: ["entries"],
    queryFn: async () => {
      const res = await axiosPublic.get("/entries");
      return res.data.entries || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const {
    data: products = [],
    isLoading: loadingProducts,
    error: errorProducts,
  } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await axiosPublic.get("/products");
      return res.data.products || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const {
    data: members = [],
    isLoading: loadingMembers,
    error: errorMembers,
  } = useQuery({
    queryKey: ["members"],
    queryFn: async () => {
      const res = await axiosPublic.get("/members");
      return res.data.members || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  // Memoize processed data for charts
  const dailyExpenses = useMemo(() => {
    if (!entries.length) return [];
    return entries
      .reduce((acc, curr) => {
        const found = acc.find((d) => d.date === curr.date);
        if (found) found.amount += curr.amount;
        else acc.push({ date: curr.date, amount: curr.amount });
        return acc;
      }, [])
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [entries]);

  const monthlyCategoryExpenses = useMemo(() => {
    if (!entries.length) return [];
    return entries
      .reduce((acc, curr) => {
        const found = acc.find((d) => d.category === curr.category);
        if (found) found.amount += curr.amount;
        else acc.push({ category: curr.category, amount: curr.amount });
        return acc;
      }, []);
  }, [entries]);

  const expenseModeSummary = useMemo(() => {
    if (!entries.length) return [];
    return entries
      .reduce((acc, curr) => {
        const found = acc.find((d) => d.mode === curr.mode);
        if (found) found.amount += curr.amount;
        else acc.push({ mode: curr.mode, amount: curr.amount });
        return acc;
      }, []);
  }, [entries]);

  if (loadingEntries || loadingProducts || loadingMembers) {
    return <div>Loading dashboard data...</div>;
  }

  if (errorEntries || errorProducts || errorMembers) {
    return <div>Error loading dashboard data.</div>;
  }

  return (
    <div className="space-y-8 p-4">
      <DailyExpenseChart data={dailyExpenses} />
      <MonthlyCategoryPieChart data={monthlyCategoryExpenses} />
      <ProductStockBarChart data={products} />
      <MemberInstallmentProgress members={members} />
      <ExpenseModePieChart data={expenseModeSummary} />
    </div>
  );
};

export default Dashboard;
