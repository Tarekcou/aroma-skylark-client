import React from 'react'

const SummaryPage = () => {
  return (
      <div className="p-6 w-full md:w-1/2 max-w-3xl">
        <h2 className="mb-4 font-bold text-primary text-2xl">
          Transaction Summary
        </h2>
        <div className="overflow-x-auto">
          <table className="table table-zebra border w-full">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Remarks</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>2025-07-01</td>
                <td className="font-semibold text-green-600">Cash In</td>
                <td>10,000</td>
                <td>Owner A - 1st Installment</td>
                <td>10,000</td>
              </tr>
              <tr>
                <td>2025-07-02</td>
                <td className="font-semibold text-red-600">Cash Out</td>
                <td>3,000</td>
                <td>Steel purchase</td>
                <td>7,000</td>
              </tr>
              <tr>
                <td>2025-07-03</td>
                <td className="font-semibold text-green-600">Cash In</td>
                <td>5,000</td>
                <td>Owner B - 1st Installment</td>
                <td>12,000</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
  )
}

export default SummaryPage