import React, { useEffect, useRef, useState } from "react";
import { Capability, TaskOrder } from "./data-manipulation";
import domtoimage from "dom-to-image";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import "react-tooltip/dist/react-tooltip.css";
import { Button } from "@/components/ui/button";

export default function Roadmap({ taskOrders }: { taskOrders: TaskOrder[] }) {
  const [startingYear, setStartingYear] = useState(new Date().getFullYear());
  const nextEightQuarters = getNextEightQuarters(startingYear);

  function getNextEightQuarters(year: number) {
    const lastTwoDigits = year.toString().slice(2);
    const lastTwoDigitsAsNumber = parseInt(lastTwoDigits);

    return [
      `FY${lastTwoDigits}Q1`,
      `FY${lastTwoDigits}Q2`,
      `FY${lastTwoDigits}Q3`,
      `FY${lastTwoDigits}Q4`,
      `FY${lastTwoDigitsAsNumber + 1}Q1`,
      `FY${lastTwoDigitsAsNumber + 1}Q2`,
      `FY${lastTwoDigitsAsNumber + 1}Q3`,
      `FY${lastTwoDigitsAsNumber + 1}Q4`,
    ];
  }

  const componentRef = useRef<HTMLDivElement>(null);

  async function handleScreenshot(e: any) {
    e.preventDefault();
    if (componentRef.current) {
      try {
        const dataUrl = await domtoimage.toPng(componentRef.current);

        // Create a link to download the image
        const link = document.createElement("a");
        link.download = "screenshot.png";
        link.href = dataUrl;
        link.click();
      } catch (error) {
        console.error("Error taking screenshot:", error);
      }
    }
  }

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const year = parseInt(e.target.value);
    setStartingYear(year);
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <label htmlFor="year-input" className="mr-2 mx-2">
            Starting Year:
          </label>
          <input
            id="year-input"
            type="number"
            value={startingYear}
            onChange={handleYearChange}
            className="border px-2 py-1 rounded"
          />
        </div>
        <Button
          onClick={handleScreenshot}
        >
          Save as Image
        </Button>
      </div>
      <div ref={componentRef}>
        <Title
          startingYear={startingYear}
        />
        <HeaderRow nextEightQuarters={nextEightQuarters} />
        {taskOrders
          ? taskOrders.map((to, index) => (
            <TaskOrderDisplay
              key={index}
              taskOrder={to}
              index={index}
              nextEightQuarters={nextEightQuarters}
            />
          ))
          : null}
      </div>
    </div>
  );
}

function Title({
  startingYear,
}: {
  startingYear: number;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const previousYear = startingYear - 1;
  const nextYear = startingYear + 1;

  const defaultTitle = `Roadmap: October ${previousYear} - October ${nextYear}`;

  const handleTitleClick = () => {
    setIsEditing(true);
    setTitle(defaultTitle);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleTitleBlur = () => {
    if (inputRef.current && inputRef.current.value.trim() === "") {
      setTitle("");
    }
    setIsEditing(false);
  };

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  return (
    <form className="text-4xl w-full px-5">
      <div className="flex flex-row justify-between w-full">
        <div className="flex flex-row flex-1">
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={title}
              onChange={handleTitleChange}
              onBlur={handleTitleBlur}
              className="font-bold m-2 bg-transparent focus:outline-none w-full"
            />
          ) : (
            <div
              className="font-bold m-2 cursor-text"
              onClick={handleTitleClick}
            >
              {title || defaultTitle}
            </div>
          )}
        </div>
      </div>
    </form>
  );
}

function HeaderRow({ nextEightQuarters }: { nextEightQuarters: string[] }) {

  return (
    <div className="h-8 flex flex-row">
      <div className="flex-1"></div>
      <div
        className="flex-1 flex flex-col text-white text-center rounded-md"
        style={{ backgroundColor: "#4C1D95" }}
      >
        {nextEightQuarters[0]}
      </div>
      <div
        className="flex-1 flex flex-col text-white text-center rounded-md"
        style={{ backgroundColor: "#000080" }}
      >
        {nextEightQuarters[1]}
      </div>
      <div
        className="flex-1 flex flex-col text-white text-center rounded-md"
        style={{ backgroundColor: "#6022B1" }}
      >
        {nextEightQuarters[2]}
      </div>
      <div
        className="flex-1 flex flex-col text-white text-center rounded-md"
        style={{ backgroundColor: "#00008B" }}
      >
        {nextEightQuarters[3]}
      </div>
      <div
        className="flex-1 flex flex-col text-white text-center rounded-md"
        style={{ backgroundColor: "#4C1D95" }}
      >
        {nextEightQuarters[4]}
      </div>
      <div
        className="flex-1 flex flex-col text-white text-center rounded-md"
        style={{ backgroundColor: "#000080" }}
      >
        {nextEightQuarters[5]}
      </div>
      <div
        className="flex-1 flex flex-col text-white text-center rounded-md"
        style={{ backgroundColor: "#6022B1" }}
      >
        {nextEightQuarters[6]}
      </div>
      <div
        className="flex-1 flex flex-col text-white text-center rounded-md"
        style={{ backgroundColor: "#00008B" }}
      >
        {nextEightQuarters[7]}
      </div>
    </div>
  );
}

function TaskOrderDisplay({
  taskOrder,
  index,
  nextEightQuarters,
}: {
  taskOrder: TaskOrder;
  index: number;
  nextEightQuarters: string[];
}) {
  const capabilities = taskOrder.portfolioEpics
    ? taskOrder.portfolioEpics.map((pe) => pe.capabilities).flat()
    : [];

  if (capabilities.length === 0) {
    return <></>;
  }

  function getShadeOfPurple(index: number) {
    let colorIndex = index % 4;
    const shadesOfPurple = [
      "#4C1D95",
      "#000080",
      "#6022B1",
      "#00008B",
    ];
    return shadesOfPurple[colorIndex];
  }
  const color = getShadeOfPurple(index);
  const firstColumn = "1";
  const numberOfRows = capabilities.length;
  const gridRowForTaskOrder = `1 / ${2 + numberOfRows}`;

  return (
    <div
      className="flex-1 flex flex-row w-full border border-black rounded-md shadow-sm"
      key={index}
    >
      <div className="h-full w-full grid grid-cols-9">
        <div
          style={{
            gridColumn: firstColumn,
            gridRow: gridRowForTaskOrder,
            backgroundColor: color,
          }}
          className="flex items-center justify-center text-white rounded-md"
        >
          {taskOrder.name}
        </div>
        {capabilities.map((c, i) => (
          <CapabilityDisplay
            key={i}
            capability={c}
            index={i + 1}
            color={color}
            nextEightQuarters={nextEightQuarters}
          />
        ))}
      </div>
    </div>
  );
}

function CapabilityDisplay({
  capability,
  index,
  color,
  nextEightQuarters,
}: {
  capability: Capability;
  index: number;
  color: string;
  nextEightQuarters: string[];
}) {
  const gridRowIndex = index + 1;
  let gridRow = `${gridRowIndex} / ${gridRowIndex + 1}`;
  let gridColumn = getGridColumns(
    nextEightQuarters,
    capability.plannedStart,
    capability.plannedEnd
  );

  function getGridColumns(
    nextEightQuarters: string[],
    plannedStart: string,
    plannedEnd: string
  ) {
    if (!plannedStart || !plannedEnd) {
      return "";
    }

    const plannedStartParts = plannedStart.split("/");
    const plannedEndParts = plannedEnd.split("/");

    const plannedStartQuarter = `FY${plannedStartParts[2].slice(
      -2
    )}Q${Math.ceil(parseInt(plannedStartParts[0]) / 3)}`;
    const plannedEndQuarter = `FY${plannedEndParts[2].slice(-2)}Q${Math.ceil(
      parseInt(plannedEndParts[0]) / 3
    )}`;

    const beginningIndex = nextEightQuarters.findIndex(
      (quarter) => quarter === plannedStartQuarter
    );
    const endIndex = nextEightQuarters.findIndex(
      (quarter) => quarter === plannedEndQuarter
    );

    if (beginningIndex === -1 || endIndex === -1) {
      return "";
    }

    const gridColumn = `${beginningIndex + 2} / ${endIndex + 3}`;
    return gridColumn;
  }
  const epics: any = capability.epics;

  if (gridColumn === "") {
    return <></>;
  }

  return (
    <div
      className={`rounded-md text-xs border px-4 py-1 whitespace-normal flex flex-col items-center justify-center text-center`}
      style={{
        gridColumn: gridColumn,
        gridRow: gridRow,
        backgroundColor: color,
      }}
    >
      <HoverCard>
        <HoverCardTrigger asChild>
          <div className="text-white w-full ">
            {capability.name}
          </div>

        </HoverCardTrigger>
        <HoverCardContent className="w-96">
          <div className="font-bold text-lg">{capability.name}</div>
          <ul>
            {epics.map((epic: any, i: number) => (
              <li className="text-xs" key={i}>
                {epic?.name}
              </li>
            ))}
          </ul>
        </HoverCardContent>
      </HoverCard>
      <MileStones />
    </div>
  );
}

function MileStones() {
  const milestoneOptions = [
    'empty',
    'Capability Delivery',
    'Testing Milestone',
    'Security Milestone',
    'EPA Comm Milestone'
  ]

  const [milestones, setMilestones] = useState([
    'empty',
    'empty',
    'empty',
  ]);

  async function handleClick(index: number) {
    const newMilestones = [...milestones];
    newMilestones[index] = milestoneOptions[(milestoneOptions.indexOf(newMilestones[index]) + 1) % milestoneOptions.length];
    setMilestones(newMilestones);
  }

  return (
    <div className='w-full flex flex-row justify-between h-1.5 rounded-md'>
      {
        milestones.map((milestone, i) => (
          <div className="relative bottom-2.5 w-1 hover:cursor-pointer" onClick={() => handleClick(i)} key={i} >
            {milestone === 'empty' && <EmptyMilestone />}
            {milestone === 'Testing Milestone' && <TestingMilestone />}
            {milestone === 'Capability Delivery' && <CapabilityDelivery />}
            {milestone === 'Security Milestone' && <SecurityMilestone />}
            {milestone === 'EPA Comm Milestone' && <EPACommMilestone />}
          </div>
        ))
      }
    </div>
  )


  function EmptyMilestone() {
    //this one is a white invisible character in the center of the div
    const invisibleChar = '\u200B';

    return (
      <div className="flex justify-center text-2xl z-50 w-full items-center select-none">
        <TooltipProvider >
          <Tooltip delayDuration={10}>
            <TooltipTrigger>
              <div className="opacity-0">oooo</div>
            </TooltipTrigger>
            <TooltipContent>
              <div>Click to add milestone</div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    )
  }

  function TestingMilestone(){
    //this one is a yellow filled circle in the center of the div
    const circleChar = '\u25CF';
    return (
      <div className="flex justify-center text-2xl z-50 text-yellow-600  items-center select-none">
        <TooltipProvider >
          <Tooltip delayDuration={10}>
            <TooltipTrigger>
              <div>{circleChar}</div>
            </TooltipTrigger>
            <TooltipContent>
              <div>Testing Milestone</div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    )
  }
  function CapabilityDelivery() {
    //this one is an orange diamond in the center of the div
    const diamondChar = '\u25C6';
    return (
      <div className="flex justify-center text-2xl z-50 text-orange-600  items-center select-none">
        <TooltipProvider >
          <Tooltip delayDuration={10}>
            <TooltipTrigger>
              <div>{diamondChar}</div>
            </TooltipTrigger>
            <TooltipContent>
              <div>Capability Delivery</div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

    )
  }
  function SecurityMilestone() {
    //this one is a grey filled triangle in the center of the div
    const triangleChar = '\u25B2';
    return (

      <div className="flex justify-center text-2xl z-50 text-gray-600  items-center select-none">
        <TooltipProvider >
          <Tooltip delayDuration={10}>
            <TooltipTrigger>
              <div>{triangleChar}</div>
            </TooltipTrigger>
            <TooltipContent>
              <div>Security Milestone</div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    )
  }
  function EPACommMilestone() {
    //this one is a green filled square in the center of the div
    const squareChar = '\u25A0';
    return (
      <div className="flex justify-center text-2xl z-50 text-green-600  items-center select-none">
        <TooltipProvider >
          <Tooltip delayDuration={10}>
            <TooltipTrigger>
              <div>{squareChar}</div>
            </TooltipTrigger>
            <TooltipContent>
              <div>EPA Comm Milestone</div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    )
  }

}
