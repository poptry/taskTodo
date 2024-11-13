const { contextBridge, ipcRenderer } = require("electron");

// 通过 contextBridge 暴露安全的 API
contextBridge.exposeInMainWorld("api", {
  addTasksDB: async (tasks) => {
    return await ipcRenderer.invoke("add-tasks", tasks);
  },
  getTasksDB: async () => {
    return await ipcRenderer.invoke("get-tasks");
  },
  getTasksByDate: async (date) => {
    return await ipcRenderer.invoke("get-tasksByData", date);
  },
  updateTaks: async (item) => {
    return await ipcRenderer.invoke("update-task", item);
  },
  getGraphData: async (type) => {
    return await ipcRenderer.invoke("get-graphData", type);
  },
});
