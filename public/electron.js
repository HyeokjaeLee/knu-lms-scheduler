const { ipcMain, BrowserWindow, app } = require("electron"),
  path = require("path"),
  isDev = require("electron-is-dev"),
  pie = require("puppeteer-in-electron"),
  puppeteer = require("puppeteer-core"),
  cheerio = require("cheerio"),
  today = new Date();

let mainWindow; //실제 user가 조작하는 window
let subWindow; //crawler가 작동하는 window
let browser;
async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 1000,
    webPreferences: {
      nodeIntegration: true, // is default value after Electron v5
      preload: path.join(__dirname, "preload.js"), // use a preload script
      contextIsolation: true, // protect against prototype pollution
      enableRemoteModule: false, // turn off remote
    },
  });
  //
  mainWindow.loadURL(
    isDev
      ? "http://localhost:3000"
      : `file://${path.join(__dirname, "../build/index.html")}`
  );
  mainWindow.on("closed", () => (mainWindow = null));
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});

(async () => {
  await pie.initialize(app);
  browser = await pie.connect(app, puppeteer);
  subWindow = new BrowserWindow({ width: 800, height: 900, show: false });
})();

ipcMain.on("toMain", async (event, semester) => {
  const lms_data = await LMS_crawler(semester);
  mainWindow.webContents.send("fromLMS", lms_data);
});

const LMS_crawler = async (semester) => {
  const knuLMS = "https://knulms.kongju.ac.kr";
  await subWindow.loadURL(knuLMS);
  await login();
  const subjectList = await get_subject_list();
  const result = [];
  for (i = 0; i < subjectList.length; i++) {
    result.push({
      title: subjectList[i].title,
      url: knuLMS + subjectList[i].url + "/external_tools/1",
      data: await get_a_subject_data(subjectList[i].url),
    });
  }
  subWindow.close();
  return result;

  async function login() {
    subWindow.show();
    await subWindow.loadURL(knuLMS + "/courses");
    const page = await pie.getPage(browser, subWindow);
    await page.waitForSelector("#content > div.header-bar", {
      timeout: 999999,
    });
    await page.wait;
    mainWindow.webContents.send("fromLogin", true);
    //subWindow.hide();
  }

  async function get_a_subject_data(url) {
    await subWindow.loadURL(`${knuLMS + url}/grades`);
    const page = await pie.getPage(browser, subWindow);
    const content = await page.content();
    const $ = cheerio.load(content);
    const taskSelector = $(
      "#grades_summary > tbody > .student_assignment.editable"
    );
    const subjectData = [];
    taskSelector.map((index, element) => {
      const deadLine = dateFormater($(element).find("td.due").text()),
        name = $(element).find("th > a").text(),
        isDone =
          $(element)
            .find("td.assignment_score > div > span > span")
            .text()
            .indexOf("-") == -1
            ? true
            : false,
        isFail =
          deadLine == undefined
            ? false
            : deadLine <= today && isDone == false
            ? true
            : false;
      subjectData.push({
        name: name,
        deadLine: deadLine,
        done: isDone,
        fail: isFail,
      });
    });
    return subjectData;
  }

  async function get_subject_list() {
    await subWindow.loadURL(knuLMS + "/courses");
    const result = [];
    const page = await pie.getPage(browser, subWindow);
    const content = await page.content();
    const $ = cheerio.load(content);
    const trCount = $("#my_courses_table > tbody").find("tr").length;
    const infoDir = (eq1, eq2) =>
      $("#my_courses_table > tbody").find("tr").eq(eq1).find("td").eq(eq2);
    for (i = 1; i < trCount; i++) {
      result.push({
        title: infoDir(i, 1).find("a").attr("title"),
        url: infoDir(i, 1).find("a").attr("href"),
        semester: removeEmpty(infoDir(i, 3).text()),
      });
    }
    return result.filter((data) => data.semester == semester);
  }
};

const removeEmpty = (str) => str.replace(/\s/g, "");
const dateFormater = (str) => {
  let strDate = removeEmpty(str);
  strDate = strDate.indexOf("오후") != -1 ? strDate + " PM" : strDate;
  strDate = strDate
    .replace("월", "-")
    .replace("일", "")
    .replace("오후", " ")
    .replace("까지", "");
  const year = today.getFullYear(),
    date = new Date(year + "-" + strDate);
  return date.getMonth() == 0 ? undefined : date;
};
