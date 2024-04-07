import React, { useState, useEffect } from "react";
import { parseXLSFile, TaskOrder } from "./data-manipulation";
import Roadmap from "./Roadmap";
import { ModeToggle } from "@/components/ModeToggleButton";

export default function MainApplicationPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [tableData, setTableData] = useState<TaskOrder[]>([]);

  async function handleResetFileSelection() {
    //reload to /
    window.location.reload();
  }

  useEffect(() => {
    async function fetchAndConvertData() {
      if (selectedFile) {
        const results = await parseXLSFile(selectedFile);
        console.log(results);
        setTableData(results);
      }
    }
    fetchAndConvertData();
  }, [selectedFile]);

  async function handleChange(event: any) {
    const file = event.target.files ? event.target.files[0] : null;
    setSelectedFile(file);
  }

  return (
    <div className="w-full h-full m-5">
      <div className="w-full flex justify-between">
        <label htmlFor="fileInput" className="block">
          <span className="sr-only">Choose file</span>
          <input
            type="file"
            id="fileInput"
            onChange={handleChange}
            accept=".xls,.xlsx"
            className="block w-full mb-4 mx-2 text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-gray-300"
          />
        </label>
        <button
          className="px-4 py-2 mb-4 text-sm font-medium text-white bg-purple-500 rounded-md hover:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          onClick={handleResetFileSelection}
        >
          Reset
        </button>
        <ModeToggle />
      </div>
      {tableData.length === 0 ? (
        <div className="mx-4">No data</div>
      ) : (
        <Roadmap taskOrders={tableData} />
      )}
    </div>
  );
}
