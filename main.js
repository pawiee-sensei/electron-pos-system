const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const products = require("./modules/products");

ipcMain.handle("get-products", async () => {
  const data = await products.getAllProducts();
  return data;
});

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    fullscreen: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.loadFile("renderer/index.html");
}

app.whenReady().then(async () => {

  const data = await products.getAllProducts();
  console.log("Products from DB:", data);

  createWindow();

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

});

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});