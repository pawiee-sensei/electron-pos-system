const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {

  getProducts: () => ipcRenderer.invoke("get-products"),

  processSale: (data) => ipcRenderer.invoke("process-sale", data)

});