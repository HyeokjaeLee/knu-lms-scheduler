const { BrowserWindow, app } = require("electron"),
  path = require("path"),
  isDev = require("electron-is-dev");

app.on("ready", () => {
  create_main_window();
});

app.on("window-all-closed", () => {
  app.quit();
});

function create_main_window() {
  const win = new BrowserWindow({
    width: 1200,
    height: 1000,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"), // use a preload script
    },
  });
  win
    .loadURL(
      isDev
        ? "http://localhost:3000"
        : `file://${path.join(__dirname, "../build/index.html")}`
    )
    .then(
      win.once("ready-to-show", () => {
        win.show();
      })
    );
}
