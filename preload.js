const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {

  getProducts: () => ipcRenderer.invoke("get-products"),

  processSale: (data) => ipcRenderer.invoke("process-sale", data),

  getSales: (date, staffId) => ipcRenderer.invoke("get-sales", date, staffId),

  getStaff: () => ipcRenderer.invoke("get-staff"),

  getSaleItems: (id) => ipcRenderer.invoke("get-sale-items", id),

  voidSale: (id) => ipcRenderer.invoke("void-sale", id),

  verifyPin: (pin) => ipcRenderer.invoke("verify-pin", pin),

  login: (data) => ipcRenderer.invoke("login", data),

});