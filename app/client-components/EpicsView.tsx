'use client'

import { TaskOrder } from "./data-manipulation";

export default function EpicsView({ taskOrders }: { taskOrders: TaskOrder[] }) {
  return (
    <div>
      <pre className=" text-xs">
        {JSON.stringify(taskOrders, null, 2)}
      </pre>
    </div>
  );
}