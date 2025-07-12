import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const ProductStockBarChart = ({ data }) => {
  return (
    <div className="bg-white shadow p-4 rounded-xl">
      <h2 className="mb-4 font-semibold text-lg">📦 Product Stock Levels</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="stock" fill="#10b981" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProductStockBarChart;
