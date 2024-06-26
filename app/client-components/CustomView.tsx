import React, { useEffect, useRef, useState } from "react";
import {
  TaskOrder,
  PortfolioEpic,
  Capability,
  Epic,
  Story,
} from "./data-manipulation";
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
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface ColumnConfig {
  startDate: Date | null;
  endDate: Date | null;
  title: string;
}

interface CustomViewProps {
  taskOrders: TaskOrder[];
}

export default function CustomView({ taskOrders }: CustomViewProps) {
  const [numberOfColumns, setNumberOfColumns] = useState(8);
  const [columnConfigs, setColumnConfigs] = useState<ColumnConfig[]>(
    Array(numberOfColumns).fill({
      startDate: null,
      endDate: null,
      title: "",
    })
  );

  // Main state (used for rendering the chart)
  const [selectedTaskOrder, setSelectedTaskOrder] = useState<TaskOrder | null>(
    null
  );
  const [selectedPortfolioEpic, setSelectedPortfolioEpic] =
    useState<PortfolioEpic | null>(null);
  const [selectedCapability, setSelectedCapability] =
    useState<Capability | null>(null);
  const [selectedEpic, setSelectedEpic] = useState<Epic | null>(null);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [displayLevel, setDisplayLevel] = useState<
    "taskOrder" | "portfolioEpic" | "capability" | "epic" | "story"
  >("taskOrder");

  // Temporary state (used for dropdown selections)
  const [tempTaskOrder, setTempTaskOrder] = useState<TaskOrder | null>(null);
  const [tempPortfolioEpic, setTempPortfolioEpic] =
    useState<PortfolioEpic | null>(null);
  const [tempCapability, setTempCapability] = useState<Capability | null>(null);
  const [tempEpic, setTempEpic] = useState<Epic | null>(null);
  const [tempStory, setTempStory] = useState<Story | null>(null);
  const [tempDisplayLevel, setTempDisplayLevel] = useState<
    "taskOrder" | "portfolioEpic" | "capability" | "epic" | "story"
  >("taskOrder");

  const [showChart, setShowChart] = useState(false);

  useEffect(() => {
    setColumnConfigs(
      Array(numberOfColumns).fill({
        startDate: null,
        endDate: null,
        title: "",
      })
    );
  }, [numberOfColumns]);

  const componentRef = useRef<HTMLDivElement>(null);

  async function handleScreenshot(e: React.MouseEvent) {
    e.preventDefault();
    if (componentRef.current) {
      try {
        const dataUrl = await domtoimage.toPng(componentRef.current);
        const link = document.createElement("a");
        link.download = "custom-view-screenshot.png";
        link.href = dataUrl;
        link.click();
      } catch (error) {
        console.error("Error taking screenshot:", error);
      }
    }
  }

  function ColumnSelector() {
    return (
      <div className="flex flex-row justify-between">
        <div>
          <label htmlFor="columns-input" className="mr-2 mx-2">
            Number of Columns:
          </label>
          <select
            id="columns-input"
            className="border px-2 py-1 rounded"
            value={numberOfColumns}
            onChange={(e) => setNumberOfColumns(parseInt(e.target.value))}
          >
            {[2, 4, 6, 8, 10, 12, 14, 16].map((num) => (
              <option key={num} value={num}>
                {num}
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  }

  function SelectionDropdowns() {
    const dropdownClasses =
      "border px-2 py-1 rounded w-48 truncate text-ellipsis";

    return (
      <>
        <select
          className={dropdownClasses}
          value={tempTaskOrder?.name || ""}
          onChange={(e) => {
            const to = taskOrders.find((to) => to.name === e.target.value);
            setTempTaskOrder(to || null);
            setTempPortfolioEpic(null);
            setTempCapability(null);
            setTempEpic(null);
            setTempStory(null);
            setTempDisplayLevel("taskOrder");
          }}
        >
          <option value="">Select Task Order</option>
          {taskOrders.map((to) => (
            <option key={to.name} value={to.name} title={to.name}>
              {to.name}
            </option>
          ))}
        </select>

        <select
          className={dropdownClasses}
          value={tempPortfolioEpic?.name || ""}
          onChange={(e) => {
            const pe = tempTaskOrder?.portfolioEpics.find(
              (pe) => pe.name === e.target.value
            );
            setTempPortfolioEpic(pe || null);
            setTempCapability(null);
            setTempEpic(null);
            setTempStory(null);
            setTempDisplayLevel("portfolioEpic");
          }}
          disabled={!tempTaskOrder}
        >
          <option value="">Select Portfolio Epic</option>
          {tempTaskOrder?.portfolioEpics.map((pe) => (
            <option key={pe.name} value={pe.name} title={pe.name}>
              {pe.name}
            </option>
          ))}
        </select>

        <select
          className={dropdownClasses}
          value={tempCapability?.name || ""}
          onChange={(e) => {
            const cap = tempPortfolioEpic?.capabilities.find(
              (c) => c.name === e.target.value
            );
            setTempCapability(cap || null);
            setTempEpic(null);
            setTempStory(null);
            setTempDisplayLevel("capability");
          }}
          disabled={!tempPortfolioEpic}
        >
          <option value="">Select Capability</option>
          {tempPortfolioEpic?.capabilities.map((cap) => (
            <option key={cap.name} value={cap.name} title={cap.name}>
              {cap.name}
            </option>
          ))}
        </select>

        <select
          className={dropdownClasses}
          value={tempEpic?.name || ""}
          onChange={(e) => {
            const epic = tempCapability?.epics.find(
              (ep) => ep.name === e.target.value
            );
            setTempEpic(epic || null);
            setTempStory(null);
            setTempDisplayLevel("epic");
          }}
          disabled={!tempCapability}
        >
          <option value="">Select Epic</option>
          {tempCapability?.epics.map((epic) => (
            <option key={epic.name} value={epic.name} title={epic.name}>
              {epic.name}
            </option>
          ))}
        </select>
      </>
    );
  }

  function handleShowChart() {
    if (tempTaskOrder) {
      setSelectedTaskOrder(tempTaskOrder);
      setSelectedPortfolioEpic(tempPortfolioEpic);
      setSelectedCapability(tempCapability);
      setSelectedEpic(tempEpic);
      setSelectedStory(tempStory);
      setDisplayLevel(tempDisplayLevel);
      setShowChart(true);
    } else {
      alert("Please select at least a Task Order to display the chart.");
    }
  }

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <ColumnSelector />
        <Button onClick={handleScreenshot}>Save as Image</Button>
      </div>
      <div className="flex flex-row items-center space-x-4 mb-4 flex-wrap">
        <SelectionDropdowns />
        <Button onClick={handleShowChart}>Show Chart</Button>
      </div>
      {showChart && (
        <div ref={componentRef}>
          <Title />
          <HeaderRow
            columnConfigs={columnConfigs}
            setColumnConfigs={setColumnConfigs}
          />
          <ChartDisplay
            taskOrder={selectedTaskOrder!}
            portfolioEpic={selectedPortfolioEpic}
            capability={selectedCapability}
            epic={selectedEpic}
            story={selectedStory}
            displayLevel={displayLevel}
            columnConfigs={columnConfigs}
          />
        </div>
      )}
    </div>
  );
}

function Title() {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const defaultTitle = "Custom View";

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

function HeaderRow({
  columnConfigs,
  setColumnConfigs,
}: {
  columnConfigs: ColumnConfig[];
  setColumnConfigs: React.Dispatch<React.SetStateAction<ColumnConfig[]>>;
}) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [selectedColumnIndex, setSelectedColumnIndex] = useState<number | null>(
    null
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const dateRangeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dateRangeRef.current &&
        !dateRangeRef.current.contains(event.target as Node)
      ) {
        setSelectedColumnIndex(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  function getBackgroundColor(index: number) {
    const colors = ["#4C1D95", "#000080", "#6022B1", "#00008B"];
    return colors[index % 4];
  }

  const handleHeaderDoubleClick = (index: number) => {
    setEditingIndex(index);
  };

  const handleHeaderChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const newColumnConfigs = [...columnConfigs];
    newColumnConfigs[index] = {
      ...newColumnConfigs[index],
      title: e.target.value,
    };
    setColumnConfigs(newColumnConfigs);
  };

  const handleHeaderBlur = () => {
    setEditingIndex(null);
  };

  const handleDateChange = (
    date: Date | null,
    index: number,
    type: "start" | "end"
  ) => {
    const newColumnConfigs = [...columnConfigs];
    newColumnConfigs[index] = {
      ...newColumnConfigs[index],
      [type === "start" ? "startDate" : "endDate"]: date,
    };
    setColumnConfigs(newColumnConfigs);
  };

  useEffect(() => {
    if (editingIndex !== null && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingIndex]);

  return (
    <div className="h-8 flex flex-row">
      <div className="flex-1"></div>
      {columnConfigs.map((config, index) => (
        <div
          key={index}
          className={`flex-1 flex flex-col text-white text-center rounded-md relative ${
            selectedColumnIndex === index ? "border-2 border-white" : ""
          }`}
          style={{ backgroundColor: getBackgroundColor(index) }}
          onClick={() => setSelectedColumnIndex(index)}
        >
          {editingIndex === index ? (
            <input
              ref={inputRef}
              type="text"
              value={config.title}
              onChange={(e) => handleHeaderChange(e, index)}
              onBlur={handleHeaderBlur}
              className="text-white bg-transparent focus:outline-none text-center"
            />
          ) : (
            <div onDoubleClick={() => handleHeaderDoubleClick(index)}>
              {config.title || `Column ${index + 1}`}
            </div>
          )}
          {selectedColumnIndex === index && (
            <div
              ref={dateRangeRef}
              className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 text-black dark:text-white p-4 rounded shadow"
            >
              <div className="mb-4">
                <label className="block mb-1">Start Date:</label>
                <DatePicker
                  selected={config.startDate}
                  onChange={(date: Date | null) =>
                    handleDateChange(date, index, "start")
                  }
                  className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 w-full text-black dark:text-white bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block mb-1">End Date:</label>
                <DatePicker
                  selected={config.endDate}
                  onChange={(date: Date | null) =>
                    handleDateChange(date, index, "end")
                  }
                  className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 w-full text-black dark:text-white bg-white dark:bg-gray-800"
                />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function ChartDisplay({
  taskOrder,
  portfolioEpic,
  capability,
  epic,
  story,
  displayLevel,
  columnConfigs,
}: {
  taskOrder: TaskOrder;
  portfolioEpic: PortfolioEpic | null;
  capability: Capability | null;
  epic: Epic | null;
  story: Story | null;
  displayLevel: "taskOrder" | "portfolioEpic" | "capability" | "epic" | "story";
  columnConfigs: ColumnConfig[];
}) {
  function getShadeOfPurple(index: number) {
    let colorIndex = index % 4;
    const shadesOfPurple = ["#4C1D95", "#000080", "#6022B1", "#00008B"];
    return shadesOfPurple[colorIndex];
  }
  const color = getShadeOfPurple(0);
  const firstColumn = "1";

  let itemsToDisplay: any[] = [];
  let hierarchyLabels: { type: string; name: string }[] = [
    { type: "TO", name: taskOrder.name },
  ];

  switch (displayLevel) {
    case "taskOrder":
      itemsToDisplay = taskOrder.portfolioEpics;
      break;
    case "portfolioEpic":
      if (portfolioEpic) {
        itemsToDisplay = portfolioEpic.capabilities;
        hierarchyLabels.push({ type: "PE", name: portfolioEpic.name });
      }
      break;
    case "capability":
      if (capability) {
        itemsToDisplay = capability.epics;
        hierarchyLabels.push(
          { type: "PE", name: portfolioEpic!.name },
          { type: "Cap", name: capability.name }
        );
      }
      break;
    case "epic":
      if (epic) {
        itemsToDisplay = epic.stories;
        hierarchyLabels.push(
          { type: "PE", name: portfolioEpic!.name },
          { type: "Cap", name: capability!.name },
          { type: "Epic", name: epic.name }
        );
      }
      break;
    case "story":
      if (story) {
        itemsToDisplay = [story];
        hierarchyLabels.push(
          { type: "PE", name: portfolioEpic!.name },
          { type: "Cap", name: capability!.name },
          { type: "Epic", name: epic!.name },
          { type: "Story", name: story.name }
        );
      }
      break;
  }

  const numberOfRows = itemsToDisplay.length;
  const gridRowForTaskOrder = `1 / ${2 + numberOfRows}`;

  return (
    <div className="flex-1 flex flex-row w-full border border-black rounded-md shadow-sm">
      <div
        className="h-full w-full"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${
            columnConfigs.length + 1
          }, minmax(0,1fr))`,
        }}
      >
        <div
          style={{
            gridColumn: firstColumn,
            gridRow: gridRowForTaskOrder,
            backgroundColor: color,
          }}
          className="flex flex-col items-center justify-center text-white rounded-md p-2 text-left w-full"
        >
          {hierarchyLabels.map((label, index) => (
            <div key={index} className="text-sm mb-1 w-full text-left">
              <span className="font-bold">{label.type}: </span>
              {label.name}
            </div>
          ))}
        </div>
        {itemsToDisplay.map((item, i) => (
          <ItemDisplay
            key={i}
            item={item}
            index={i + 1}
            color={color}
            columnConfigs={columnConfigs}
            displayLevel={displayLevel}
          />
        ))}
      </div>
    </div>
  );
}

function ItemDisplay({
  item,
  index,
  color,
  columnConfigs,
  displayLevel,
}: {
  item: any;
  index: number;
  color: string;
  columnConfigs: ColumnConfig[];
  displayLevel: "taskOrder" | "portfolioEpic" | "capability" | "epic" | "story";
}) {
  const gridRowIndex = index + 1;
  let gridRow = `${gridRowIndex} / ${gridRowIndex + 1}`;

  const startDate = new Date(item.plannedStart);
  const endDate = new Date(item.plannedEnd);

  function isWithinDateRange(columnConfig: ColumnConfig) {
    if (!columnConfig.startDate || !columnConfig.endDate) {
      return false;
    }

    const columnStartDate = new Date(columnConfig.startDate);
    const columnEndDate = new Date(columnConfig.endDate);

    return startDate >= columnStartDate && endDate <= columnEndDate;
  }

  function getGridColumn(columnConfigs: ColumnConfig[]) {
    for (let i = 0; i < columnConfigs.length; i++) {
      if (isWithinDateRange(columnConfigs[i])) {
        return `${i + 2} / ${i + 3}`;
      }
    }
    return "";
  }

  const gridColumn = getGridColumn(columnConfigs);

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
          <div className="text-white w-full ">{item.name}</div>
        </HoverCardTrigger>
        <HoverCardContent className="w-96">
          <div className="font-bold text-lg">{item.name}</div>
          <div className="text-sm">
            <p>Type: {item.type}</p>
            <p>Planned Start: {item.plannedStart}</p>
            <p>Planned End: {item.plannedEnd}</p>
            <p>Labels: {item.labels.join(", ")}</p>
          </div>
        </HoverCardContent>
      </HoverCard>
      <MileStones displayLevel={displayLevel} />
    </div>
  );
}

function MileStones({ displayLevel }: { displayLevel: string }) {
  const milestoneOptions = [
    "empty",
    `${
      displayLevel.charAt(0).toUpperCase() + displayLevel.slice(1)
    } Completion`,
    "Testing Milestone",
    "Review Milestone",
    "Deployment Milestone",
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
          {milestone.includes("Completion") && <CompletionMilestone />}
          {milestone === "Review Milestone" && <ReviewMilestone />}
          {milestone === "Deployment Milestone" && <DeploymentMilestone />}
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
  function CompletionMilestone() {
    const diamondChar = "\u25C6";
    return (
      <div className="flex justify-center text-2xl z-50 text-orange-600 items-center select-none">
        <TooltipProvider>
          <Tooltip delayDuration={10}>
            <TooltipTrigger>
              <div>{diamondChar}</div>
            </TooltipTrigger>
            <TooltipContent>
              <div>{`${
                displayLevel.charAt(0).toUpperCase() + displayLevel.slice(1)
              } Completion`}</div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  }
  function ReviewMilestone() {
    const triangleChar = "\u25B2";
    return (
      <div className="flex justify-center text-2xl z-50 text-gray-600 items-center select-none">
        <TooltipProvider>
          <Tooltip delayDuration={10}>
            <TooltipTrigger>
              <div>{triangleChar}</div>
            </TooltipTrigger>
            <TooltipContent>
              <div>Review Milestone</div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  }
  function DeploymentMilestone() {
    const squareChar = "\u25A0";
    return (
      <div className="flex justify-center text-2xl z-50 text-green-600 items-center select-none">
        <TooltipProvider>
          <Tooltip delayDuration={10}>
            <TooltipTrigger>
              <div>{squareChar}</div>
            </TooltipTrigger>
            <TooltipContent>
              <div>Deployment Milestone</div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  }
}
