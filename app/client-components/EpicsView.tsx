'use client'

import { Epic, TaskOrder } from "./data-manipulation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import domtoimage from "dom-to-image";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs";

export default function EpicsView({ taskOrders }: { taskOrders: TaskOrder[] }) {
  const todaysDate = new Date();
  const todaysYear = todaysDate.getFullYear();
  const todaysMonth = todaysDate.getMonth();
  const todaysDay = todaysDate.getDate();
  const todaysDateString = `${todaysMonth + 1}/${todaysDay}/${todaysYear}`;

  return (
    <div>
      {/* {todaysDateString} */}
      {taskOrders.map((taskOrder, index) => (
        <div key={taskOrder.name} className="border-1">
          <TaskOrderDiplay taskOrder={taskOrder} index={index}/>
        </div>
      ))}
    </div>
  );
}

function TaskOrderDiplay({ taskOrder, index }: { taskOrder: TaskOrder, index: number}) {
  const portfolioEpics = taskOrder.portfolioEpics || [];
  const capabilities = portfolioEpics.map((pe) => pe.capabilities).flat();
  const epics = capabilities.map((c) => c.epics).flat();
  //filter out the epics that do not have a planned start date
  let epicsFiltered = epics.filter((epic) => epic.plannedStart !== "");
  if (epicsFiltered.length === 0) {
    return <></>;
  }
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
  const color = getShadeOfPurple(index);
  return (
    <div 
      className="flex flex-col bg-inherit rounded-md border w-full"
      style={{ backgroundColor: color }}
    >
      <div className="flex-0 mx-auto text-lg my-auto">{taskOrder.name}</div>
      <Table className="m-0 text-xs text-white">
        <TableHeader>
          <TableRow>
            <TableHead className="text-white">Name</TableHead>
            <TableHead className="w-[150px] text-white">Planned Start</TableHead>
            <TableHead className="w-[150px] text-white">Planned End</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {epicsFiltered.map((epic) => (
            <EpicDisplay key={epic.name} epic={epic} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function EpicDisplay({ epic }: { epic: Epic }) {
  return (
    <TableRow>
      <TableCell>{epic.name}</TableCell>
      <TableCell>{epic.plannedStart}</TableCell>
      <TableCell>{epic.plannedEnd}</TableCell>
    </TableRow>
  );
}