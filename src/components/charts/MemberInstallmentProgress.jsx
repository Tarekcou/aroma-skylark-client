import React from "react";

const MemberInstallmentProgress = ({ members }) => {
  return (
    <div className="space-y-4 bg-white shadow p-4 rounded-xl">
      <h2 className="font-semibold text-lg">👥 Member Installment Progress</h2>
      {members.map(({ _id, name, subscription, installmentTotal }) => {
        const progress = subscription
          ? (installmentTotal / subscription) * 100
          : 0;
        return (
          <div key={_id}>
            <div className="flex justify-between mb-1">
              <span>{name}</span>
              <span>{progress.toFixed(0)}%</span>
            </div>
            <div className="bg-gray-200 rounded w-full h-4">
              <div
                className="bg-indigo-600 rounded h-4"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MemberInstallmentProgress;
