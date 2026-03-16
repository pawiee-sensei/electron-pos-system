const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const products = require("./modules/products");
const checkout = require("./modules/checkout");
const sales = require("./modules/sales");


ipcMain.handle("get-sales", async () => {
    return await sales.getSales();
});

ipcMain.handle("get-sale-items", async (event,id) => {
    return await sales.getSaleItems(id);
});

ipcMain.handle("void-sale", async (event,id) => {
    return await sales.voidSale(id);
});

ipcMain.handle("process-sale", async (event,data)=>{

    return await checkout.processSale(
        data.cart,
        data.total,
        data.payment
    );

});

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

