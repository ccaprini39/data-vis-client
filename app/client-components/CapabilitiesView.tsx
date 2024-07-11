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
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface ColumnConfig {
  startDate: Date | null;
  endDate: Date | null;
  title: string;
}

export default function CapabilitiesView({
  taskOrders,
}: {
  taskOrders: TaskOrder[];
}) {
  const [numberOfColumns, setNumberOfColumns] = useState(8);
  const [columnConfigs, setColumnConfigs] = useState<ColumnConfig[]>(
    Array(numberOfColumns).fill({
      startDate: null,
      endDate: null,
      title: "",
    })
  );
  const [selectedTaskOrder, setSelectedTaskOrder] = useState<TaskOrder | null>(
    null
  );

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

  function ColumnSelector() {
    const incrementColumns = () => {
      setNumberOfColumns((prev) => prev + 1);
    };

    const decrementColumns = () => {
      setNumberOfColumns((prev) => Math.max(1, prev - 1));
    };

    return (
      <div className="flex items-center">
        <label htmlFor="columns-input" className="mr-2">
          Number of Columns:
        </label>
        <button
          onClick={decrementColumns}
          className="px-2 py-1 border rounded-l"
          disabled={numberOfColumns <= 1}
        >
          -
        </button>
        <span className="px-4 py-1 border-t border-b">{numberOfColumns}</span>
        <button
          onClick={incrementColumns}
          className="px-2 py-1 border rounded-r"
        >
          +
        </button>
      </div>
    );
  }

  function TaskOrderDropdown() {
    return (
      <div className="flex items-center ml-4">
        <label htmlFor="task-order-dropdown" className="mr-2">
          Select Task Order:
        </label>
        <select
          id="task-order-dropdown"
          className="px-2 py-1 border rounded"
          value={selectedTaskOrder?.name || ""}
          onChange={(e) => {
            const selectedTaskOrder = taskOrders.find(
              (to) => to.name === e.target.value
            );
            setSelectedTaskOrder(selectedTaskOrder || null);
          }}
        >
          <option value="">All Task Orders</option>
          {taskOrders.map((to) => (
            <option key={to.name} value={to.name}>
              {to.name}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <ColumnSelector />
          <TaskOrderDropdown />
        </div>
        <Button onClick={handleScreenshot}>Save as Image</Button>
      </div>
      <div ref={componentRef}>
        <Title />
        <HeaderRow
          columnConfigs={columnConfigs}
          setColumnConfigs={setColumnConfigs}
        />
        {selectedTaskOrder ? (
          <TaskOrderDisplay
            taskOrder={selectedTaskOrder}
            index={0}
            columnConfigs={columnConfigs}
          />
        ) : (
          taskOrders.map((to, index) => (
            <TaskOrderDisplay
              key={index}
              taskOrder={to}
              index={index}
              columnConfigs={columnConfigs}
            />
          ))
        )}
      </div>
    </div>
  );
}

function Title() {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const defaultTitle = "Capabilities View";

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

function TaskOrderDisplay({
  taskOrder,
  index,
  columnConfigs,
}: {
  taskOrder: TaskOrder;
  index: number;
  columnConfigs: ColumnConfig[];
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
            columnConfigs={columnConfigs}
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
  columnConfigs,
}: {
  capability: Capability;
  index: number;
  color: string;
  columnConfigs: ColumnConfig[];
}) {
  const gridRowIndex = index + 1;
  let gridRow = `${gridRowIndex} / ${gridRowIndex + 1}`;

  const startDate = new Date(capability.plannedStart);
  const endDate = new Date(capability.plannedEnd);

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
