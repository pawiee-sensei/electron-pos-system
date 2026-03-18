const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const products = require("./modules/products");
const checkout = require("./modules/checkout");
const sales = require("./modules/sales");
const security = require("./modules/security");
const auth = require("./modules/auth");

ipcMain.handle("login", async (event,data)=>{

    const user = await auth.login(data.username,data.password);

    if(user){
        return { success:true, user };
    }else{
        return { success:false };
    }

});

ipcMain.handle("verify-pin", async (event,pin) => {

    return await security.verifyPin(pin);

});

ipcMain.handle("get-sales", async (event,date) => {
    return await sales.getSales(date);
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
        data.payment,
        data.staffId
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

