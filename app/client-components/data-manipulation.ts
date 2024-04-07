const XLSX = require("xlsx");

function transformData(data: any) {
  return data.map((item: any) => {
    const issueType = item["Issue Type"]?.trim().toLowerCase();

    switch (issueType) {
      case "task order":
        return { type: "task order", name: item.Summary, ...item };
      case "portfolio epic":
        const plannedStartDatePE = excelDateToJSDate(item["Planned Start"]);
        const plannedEndDatePE = excelDateToJSDate(item["Planned End"]);
        return {
          type: "portfolio epic",
          plannedStart: plannedStartDatePE,
          plannedEnd: plannedEndDatePE,
          ...item,
        };
      case "capability":
        const plannedStartDateC = excelDateToJSDate(item["Planned Start"]);
        const plannedEndDateC = excelDateToJSDate(item["Planned End"]);
        return {
          type: "capability",
          name: item.Summary,
          plannedStart: plannedStartDateC,
          plannedEnd: plannedEndDateC,
          labels: labelsToStringArray(item.Labels),
          ...item,
        };
      case "epic":
        return { type: "epic", ...item };
      case "story":
        return { type: "story", ...item };
      default:
        switch (item.level) {
          case 0:
            return { type: "task order", name: item.Summary, ...item };
          case 1:
            const plannedStartDatePE2 = excelDateToJSDate(
              item["Planned Start"]
            );
            const plannedEndDatePE2 = excelDateToJSDate(item["Planned End"]);
            return {
              type: "portfolio epic",
              plannedStart: plannedStartDatePE2,
              plannedEnd: plannedEndDatePE2,
              ...item,
            };
          case 2:
            const plannedStartDateC2 = excelDateToJSDate(item["Planned Start"]);
            const plannedEndDateC2 = excelDateToJSDate(item["Planned End"]);
            return {
              type: "capability",
              name: item.Summary,
              plannedStart: plannedStartDateC2,
              plannedEnd: plannedEndDateC2,
              labels: labelsToStringArray(item.Labels),
              ...item,
            };
          case 3:
            return { type: "epic", ...item };
          case 4:
            return { type: "story", ...item };
          default:
            return {
              type: issueType || "unknown",
              name: item.Summary,
              ...item,
            };
        }
    }
  });
}

function excelDateToJSDate(serial: number) {
  const date = new Date(Math.round((serial - 25569) * 86400 * 1000));
  //now get it in the format of MM/DD/YYYY
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
        // Handle the case when a portfolio epic is not under any task order
        currentPortfolioEpic = { ...item, capabilities: [] };
        taskOrders.push({
          name: "Unassigned",
          portfolioEpics: [currentPortfolioEpic],
        });
      }
    } else if (item.type === "capability") {
      if (currentPortfolioEpic) {
        currentCapability = { ...item, epics: [] };
        currentPortfolioEpic.capabilities.push(currentCapability);
        currentEpic = null;
      } else if (currentTaskOrder) {
        currentCapability = { ...item, epics: [] };
        currentTaskOrder.portfolioEpics.push({
          name: "Unassigned",
          capabilities: [currentCapability],
        });
      } else {
        // Handle the case when a capability is not under any task order or portfolio epic
        currentCapability = { ...item, epics: [] };
        taskOrders.push({
          name: "Unassigned",
          portfolioEpics: [
            { name: "Unassigned", capabilities: [currentCapability] },
          ],
        });
      }
    } else if (item.type === "epic") {
      if (currentCapability) {
        currentEpic = { ...item, stories: [] };
        currentCapability.epics.push(currentEpic);
      } else if (currentPortfolioEpic) {
        currentEpic = { ...item, stories: [] };
        currentPortfolioEpic.capabilities.push({
          name: "Unassigned",
          epics: [currentEpic],
        });
      } else if (currentTaskOrder) {
        currentEpic = { ...item, stories: [] };
        currentTaskOrder.portfolioEpics.push({
          name: "Unassigned",
          capabilities: [{ name: "Unassigned", epics: [currentEpic] }],
        });
      } else {
        // Handle the case when an epic is not under any task order, portfolio epic, or capability
        currentEpic = { ...item, stories: [] };
        taskOrders.push({
          name: "Unassigned",
          portfolioEpics: [
            {
              name: "Unassigned",
              capabilities: [{ name: "Unassigned", epics: [currentEpic] }],
            },
          ],
        });
      }
    } else if (item.type === "story") {
      if (currentEpic) {
        currentEpic.stories.push(item);
      } else if (currentCapability) {
        currentCapability.epics.push({ name: "Unassigned", stories: [item] });
      } else if (currentPortfolioEpic) {
        currentPortfolioEpic.capabilities.push({
          name: "Unassigned",
          epics: [{ name: "Unassigned", stories: [item] }],
        });
      } else if (currentTaskOrder) {
        currentTaskOrder.portfolioEpics.push({
          name: "Unassigned",
          capabilities: [
            {
              name: "Unassigned",
              epics: [{ name: "Unassigned", stories: [item] }],
            },
          ],
        });
      } else {
        // Handle the case when a story is not under any task order, portfolio epic, capability, or epic
        taskOrders.push({
          name: "Unassigned",
          portfolioEpics: [
            {
              name: "Unassigned",
              capabilities: [
                {
                  name: "Unassigned",
                  epics: [{ name: "Unassigned", stories: [item] }],
                },
              ],
            },
          ],
        });
      }
    }
  });

  return taskOrders;
}

// function transformData(data: any){
//   return data.map((item: any) => transformDataPoint(item));
// }

export function processData(data: any) {
  const transformedData = transformData(data);
  const processedData = categorizeAndStructureTasks(transformedData);
  const typedData = convertToTypedData(processedData);
  // console.log(typedData);
  // console.log(processedData);
  return typedData;
}

export interface TaskOrder {
  name: string;
  portfolioEpics: PortfolioEpic[];
}

export interface PortfolioEpic {
  name: string;
  capabilities: Capability[];
  plannedStart: string;
  plannedEnd: string;
  storyProgress: string;
  taskOrder: string;
  labels: string[];
}

export interface Capability {
  name: string;
  epics: Epic[];
  plannedStart: string;
  plannedEnd: string;
  storyProgress: string;
  portfolioEpic: string;
  taskOrder: string;
  labels: string[];
}

export interface Epic {
  name: string;
  stories: Story[];
  plannedStart: string;
  plannedEnd: string;
  storyProgress: string;
  taskOrder: string;
  portfolioEpic: string;
  capability: string;
  labels: string[];
}

export interface Story {
  name: string;
  plannedStart: string;
  plannedEnd: string;
  storyProgress: string;
  taskOrder: string;
  portfolioEpic: string;
  capability: string;
  epic: string;
  labels: string[];
}

//takes in labels in this format FY24Q1, FY24Q2, converts to an array of strings
// data-manipulation.ts

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

export function oldParseXLSFile(file: File): any {
  const reader = new FileReader();
  let results: any;
  reader.onload = (event) => {
    const data = event.target?.result;
    const workbook = XLSX.read(data, { type: "binary" }, { cellStyles: true });
    const sheetNameList = workbook.SheetNames;
    const worksheetData = XLSX.utils.sheet_to_json(
      workbook.Sheets[sheetNameList[0]]
    );
    //now I need all of the rows after the first one (first one is headers)
    let rows = workbook.Sheets[sheetNameList[0]]["!rows"].slice(1);
    rows = Array.from(rows, (item) =>
      item === undefined ? { level: 0 } : item
    );
    //now combine the worksheet data with the rows
    const combinedData = worksheetData.map((item: any, index: any) => {
      return { ...item, ...rows[index], id: index };
    });
    const processedData = processData(combinedData);
    console.log(processedData);
    results = processedData;
  };
  reader.readAsArrayBuffer(file);
  console.log(results);
  return results;
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
