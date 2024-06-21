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
} from "@/components/ui/tooltip";
import "react-tooltip/dist/react-tooltip.css";
import { Button } from "@/components/ui/button";

export default function Roadmap({ taskOrders }: { taskOrders: TaskOrder[] }) {
  const [startingYear, setStartingYear] = useState(
    new Date().getFullYear().toString()
  );
  const [startingQuarter, setStartingQuarter] = useState("Q1");
  const [numberOfQuarters, setNumberOfQuarters] = useState(8);

  /**
   *
   * @param n number of quarters to get
   * @param year the year to start from
   * @param startingQuarter the quarter to start from
   */
  function getNextNQuarters(
    n: number,
    year: string,
    startingQuarter: string = "Q1"
  ) {
    const quarters = ["Q1", "Q2", "Q3", "Q4"];
    const selectedQuarters = [];
    let currentYear = parseInt(year);
    let currentYearString = currentYear.toString().slice(-2);
    let currentQuarter = startingQuarter;
    for (let i = 0; i < n; i++) {
      selectedQuarters.push(`FY${currentYearString}${currentQuarter}`);
      let nextQuarterIndex = quarters.indexOf(currentQuarter) + 1;
      if (nextQuarterIndex === 4) {
        currentYear++;
        currentYearString = currentYear.toString().slice(-2);
        currentQuarter = "Q1";
      } else {
        currentQuarter = quarters[nextQuarterIndex];
      }
    }
    return selectedQuarters;
  }
  const [selectedQuarters, setSelectedQuarters] = useState<string[]>(
    getNextNQuarters(8, "Q1", startingYear)
  );

  useEffect(() => {
    setSelectedQuarters(
      getNextNQuarters(numberOfQuarters, startingYear, startingQuarter)
    );
  }, [startingYear, startingQuarter, numberOfQuarters]);

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
    const yearString = year.toString();
    setStartingYear(yearString);
  };

  //so I want them to be abl to selct the starting, starting quarter, and then the number of quarters to display
  function QuarterSelector() {
    return (
      <div className="flex flex-row justify-between">
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
        <div>
          <label htmlFor="quarter-input" className="mr-2 mx-2">
            Starting Quarter:
          </label>
          <select
            id="quarter-input"
            className="border px-2 py-1 rounded"
            value={startingQuarter}
            onChange={(e) => setStartingQuarter(e.target.value)}
          >
            <option value="Q1">Q1</option>
            <option value="Q2">Q2</option>
            <option value="Q3">Q3</option>
            <option value="Q4">Q4</option>
          </select>
        </div>
        <div>
          <label htmlFor="quarters-input" className="mr-2 mx-2">
            Number of Quarters:
          </label>
          <select
            id="quarters-input"
            className="border px-2 py-1 rounded"
            value={numberOfQuarters}
            onChange={(e) => setNumberOfQuarters(parseInt(e.target.value))}
          >
            <option value="2">2</option>
            <option value="4">4</option>
            <option value="6">6</option>
            <option value="8">8</option>
            <option value="10">10</option>
            <option value="12">12</option>
            <option value="14">14</option>
            <option value="16">16</option>
          </select>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex justify-between items-center">
        <QuarterSelector />
        <Button onClick={handleScreenshot}>Save as Image</Button>
      </div>
      <div ref={componentRef}>
        <Title startingYear={parseInt(startingYear)} />
        <HeaderRow selectedQuarters={selectedQuarters} />
        {taskOrders
          ? taskOrders.map((to, index) => (
              <TaskOrderDisplay
                key={index}
                taskOrder={to}
                index={index}
                selectedQuarters={selectedQuarters}
              />
            ))
          : null}
      </div>
    </div>
  );
}

function Title({ startingYear }: { startingYear: number }) {
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

function HeaderRow({ selectedQuarters }: { selectedQuarters: string[] }) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [headerTitles, setHeaderTitles] = useState<string[]>(selectedQuarters);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setHeaderTitles(selectedQuarters);
  }, [selectedQuarters]);

  const handleHeaderClick = (index: number) => {
    setEditingIndex(index);
  };

  const handleHeaderChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const newHeaderTitles = [...headerTitles];
    newHeaderTitles[index] = e.target.value;
    setHeaderTitles(newHeaderTitles);
  };

  const handleHeaderBlur = () => {
    setEditingIndex(null);
  };

  useEffect(() => {
    if (editingIndex !== null && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingIndex]);

  function getBackgroundColor(index: number) {
    const colors = ["#4C1D95", "#000080", "#6022B1", "#00008B"];
    return colors[index % 4];
  }

  return (
    <div className="h-8 flex flex-row">
      <div className="flex-1"></div>
      {headerTitles.map((headerTitle, index) => (
        <div
          key={index}
          className="flex-1 flex flex-col text-white text-center rounded-md"
          style={{ backgroundColor: getBackgroundColor(index) }}
        >
          {editingIndex === index ? (
            <input
              ref={inputRef}
              type="text"
              value={headerTitle}
              onChange={(e) => handleHeaderChange(e, index)}
              onBlur={handleHeaderBlur}
              className="text-white bg-transparent focus:outline-none text-center"
            />
          ) : (
            <div
              className="cursor-text"
              onClick={() => handleHeaderClick(index)}
            >
              {headerTitle}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function TaskOrderDisplay({
  taskOrder,
  index,
  selectedQuarters,
}: {
  taskOrder: TaskOrder;
  index: number;
  selectedQuarters: string[];
}) {
  const capabilities = taskOrder.portfolioEpics
    ? taskOrder.portfolioEpics.map((pe) => pe.capabilities).flat()
    : [];

  if (capabilities.length === 0) {
    return <></>;
  }

  function getShadeOfPurple(index: number) {
    let colorIndex = index % 4;
    const shadesOfPurple = ["#4C1D95", "#000080", "#6022B1", "#00008B"];
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
      <div
        className="h-full w-full"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${
            selectedQuarters.length + 1
          }, minmax(0,1fr))`,
        }}
      >
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
            selectedQuarters={selectedQuarters}
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
  selectedQuarters,
}: {
  capability: Capability;
  index: number;
  color: string;
  selectedQuarters: string[];
}) {
  //check if the capability labels are in the selectedQuarters
  //if not, return an empty div
  if (!capability.labels || capability.labels.length === 0) {
    return <div></div>;
  }
  function checkIfAllLabelsAreInSelectedQuarters(
    selectedQuarters: string[],
    labels: string[]
  ) {
    return labels.every((label) => selectedQuarters.includes(label));
  }
  function checkIfAnyLabelsAreInSelectedQuarters(
    selectedQuarters: string[],
    labels: string[]
  ) {
    return labels.some((label) => selectedQuarters.includes(label));
  }

  if (
    !checkIfAnyLabelsAreInSelectedQuarters(selectedQuarters, capability.labels)
  ) {
    return <div></div>;
  }

  const gridRowIndex = index + 1;
  let gridRow = `${gridRowIndex} / ${gridRowIndex + 1}`;
  let gridColumn = getGridColumns(selectedQuarters, capability.labels);

  const sampleNextEightQuarters = [
    "FY22Q1",
    "FY22Q2",
    "FY22Q3",
    "FY22Q4",
    "FY23Q1",
    "FY23Q2",
    "FY23Q3",
    "FY23Q4",
  ];

  const sampleLabels = ["FY24Q1", "FY24Q2"];

  function getGridColumns(selectedQuarters: string[], labels: string[]) {
    const beginningLabel = labels[0];
    const endLabel = labels[labels.length - 1];

    let beginningIndex = selectedQuarters.indexOf(beginningLabel);
    if (beginningIndex === -1) {
      beginningIndex = 0;
    }
    console.log("selectedQuarters", selectedQuarters);
    console.log("beginningLabel", beginningLabel);
    console.log("beginningIndex", beginningIndex);

    const endIndex = selectedQuarters.indexOf(endLabel);

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
          <div className="text-white w-full ">{capability.name}</div>
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
          {/* <pre onClick={() => alert(capability)} className="text-xs">
            {JSON.stringify(capability, null, 2)}
          </pre> */}
        </HoverCardContent>
      </HoverCard>
      <MileStones />
    </div>
  );
}

function MileStones() {
  const milestoneOptions = [
    "empty",
    "Capability Delivery",
    "Testing Milestone",
    "Security Milestone",
    "EPA CommMilestone",
  ];

  const [milestones, setMilestones] = useState(["empty", "empty", "empty"]);
  async function handleClick(index: number) {
    const newMilestones = [...milestones];
    newMilestones[index] =
      milestoneOptions[
        (milestoneOptions.indexOf(newMilestones[index]) + 1) %
          milestoneOptions.length
      ];
    setMilestones(newMilestones);
  }
  return (
    <div className="w-full flex flex-row justify-between h-1.5 rounded-md">
      {milestones.map((milestone, i) => (
        <div
          className="relative bottom-2.5 w-1 hover:cursor-pointer"
          onClick={() => handleClick(i)}
          key={i}
        >
          {milestone === "empty" && <EmptyMilestone />}
          {milestone === "Testing Milestone" && <TestingMilestone />}
          {milestone === "Capability Delivery" && <CapabilityDelivery />}
          {milestone === "Security Milestone" && <SecurityMilestone />}
          {milestone === "EPA Comm Milestone" && <EPACommMilestone />}
        </div>
      ))}
    </div>
  );
  function EmptyMilestone() {
    return (
      <div className="flex justify-center text-2xl z-50 w-full items-center select-none">
        <TooltipProvider>
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
    );
  }
  function TestingMilestone() {
    const circleChar = "\u25CF";
    return (
      <div className="flex justify-center text-2xl z-50 text-yellow-300 items-center select-none">
        <TooltipProvider>
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
    );
  }
  function CapabilityDelivery() {
    const diamondChar = "\u25C6";
    return (
      <div className="flex justify-center text-2xl z-50 text-orange-600 items-center select-none">
        <TooltipProvider>
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
    );
  }
  function SecurityMilestone() {
    const triangleChar = "\u25B2";
    return (
      <div className="flex justify-center text-2xl z-50 text-gray-600 items-center select-none">
        <TooltipProvider>
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
    );
  }
  function EPACommMilestone() {
    const squareChar = "\u25A0";
    return (
      <div className="flex justify-center text-2xl z-50 text-green-600 items-center select-none">
        <TooltipProvider>
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
    );
  }
}
