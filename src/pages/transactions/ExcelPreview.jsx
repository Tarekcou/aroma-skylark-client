import React, { useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const ExcelPreview = ({ entries = [], page = 1, itemsPerPage = 10 }) => {
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewData, setPreviewData] = useState([]);

  const preparePreview = () => {
    const worksheetData = entries.map((e, i) => ({
      "#": (page - 1) * itemsPerPage + i + 1,
      Date: new Date(e.date).toLocaleString("bn-BD"),
      Remarks: e.remarks || "-",
      Category: e.category || "-",
      Type: e.type || "-",
      PaymentMode: e.mode || "-",
      Amount: e.amount || "-",
      Balance: e.balance || "-",
      Expenses: e.expense || "-",
    }));

    const totalExpense = entries.reduce(
      (sum, e) => sum + Number(e.expense || 0),
      0
    );

    worksheetData.push({
      "#": "",
      Date: "",
      Remarks: "",
      Category: "",
      Type: "",
      PaymentMode: "Total Expense",
      Amount: "",
      Balance: "",
      Expenses: totalExpense,
    });

    setPreviewData(worksheetData);
    setPreviewVisible(true);
  };

  const downloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(previewData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "Transactions.xlsx");
  };

  return (
    <>
      <button className="btn-outline btn btn-sm" onClick={preparePreview}>
        Preview Excel
      </button>

      {previewVisible && (
        <div className="z-50 fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
          <div className="bg-white p-4 rounded w-[90vw] max-h-[80vh] overflow-auto">
            <h2 className="mb-4 font-bold text-xl">Excel Preview</h2>
            <table className="border w-full border-collapse">
              <thead>
                <tr>
                  {Object.keys(previewData[0]).map((key) => (
                    <th key={key} className="px-2 py-1 border">
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewData.map((row, i) => (
                  <tr key={i}>
                    {Object.values(row).map((val, j) => (
                      <td key={j} className="px-2 py-1 border text-center">
                        {val}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-end gap-2 mt-4">
              <button
                className="bg-gray-300 px-4 py-2 rounded"
                onClick={() => setPreviewVisible(false)}
              >
                Cancel
              </button>
              <button
                className="bg-green-500 px-4 py-2 rounded text-white"
                onClick={downloadExcel}
              >
                Download Excel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ExcelPreview;
