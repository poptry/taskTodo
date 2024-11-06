"use strict";
import { app, protocol, BrowserWindow, ipcMain } from "electron";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
import installExtension, { VUEJS_DEVTOOLS } from "electron-devtools-installer";

const path = require("path");
const { initDatabase } = require("../dist_electron/electron/database"); // 导入数据库模块
const {
  addTasks,
  getTasks,
  updateTask,
  getTasksByDate,
} = require("../dist_electron/electron/incident"); // 导入处理函数
const isDevelopment = process.env.NODE_ENV !== "production";
protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { secure: true, standard: true } },
]);

async function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"), // 指定 preload 脚本
    },
  });

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
    if (!process.env.IS_TEST) win.webContents.openDevTools();
  } else {
    createProtocol("app");
    win.loadURL("app://./index.html");
  }
}

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
app.whenReady().then(async () => {
  createWindow();
  //数据库初始化
  try {
    await initDatabase();
    //事件注册
    ipcMain.handle("add-tasks", addTasks); // 添加任务
    ipcMain.handle("get-tasks", getTasks); //获取所有
    ipcMain.handle("get-tasksByData", getTasksByDate); //获取单个getTasksByDate
    ipcMain.handle("update-task", updateTask); // 更新updateTask
  } catch (error) {
    console.error("数据库初始化失败", error);
  }
  //启动
  app.on("ready", async () => {
    // 开发者工具;
    if (isDevelopment && !process.env.IS_TEST) {
      try {
        await installExtension(VUEJS_DEVTOOLS);
      } catch (e) {
        console.error("Vue Devtools failed to install:", e.toString());
      }
    }
  });
});

if (isDevelopment) {
  if (process.platform === "win32") {
    process.on("message", (data) => {
      if (data === "graceful-exit") {
        app.quit();
      }
    });
  } else {
    process.on("SIGTERM", () => {
      app.quit();
    });
  }
}
