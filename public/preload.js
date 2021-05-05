const { contextBridge, ipcRenderer } = require("electron");

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object

contextBridge.exposeInMainWorld("api", {
  send: (channel, data) => {
    // whitelist channels
    let validChannels = ["toMain"];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  receive: (channel, func) => {
    switch (channel) {
      case "fromLMS": {
        ipcRenderer.on(channel, (event, ...args) => func(...args));
        break;
      }
      case "fromLogin": {
        ipcRenderer.on(channel, (event, ...args) => func(...args));
        break;
      }
    }
  },
});
