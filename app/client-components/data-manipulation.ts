const XLSX = require("xlsx");

function transformData(data: any) {
  return data.map((item: any) => {
    const issueType = item["Issue Type"]?.trim().toLowerCase();
    const plannedStartDate = item["Planned Start"]
      ? excelDateToJSDate(item["Planned Start"])
      : "";
    const plannedEndDate = item["Planned End"]
      ? excelDateToJSDate(item["Planned End"])
      : "";
    const labels = labelsToStringArray(item.Labels);

    return {
      type: issueType || "unknown",
      name: item.Summary || "",
      plannedStart: plannedStartDate,
      plannedEnd: plannedEndDate,
      labels,
      ...item,
    };
  });
}

function excelDateToJSDate(serial: number) {
  const date = new Date(Math.round((serial - 25569) * 86400 * 1000));
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const year = date.getFullYear();
  return month + "/" + day + "/" + year;
}

function categorizeAndStructureTasks(data: any[]) {
  let taskOrders: any[] = [];
  let currentTaskOrder: any = null;
  let currentPortfolioEpic: any = null;
  let currentCapability: any = null;
  let currentEpic: any = null;

  data.forEach((item) => {
    if (item.type === "task order") {
      currentTaskOrder = { ...item, portfolioEpics: [] };
      if (!currentTaskOrder.name) {
        currentTaskOrder.name = "undefined";
      }
      taskOrders.push(currentTaskOrder);
      currentPortfolioEpic = null;
      currentCapability = null;
      currentEpic = null;
    } else if (item.type === "portfolio epic") {
      if (currentTaskOrder) {
        currentPortfolioEpic = { ...item, capabilities: [] };
        currentTaskOrder.portfolioEpics.push(currentPortfolioEpic);
        currentCapability = null;
        currentEpic = null;
      } else {
        currentTaskOrder = { name: "undefined", portfolioEpics: [] };
        currentPortfolioEpic = { ...item, capabilities: [] };
        currentTaskOrder.portfolioEpics.push(currentPortfolioEpic);
        taskOrders.push(currentTaskOrder);
      }
    } else if (item.type === "capability") {
      if (currentPortfolioEpic) {
        currentCapability = { ...item, epics: [] };
        currentPortfolioEpic.capabilities.push(currentCapability);
        currentEpic = null;
      } else if (currentTaskOrder) {
        currentPortfolioEpic = { name: "", capabilities: [] };
        currentCapability = { ...item, epics: [] };
        currentPortfolioEpic.capabilities.push(currentCapability);
        currentTaskOrder.portfolioEpics.push(currentPortfolioEpic);
      } else {
        currentTaskOrder = { name: "undefined", portfolioEpics: [] };
        currentPortfolioEpic = { name: "", capabilities: [] };
        currentCapability = { ...item, epics: [] };
        currentPortfolioEpic.capabilities.push(currentCapability);
        currentTaskOrder.portfolioEpics.push(currentPortfolioEpic);
        taskOrders.push(currentTaskOrder);
      }
    } else if (item.type === "epic") {
      if (currentCapability) {
        currentEpic = { ...item, stories: [] };
        currentCapability.epics.push(currentEpic);
      } else if (currentPortfolioEpic) {
        currentCapability = { name: "", epics: [] };
        currentEpic = { ...item, stories: [] };
        currentCapability.epics.push(currentEpic);
        currentPortfolioEpic.capabilities.push(currentCapability);
      } else if (currentTaskOrder) {
        currentPortfolioEpic = { name: "", capabilities: [] };
        currentCapability = { name: "", epics: [] };
        currentEpic = { ...item, stories: [] };
        currentCapability.epics.push(currentEpic);
        currentPortfolioEpic.capabilities.push(currentCapability);
        currentTaskOrder.portfolioEpics.push(currentPortfolioEpic);
      } else {
        currentTaskOrder = { name: "undefined", portfolioEpics: [] };
        currentPortfolioEpic = { name: "", capabilities: [] };
        currentCapability = { name: "", epics: [] };
        currentEpic = { ...item, stories: [] };
        currentCapability.epics.push(currentEpic);
        currentPortfolioEpic.capabilities.push(currentCapability);
        currentTaskOrder.portfolioEpics.push(currentPortfolioEpic);
        taskOrders.push(currentTaskOrder);
      }
    } else if (item.type === "story") {
      if (currentEpic) {
        currentEpic.stories.push(item);
      } else if (currentCapability) {
        currentEpic = { name: "", stories: [item] };
        currentCapability.epics.push(currentEpic);
      } else if (currentPortfolioEpic) {
        currentCapability = { name: "", epics: [] };
        currentEpic = { name: "", stories: [item] };
        currentCapability.epics.push(currentEpic);
        currentPortfolioEpic.capabilities.push(currentCapability);
      } else if (currentTaskOrder) {
        currentPortfolioEpic = { name: "", capabilities: [] };
        currentCapability = { name: "", epics: [] };
        currentEpic = { name: "", stories: [item] };
        currentCapability.epics.push(currentEpic);
        currentPortfolioEpic.capabilities.push(currentCapability);
        currentTaskOrder.portfolioEpics.push(currentPortfolioEpic);
      } else {
        currentTaskOrder = { name: "undefined", portfolioEpics: [] };
        currentPortfolioEpic = { name: "", capabilities: [] };
        currentCapability = { name: "", epics: [] };
        currentEpic = { name: "", stories: [item] };
        currentCapability.epics.push(currentEpic);
        currentPortfolioEpic.capabilities.push(currentCapability);
        currentTaskOrder.portfolioEpics.push(currentPortfolioEpic);
        taskOrders.push(currentTaskOrder);
      }
    }
  });

  return taskOrders;
}

export function processData(data: any) {
  const transformedData = transformData(data);
  const processedData = categorizeAndStructureTasks(transformedData);
  const typedData = convertToTypedData(processedData);
  return typedData;
}

export interface TaskOrder {
  name: string;
  portfolioEpics: PortfolioEpic[];
  type: string;
  plannedStart: string;
  plannedEnd: string;
  labels: string[];
}

export interface PortfolioEpic {
  name: string;
  capabilities: Capability[];
  type: string;
  plannedStart: string;
  plannedEnd: string;
  labels: string[];
}

export interface Capability {
  name: string;
  epics: Epic[];
  type: string;
  plannedStart: string;
  plannedEnd: string;
  labels: string[];
}

export interface Epic {
  name: string;
  stories: Story[];
  type: string;
  plannedStart: string;
  plannedEnd: string;
  labels: string[];
}

export interface Story {
  name: string;
  type: string;
  plannedStart: string;
  plannedEnd: string;
  labels: string[];
}

function labelsToStringArray(labels: string | undefined) {
  if (labels === undefined || labels.trim() === "") {
    return [];
  }
  return labels
    .split(",")
    .map((label) => label.trim())
    .filter((label) => label.startsWith("FY"));
}

function convertToTypedData(data: any): TaskOrder[] {
  return data.map((taskOrder: any) => ({
    ...taskOrder,
    portfolioEpics: (taskOrder.portfolioEpics || []).map(
      (portfolioEpic: any) => ({
        ...portfolioEpic,
        capabilities: (portfolioEpic.capabilities || []).map(
          (capability: any) => ({
            ...capability,
            epics: (capability.epics || []).map((epic: any) => ({
              ...epic,
              stories: epic.stories || [],
            })),
          })
        ),
      })
    ),
  }));
}

export function parseXLSFile(file: File): Promise<any> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const data = event.target?.result;
      const workbook = XLSX.read(
        data,
        { type: "binary" },
        { cellStyles: true }
      );
      const sheetNameList = workbook.SheetNames;
      const worksheetData = XLSX.utils.sheet_to_json(
        workbook.Sheets[sheetNameList[0]]
      );
      console.log("Worksheet Data:", worksheetData);
      let rows = workbook.Sheets[sheetNameList[0]]["!rows"].slice(1);
      rows = Array.from(rows, (item) =>
        item === undefined ? { level: 0 } : item
      );
      const combinedData = worksheetData.map((item: any, index: any) => {
        return { ...item, ...rows[index], id: index };
      });
      console.log("Combined Data:", combinedData);
      const processedData = processData(combinedData);
      console.log("Processed Data:", processedData);
      const typedData = convertToTypedData(processedData);
      console.log("Typed Data:", typedData);
      resolve(typedData);
    };
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
}
