import React, { useState, useEffect } from 'react';
import { parseXLSFile, TaskOrder } from './data-manipulation';
import Roadmap from './Roadmap';


export default function MainApplicationPage() {

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [tableData, setTableData] = useState<TaskOrder[]>([]);

  // async function handleResetFileSelection() {
  //   setSelectedFile(null);
  // }

  useEffect(() => {
    async function fetchAndConvertData() {
      if(selectedFile){
        const results = await parseXLSFile(selectedFile);
        console.log(results)
        setTableData(results);
      }
    }
    fetchAndConvertData();
  }, [selectedFile])

  async function handleChange(event: any) {
    const file = event.target.files ? event.target.files[0] : null;
    setSelectedFile(file);
  }

  return (
    <div className='w-full h-full m-5'>
      <input type="file" id="fileInput" onChange={handleChange} accept=".xls,.xlsx" />
      {/* <button onClick={handleResetFileSelection}>Reset</button> */}
      {tableData.length === 0 ? 
        <div>No data</div> 
        : 
        <Roadmap taskOrders={tableData} />
      }
    </div>
  );
}