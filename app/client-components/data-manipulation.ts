const XLSX = require('xlsx');

function transformData(data: any) {
  return data.map((item: any) => {
    if (item.level === 0) {
      return { type: "task order", ...item };
    } else if (item.level === 1) {
      const plannedStartDate = excelDateToJSDate(item["Planned Start"]);
      const plannedEndDate = excelDateToJSDate(item["Planned End"]);
      return {
        type: "portfolio epic",
        plannedStart: plannedStartDate,
        plannedEnd: plannedEndDate,
        ...item,
      };
    } else if (item.level === 2) {
      const plannedStartDate = excelDateToJSDate(item["Planned Start"]);
      const plannedEndDate = excelDateToJSDate(item["Planned End"]);
      return {
        type: "capability",
        plannedStart: plannedStartDate,
        plannedEnd: plannedEndDate,
        ...item,
      };
    } else if (item.level === 3) {
      return { type: "epic", ...item };
    } else if (item.level === 4) {
      return { type: "story", ...item };
    } else {
      return { type: "unknown", ...item };
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
  let taskOrder = "";
  let portfolioEpic = "";
  let capability = "";
  let epic = "";
  let newData = [];
  for (let i = 0; i < data.length; i++) {
    if (data[i].type === "task order") {
      taskOrder = data[i].Summary;
      newData.push(data[i]);
    } else if (data[i].type === "portfolio epic") {
      portfolioEpic = data[i].Summary;
      newData.push({ ...data[i], taskOrder: taskOrder });
    } else if (data[i].type === "capability") {
      capability = data[i].Summary;
      newData.push({
        ...data[i],
        taskOrder: taskOrder,
        portfolioEpic: portfolioEpic,
      });
    } else if (data[i].type === "epic") {
      epic = data[i].Summary;
      newData.push({
        ...data[i],
        taskOrder: taskOrder,
        portfolioEpic: portfolioEpic,
        capability: capability,
      });
    } else if (data[i].type === "story") {
      newData.push({
        taskOrder: taskOrder,
        portfolioEpic: portfolioEpic,
        capability: capability,
        epic: epic,
        story: data[i].name,
      });
    }
  }
  return newData;
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
  return processedData;
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
function labelsToStringArray(labels : string | undefined){
  if(labels === undefined){
    return [];
  }
  return labels.split(', ');
}

function convertToTypedData(data: any): TaskOrder[] {
  let taskOrders: TaskOrder[] = [];
  let portfolioEpics: PortfolioEpic[] = [];
  let capabilities: Capability[] = [];
  let epics: Epic[] = [];
  let stories: Story[] = [];

  data.forEach((item: any) => {
    if (item.type === "task order") {
      let taskOrder: TaskOrder = {
        name: item.Summary,
        portfolioEpics: [],
      };
      taskOrders.push(taskOrder);
    } else if (item.type === "portfolio epic") {
      let portfolioEpic: PortfolioEpic = {
        name: item.Summary,
        capabilities: [],
        plannedStart: item.plannedStart,
        plannedEnd: item.plannedEnd,
        taskOrder: item.taskOrder,
        storyProgress: item["Story Progress"],
        labels: labelsToStringArray(item["Labels"]),
      };
      portfolioEpics.push(portfolioEpic);
    } else if (item.type === "capability") {
      console.log(item["Labels"])
      let capability: Capability = {
        name: item.Summary,
        epics: [],
        plannedStart: item.plannedStart,
        plannedEnd: item.plannedEnd,
        portfolioEpic: item.portfolioEpic,
        taskOrder: item.taskOrder,
        storyProgress: item["Story Progress"],
        labels: labelsToStringArray(item["Labels"]),
      };
      capabilities.push(capability);
    } else if (item.type === "epic") {
      let epic: Epic = {
        name: item.Summary,
        stories: [],
        plannedStart: item.plannedStart,
        plannedEnd: item.plannedEnd,
        storyProgress: item["Story Progress"],
        capability: item.capability,
        taskOrder: item.taskOrder,
        portfolioEpic: item.portfolioEpic,
        labels: labelsToStringArray(item["Labels"]),
      };
      epics.push(epic);
    } else if (item.type === "story") {
      let story: Story = {
        name: item.Summary,
        plannedStart: item.plannedStart,
        plannedEnd: item.plannedEnd,
        storyProgress: item["Story Progress"],
        capability: item.capability,
        epic: item.epic,
        taskOrder: item.taskOrder,
        portfolioEpic: item.portfolioEpic,
        labels: labelsToStringArray(item["Labels"]),
      };
      stories.push(story);
    }
  });

  taskOrders.forEach((taskOrder) => {
    portfolioEpics.forEach((portfolioEpic) => {
      if (portfolioEpic.taskOrder === taskOrder.name) {
        taskOrder.portfolioEpics.push(portfolioEpic);
      }
    });
  });

  //now we need to assign the capabilities to the portfolio epics
  portfolioEpics.forEach((portfolioEpic) => {
    capabilities.forEach((capability) => {
      if (capability.portfolioEpic === portfolioEpic.name) {
        portfolioEpic.capabilities.push(capability);
      }
    });
  });

  //now we need to assign the epics to the capabilities
  capabilities.forEach((capability) => {
    epics.forEach((epic) => {
      if (epic.capability === capability.name) {
        capability.epics.push(epic);
      }
    });
  });

  //now we need to assign the stories to the epics
  epics.forEach((epic) => {
    stories.forEach((story) => {
      if (story.epic === epic.name) {
        epic.stories.push(story);
      }
    });
  });

  return taskOrders;
}

export function oldParseXLSFile(file: File) : any{
  const reader = new FileReader();
  let results : any;
  reader.onload = (event) => {
    const data = event.target?.result;
    const workbook = XLSX.read(data, { type: 'binary' }, { cellStyles: true });
    const sheetNameList = workbook.SheetNames;
    const worksheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetNameList[0]]);
    //now I need all of the rows after the first one (first one is headers)
    let rows = workbook.Sheets[sheetNameList[0]]['!rows'].slice(1);
    rows = Array.from(rows, item => item === undefined ? {level : 0} : item);
    //now combine the worksheet data with the rows
    const combinedData = worksheetData.map((item : any, index : any) => {
      return {...item, ...rows[index], id: index}
    });
    const processedData = processData(combinedData);
    console.log(processedData)
    results = processedData;
  };
  reader.readAsArrayBuffer(file);
  console.log(results)
  return results;
}

export function parseXLSFile(file: File): Promise<any> {
  return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
          const data = event.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' }, { cellStyles: true });
          const sheetNameList = workbook.SheetNames;
          const worksheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetNameList[0]]);
          let rows = workbook.Sheets[sheetNameList[0]]['!rows'].slice(1);
          rows = Array.from(rows, item => item === undefined ? {level : 0} : item);
          const combinedData = worksheetData.map((item : any, index : any) => {
              return {...item, ...rows[index], id: index}
          });
          const processedData = processData(combinedData);
          const typedData = convertToTypedData(processedData);
          resolve(typedData);
      };
      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(file);
  });
}
