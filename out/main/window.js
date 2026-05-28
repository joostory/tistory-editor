"use strict";
const settings = require("electron-settings");
const { app, BrowserWindow, Menu, shell, dialog } = require("electron");
const path = require("path");
require("fs");
const url = require("url");
const appInfo = require("./appInfo");
let mainWindow = null;
function setWindowEvent() {
  mainWindow.on("close", (e) => {
    if (app.showExitPrompt) {
      e.preventDefault();
      dialog.showMessageBox({
        type: "question",
        buttons: ["Yes", "No"],
        title: "Confirm",
        message: "지금 앱을 종료하면 저장하지 않는 내용이 사라집니다. 종료하시겠습니까?"
      }).then((result) => {
        if (result.response === 0) {
          app.showExitPrompt = false;
          mainWindow.close();
        }
      });
    }
    settings.setSync("config", mainWindow.getBounds());
  });
  mainWindow.on("closed", function() {
    mainWindow = null;
  });
}
function setWindowWebContents() {
  if (process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL, {
      userAgent: appInfo.userAgentFull
    });
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadURL(url.format({
      pathname: path.join(__dirname, "../renderer/index.html"),
      protocol: "file:",
      slashes: true
    }), {
      userAgent: appInfo.userAgentFull
    });
  }
  mainWindow.webContents.setWindowOpenHandler(({ url: url2 }) => {
    if ((url2.startsWith("http:") || url2.startsWith("https:")) && (!process.env.ELECTRON_RENDERER_URL || !url2.startsWith(process.env.ELECTRON_RENDERER_URL)) && !url2.startsWith("http://localhost:5173")) {
      shell.openExternal(url2);
    }
    return { action: "deny" };
  });
  mainWindow.webContents.on("will-navigate", (e, url2) => {
    if (!url2.startsWith("file://") && (!process.env.ELECTRON_RENDERER_URL || !url2.startsWith(process.env.ELECTRON_RENDERER_URL)) && !url2.startsWith("http://localhost:5173")) {
      e.preventDefault();
      if (url2.startsWith("http:") || url2.startsWith("https:")) {
        shell.openExternal(url2);
      }
    }
  });
  require("@electron/remote/main").enable(mainWindow.webContents);
}
function setWindowMenu() {
  mainWindow.setMenu(null);
  var template = [
    {
      label: "Application",
      submenu: [
        { label: "About", click() {
          appInfo.openWindow();
        } },
        { label: "Preferences...", accelerator: "CmdOrCtrl+,", click() {
          mainWindow.webContents.send("open-preference");
        } },
        { type: "separator" },
        { label: "Quit", accelerator: "CmdOrCtrl+Q", click() {
          app.quit();
        } }
      ]
    },
    {
      label: "Edit",
      submenu: [
        { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
        { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
        { type: "separator" },
        { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
        { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
        { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
        { label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" }
      ]
    },
    {
      label: "View",
      submenu: [
        { label: "Toggle Fullscreen", accelerator: "F11", click() {
          mainWindow.setFullScreen(!mainWindow.isFullScreen());
        } }
      ]
    }
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}
function createWindow(config) {
  mainWindow = new BrowserWindow({
    width: config.width,
    height: config.height,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    },
    icon: path.join(__dirname, "/../../build/icons/512x512.png")
  });
  setWindowEvent();
  setWindowWebContents();
  setWindowMenu();
}
function getWindowConfig() {
  let data = settings.getSync("config");
  if (!data) {
    data = {
      width: 1024,
      height: 720
    };
  }
  return data;
}
module.exports.initWindow = function initWindow() {
  if (mainWindow !== null) {
    return;
  }
  createWindow(getWindowConfig());
};
module.exports.getWindow = () => mainWindow;
