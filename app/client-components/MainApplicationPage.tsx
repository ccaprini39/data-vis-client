import React, { useState, useEffect } from "react";
import { parseXLSFile, TaskOrder } from "./data-manipulation";
import { ModeToggle } from "@/components/ModeToggleButton";
import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import PortfolioEpicsView from "./PortfolioEpicsView";
import PortfolioEpicsView_labels from "./PortfolioEpicView_labels";
import EpicsView from "./EpicsView";
import StoryView from "./StoryView";
import StoryView_labels from "./StoryView_labels";
import CustomView from "./CustomView";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CapabilitiesView from "./CapabilitiesView";

export default function MainApplicationPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [tableData, setTableData] = useState<TaskOrder[]>([]);

  async function handleResetFileSelection() {
    //reload to /
    window.location.reload();
  }

  useEffect(() => {
    async function fetchAndConvertData() {
      if (selectedFile) {
        const results = await parseXLSFile(selectedFile);
        console.log(results);
        //now look through the results and convert them to TaskOrder objects
        let taskOrders: TaskOrder[] = results;
        //now remove the task orders that do not have any portfolio epics or capabilities
        taskOrders = taskOrders.filter(
          (taskOrder) =>
            taskOrder.portfolioEpics &&
            taskOrder.portfolioEpics.length > 0 &&
            taskOrder.portfolioEpics.some(
              (portfolioEpic) =>
                portfolioEpic.capabilities &&
                portfolioEpic.capabilities.length > 0 &&
                portfolioEpic.capabilities.some(
                  (capability) =>
                    capability.epics && capability.epics.length > 0
                )
            )
        );
        setTableData(taskOrders);
      }
    }
    fetchAndConvertData();
  }, [selectedFile]);

  async function handleChange(event: any) {
    const file = event.target.files ? event.target.files[0] : null;
    setSelectedFile(file);
  }

  return (
    <div className="w-full h-full m-5">
      <Tabs defaultValue="file" className="w-full">
        <div className="flex flex-row justify-between mx-5">
          <TabsList className="flex bg-gray-300 text-black gap-1 rounded-md">
            <TabsTrigger value="file">File</TabsTrigger>
            <TabsTrigger
              disabled={tableData.length === 0}
              value="portfolio_epics"
            >
              Portfolio Epics View
            </TabsTrigger>
            <TabsTrigger disabled={tableData.length === 0} value="capabilities">
              Capabilities View
            </TabsTrigger>
            <TabsTrigger disabled={tableData.length === 0} value="epics">
              Epics View
            </TabsTrigger>
            <TabsTrigger disabled={tableData.length === 0} value="stories">
              Story View
            </TabsTrigger>
            <TabsTrigger disabled={tableData.length === 0} value="custom_view">
              Custom View
            </TabsTrigger>
            <TabsTrigger
              disabled={tableData.length === 0}
              value="portfolio_epics_labels"
            >
              Portfolio Epics View (Labels)
            </TabsTrigger>
            <TabsTrigger
              disabled={tableData.length === 0}
              value="stories_labels"
            >
              Story View (Labels)
            </TabsTrigger>
            {/* <TabsTrigger disabled={tableData.length === 0} value="debug">Debug</TabsTrigger> */}
          </TabsList>
          <ModeToggle />
        </div>

        <TabsContent value="file" className="p-4">
          <label htmlFor="fileInput" className="block">
            {/* <span className="sr-only">Choose file</span> */}
            <Input
              type="file"
              id="fileInput"
              onChange={handleChange}
              accept=".xls,.xlsx"
              className="w-1/4 my-2 cursor-pointer"
            />
          </label>
          <Button
            className="px-4 py-2 mb-4 text-sm font-medium text-white bg-purple-700 rounded-md hover:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            onClick={handleResetFileSelection}
          >
            Reset
          </Button>
        </TabsContent>
        <TabsContent value="portfolio_epics" className="p-4">
          <PortfolioEpicsView taskOrders={tableData} />
        </TabsContent>
        <TabsContent value="capabilities" className="p-4">
          {tableData.length === 0 ? (
            <div className="mx-4">No data</div>
          ) : (
            <CapabilitiesView taskOrders={tableData} />
          )}
        </TabsContent>
        <TabsContent value="epics" className="p-4">
          <EpicsView taskOrders={tableData} />
        </TabsContent>
        <TabsContent value="stories" className="p-4">
          <StoryView taskOrders={tableData} />
        </TabsContent>
        <TabsContent value="custom_view" className="p-4">
          <CustomView taskOrders={tableData} />
        </TabsContent>
        <TabsContent value="portfolio_epics_labels" className="p-4">
          <PortfolioEpicsView_labels taskOrders={tableData} />
        </TabsContent>
        <TabsContent value="stories_labels" className="p-4">
          <StoryView_labels taskOrders={tableData} />
        </TabsContent>
        {/* <TabsContent value="debug" className="p-4">
          <pre>{JSON.stringify(tableData, null, 2)}</pre>
        </TabsContent> */}
      </Tabs>
    </div>
  );
}
