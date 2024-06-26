import React, { useEffect, useRef, useState } from "react";
import { PortfolioEpic, TaskOrder } from "./data-manipulation";
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

export default function PortfolioEpicsView({
  taskOrders,
}: {
  taskOrders: TaskOrder[];
}) {
  const [startingYear, setStartingYear] = useState(
    new Date().getFullYear().toString()
  );
  const [startingQuarter, setStartingQuarter] = useState("Q1");
  const [numberOfQuarters, setNumberOfQuarters] = useState(8);

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

  const defaultTitle = `Portfolio Epics View`;

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
  function getBackgroundColor(index: number) {
    const colors = ["#4C1D95", "#000080", "#6022B1", "#00008B"];
    return colors[index % 4];
  }

  return (
    <div className="h-8 flex flex-row">
      <div className="flex-1"></div>
      {selectedQuarters.map((quarter, index) => (
        <div
          key={index}
          className="flex-1 flex flex-col text-white text-center rounded-md"
          style={{ backgroundColor: getBackgroundColor(index) }}
        >
          {quarter}
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
  const portfolioEpics = taskOrder.portfolioEpics || [];

  if (portfolioEpics.length === 0) {
    return <></>;
  }

  function getShadeOfPurple(index: number) {
    let colorIndex = index % 4;
    const shadesOfPurple = ["#4C1D95", "#000080", "#6022B1", "#00008B"];
    return shadesOfPurple[colorIndex];
  }
  const color = getShadeOfPurple(index);
  const firstColumn = "1";
  const numberOfRows = portfolioEpics.length;
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
        {portfolioEpics.map((pe, i) => (
          <PortfolioEpicDisplay
            key={i}
            portfolioEpic={pe}
            index={i + 1}
            color={color}
            selectedQuarters={selectedQuarters}
          />
        ))}
      </div>
    </div>
  );
}

function PortfolioEpicDisplay({
  portfolioEpic,
  index,
  color,
  selectedQuarters,
}: {
  portfolioEpic: PortfolioEpic;
  index: number;
  color: string;
  selectedQuarters: string[];
}) {
  if (!portfolioEpic.labels || portfolioEpic.labels.length === 0) {
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
    !checkIfAnyLabelsAreInSelectedQuarters(
      selectedQuarters,
      portfolioEpic.labels
    )
  ) {
    return <div></div>;
  }

  const gridRowIndex = index + 1;
  let gridRow = `${gridRowIndex} / ${gridRowIndex + 1}`;
  let gridColumn = getGridColumns(selectedQuarters, portfolioEpic.labels);

  function getGridColumns(selectedQuarters: string[], labels: string[]) {
    const beginningLabel = labels[0];
    const endLabel = labels[labels.length - 1];

    let beginningIndex = selectedQuarters.indexOf(beginningLabel);
    if (beginningIndex === -1) {
      beginningIndex = 0;
    }

    const endIndex = selectedQuarters.indexOf(endLabel);

    const gridColumn = `${beginningIndex + 2} / ${endIndex + 3}`;
    return gridColumn;
  }
  const capabilities: any = portfolioEpic.capabilities;

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
          <div className="text-white w-full ">{portfolioEpic.name}</div>
        </HoverCardTrigger>
        <HoverCardContent className="w-96">
          <div className="font-bold text-lg">{portfolioEpic.name}</div>
          <ul>
            {capabilities.map((capability: any, i: number) => (
              <li className="text-xs" key={i}>
                {capability?.name}
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
    "empty",
    "Capability Delivery",
    "Testing Milestone",
    "Security Milestone",
    "EPA Comm Milestone",
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
    const invisibleChar = "\u200B";

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
      <div className="flex justify-center text-2xl z-50 text-yellow-300  items-center select-none">
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
      <div className="flex justify-center text-2xl z-50 text-orange-600  items-center select-none">
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
      <div className="flex justify-center text-2xl z-50 text-gray-600  items-center select-none">
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
      <div className="flex justify-center text-2xl z-50 text-green-600  items-center select-none">
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
