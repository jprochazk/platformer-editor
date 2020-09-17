#!/usr/bin/env node

const electron = require("electron");
const { app, BrowserWindow } = electron;
const path = require("path");
const url = require("url");

// Let electron reloads by itself when webpack watches changes in ./app/
// if (process.env.ELECTRON_START_URL) {
//     require("electron-reload")(__dirname, {
//         electron: path.join(__dirname, "node_modules", ".bin", "electron"),
//     });
// }

// To avoid being garbage collected
let mainWindow;

app.on("ready", () => {
    let mainWindow = new BrowserWindow({
        width: 1600,
        height: 900,
        webPreferences: { nodeIntegration: true },
    });
    mainWindow.setMenuBarVisibility(false);

    const startUrl =
        process.env.ELECTRON_START_URL ||
        url.format({
            pathname: path.join(__dirname, "./dist/index.html"),
            protocol: "file:",
            slashes: true,
        });

    console.log(startUrl);
    mainWindow.loadURL(startUrl);

    if (process.env.ELECTRON_START_URL) {
        mainWindow.webContents.openDevTools();
    }

    mainWindow.on("closed", function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    });
});

// Quit when all windows are closed.
app.on("window-all-closed", function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
});
