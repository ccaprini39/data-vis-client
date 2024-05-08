'use client'

import { TaskOrder } from "./data-manipulation";

export default function EpicsView({ taskOrders }: { taskOrders: TaskOrder[] }) {

  return (
    <div>
      {taskOrders.map((taskOrder) => (
        <div className="border-1 bg-gray-50 my-5">
          <TaskOrderDiplay key={taskOrder.name} taskOrder={taskOrder} />
        </div>
      ))}
    </div>
  );
}

function TaskOrderDiplay({ taskOrder }: { taskOrder: TaskOrder }) {
  const portfolioEpics = taskOrder.portfolioEpics || [];
  const capabilities = portfolioEpics.map((pe) => pe.capabilities).flat();
  const epics = capabilities.map((c) => c.epics).flat();
  //filter out the epics that do not have a planned start date
  const epicsFiltered = epics.filter((epic) => epic.plannedStart !== "");
  if (epicsFiltered.length === 0) {
    return <></>;
  }
  return (
    <div>
      {epicsFiltered.map((epic) => (
        <div className="border-1 bg-gray-100">
          {taskOrder.name}-{epic.name}-{epic.plannedStart}
        </div>
      ))}
    </div>
  );
}