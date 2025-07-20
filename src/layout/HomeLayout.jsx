import React, { useMemo } from 'react'
import Hero from '../components/Hero'
import { Outlet } from 'react-router'
import Footer from '../components/Footer'
import Navbar from '../components/Navbar'
import ContactPage from '../pages/ContactPage'
import FaqSection from '../components/FaqSection'
import DailyExpenseChart from '../components/charts/DailyExpenseChart'
import MonthlyCategoryPieChart from '../components/charts/MonthlyCategoryPieChart'
import axiosPublic from '../axios/AxiosPublic'
import { useQuery } from '@tanstack/react-query'

const HomeLayout = () => {
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

  // Memoize processed data for charts
  const dailyExpenses = useMemo(() => {
    if (!entries.length) return [];
    return entries
      .filter((e) => e.type === "cash-out")
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
      .filter((e) => e.type === "cash-out")
      .reduce((acc, curr) => {
        const found = acc.find((d) => d.category === curr.category);
        if (found) found.amount += curr.amount;
        else acc.push({ category: curr.category, amount: curr.amount });
        return acc;
      }, []);
  }, [entries]);
  return (
    <div>
      <Navbar />
      {/* <Hero /> */}
      <div className="mx-auto mt-24 mb-10 w-11/12 min-h-screen">
        <Outlet />
      </div>
      {/* <FaqSection />
      <div className="space-y-2 mx-auto my-6 mt-10 w-11/12 md:w-10/12">
      <h1 className='font-bold text-2xl md:text-3xl text-center'>Expenses Graphical Representation</h1>
        <DailyExpenseChart data={dailyExpenses} />
        <MonthlyCategoryPieChart data={monthlyCategoryExpenses} />
      </div> */}

      {/* <ContactPage /> */}

      <Footer />
    </div>
  );
}

export default HomeLayout