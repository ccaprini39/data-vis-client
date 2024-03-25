import React, { useRef } from "react";
import { Capability, TaskOrder } from "./data-manipulation";
import { Tooltip } from 'react-tooltip';
import html2canvas from "html2canvas";
import 'react-tooltip/dist/react-tooltip.css'

export default function Roadmap( {taskOrders} : { taskOrders : TaskOrder[]}) {
  const nextEightQuarters = getNextEightQuarters()
  function getNextEightQuarters() {
    //first get the date
    const today = new Date()
    //then get the current year
    const currentYear = today.getFullYear()
    //now get the last 2 digits of the year sliced from the string
    const lastTwoDigits = currentYear.toString().slice(2)
    const lastTwoDigitsAsNumber = parseInt(lastTwoDigits)
  
    return [
      `FY${lastTwoDigits}Q1`,
      `FY${lastTwoDigits}Q2`,
      `FY${lastTwoDigits}Q3`,
      `FY${lastTwoDigits}Q4`,
      `FY${lastTwoDigitsAsNumber + 1}Q1`,
      `FY${lastTwoDigitsAsNumber + 1}Q2`,
      `FY${lastTwoDigitsAsNumber + 1}Q3`,
      `FY${lastTwoDigitsAsNumber + 1}Q4`
    ]
  }

  const componentRef = useRef<HTMLDivElement>(null);

  async function handleScreenshot(e : any) {
    e.preventDefault();
    console.log('Taking screenshot')
    if (componentRef.current) {
      try {
        console.log('Taking screenshot')
        const canvas = await html2canvas(componentRef.current);
        // Create a link to download the canvas image
        const link = document.createElement('a');
        link.download = 'screenshot.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
      } catch (error) {
        console.error('Error taking screenshot:', error);
      }
    }
  }

  return (
    <div ref={componentRef} className='w-full h-full flex flex-col bg-slate-900'>
      <Title screenshotFunction={handleScreenshot} />
      <HeaderRow nextEightQuarters={nextEightQuarters} />
      {taskOrders ? taskOrders.map((to, index) => <TaskOrderDisplay key={index} taskOrder={to} index={index} nextEightQuarters={nextEightQuarters} />) : null}
    </div>
  )
}

function Title({screenshotFunction}: {screenshotFunction: (e : any) => void}) {
  const currentYear = new Date().getFullYear()
  const previousYear = currentYear - 1
  const nextYear = currentYear + 1

  return (
    <form
      className="text-4xl w-full px-5"
    >
      <div
        className="flex flex-row justify-between w-full"
      >
        <div className="flex flex-row">
          <div className="font-bold m-2">
            Roadmap:
          </div>
          <div
            className="m-2"
          >
            October {previousYear} - October {nextYear}
          </div>
        </div>
        <button 
          className="text-sm bg-blue-500 rounded-md p-1 m-2 hover:bg-blue-700 hover:text-white"
          onClick={screenshotFunction}
        >
          Save as Image
        </button>
      </div>
    </form>
  )
}

function HeaderRow({ nextEightQuarters }: { nextEightQuarters: string[] }) {
  return (
    <div
      className="h-8 flex flex-row"
    >
      <div className="flex-1"></div>
      <div className="flex-1 flex flex-col text-center rounded-md bg-purple-900">{nextEightQuarters[0]}</div>
      <div className="flex-1 flex flex-col text-center rounded-md bg-purple-700">{nextEightQuarters[1]}</div>
      <div className="flex-1 flex flex-col text-center rounded-md bg-purple-500">{nextEightQuarters[2]}</div>
      <div className="flex-1 flex flex-col text-center rounded-md bg-purple-300">{nextEightQuarters[3]}</div>
      <div className="flex-1 flex flex-col text-center rounded-md bg-purple-900">{nextEightQuarters[4]}</div>
      <div className="flex-1 flex flex-col text-center rounded-md bg-purple-700">{nextEightQuarters[5]}</div>
      <div className="flex-1 flex flex-col text-center rounded-md bg-purple-500">{nextEightQuarters[6]}</div>
      <div className="flex-1 flex flex-col text-center rounded-md bg-purple-300">{nextEightQuarters[7]}</div>
    </div>
  )
}

function TaskOrderDisplay({ taskOrder, index, nextEightQuarters }: { taskOrder: TaskOrder, index: number, nextEightQuarters: string[] }) {
  const capabilities = taskOrder.portfolioEpics.map(pe => pe.capabilities).flat()
  function getShadeOfPurple(index: number) {
    const shadesOfPurple = [
      "#4B0082", // Indigo
      "#9932CC", // DarkOrchid
      "#9370DB", // MediumPurple
      "#BA55D3", // MediumOrchid
      "#DA70D6", // Orchid
      "#EE82EE", // Violet
    ];
    return shadesOfPurple[index];
  }
  const color = getShadeOfPurple(index)
  const firstColumn = '1'
  const numberOfRows = capabilities.length
  const gridRowForTaskOrder = `1 / ${2 + numberOfRows}`

  return (
    <div className='flex-1 flex flex-row w-full'
      key={index}
    >
      <div className='h-full w-full grid grid-cols-9 bg-gray-800'>
        <div style={{ gridColumn: firstColumn, gridRow: gridRowForTaskOrder, backgroundColor: color }}>{taskOrder.name}</div>
        {capabilities.map((c, i) => <CapabilityDisplay key={i} capability={c} index={i + 1} color={color} nextEightQuarters={nextEightQuarters} />)}
      </div>
    </div>
  )
}

function CapabilityDisplay({ capability, index, color, nextEightQuarters }: { capability: Capability, index: number, color: string, nextEightQuarters: string[] }) {
  const gridRowIndex = index + 1
  let gridRow = `${gridRowIndex} / ${gridRowIndex + 1}`
  let gridColumn = getGridColumns(nextEightQuarters, capability.labels)
  function getGridColumns(
    getNextEightQuarters: string[],
    labels: string[]
  ) {
    const beginningQuarter = labels[0];
    const endQuarter = labels[labels.length - 1];
    const beginningIndex = getNextEightQuarters.indexOf(beginningQuarter);
    const endIndex = getNextEightQuarters.indexOf(endQuarter);
    const gridColumn = `${beginningIndex + 2} / ${endIndex + 3}`;
    return gridColumn;
  }
  if (gridColumn === '1 / 2') {
    return <></>
  }

  return (
    <div
      className='rounded-md m-0 text-xs border px-1 overflow-hidden'
      style={{
        gridColumn: gridColumn,
        gridRow: gridRow,
        backgroundColor: color
      }}>
      {capability.name}
      <div className="absolute text-xs rounded bg-black text-white p-1 bottom-full mb-2 group-hover:visible">
        text
      </div>
    </div>
  )

}