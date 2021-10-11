const { ipcMain, BrowserWindow, app } = require("electron"),
  path = require("path"),
  isDev = require("electron-is-dev"),
  pie = require("puppeteer-in-electron"),
  puppeteer = require("puppeteer-core"),
  cheerio = require("cheerio"),
  fs = require("fs");

const today = new Date();
const dateFormater = (str) => {
  let date = undefined;
  if (str.indexOf("일") != -1) {
    date = str.replace(/\s/g, "");
    date = date.indexOf("오후") != -1 ? date + " PM" : date;
    date = date
      .replace("월", "-")
      .replace("일", "")
      .replace("오전", " ")
      .replace("오후", " ")
      .replace("까지", "");
    date = date.indexOf("년") != -1 ? date.replace("년", "-") : today.getFullYear() + "-" + date;
    date = new Date(date);
  }
  return date;
};
const url = "https://knulms.kongju.ac.kr";
const basePath = `${app.getPath("appData")}/KNULMS/`;
const loginInfoPath = basePath + "loginInfo.json";

//기본경로가 없으면 생성
!fs.existsSync(basePath) && fs.mkdirSync(basePath);

let subjectData = [];

let browser = (async () => {
  // browser.pages is not a function 에러로 인한 선언형태
  await pie.initialize(app);
  browser = await pie.connect(app, puppeteer);
})();

let mainWin;
const main = async () => {
  mainWin = await createMainWin();
  mainWin.on("close", () => {
    app.quit();
  });
  const savedLoginInfo = get_saved_login_info();
  ipcMain.on("login", async (event, loginInfo) => {
    if (await login(loginInfo)) {
      if (savedLoginInfo.id === loginInfo.id && savedLoginInfo.password === loginInfo.password) {
        mainWin.webContents.send("login-success");
        subjectData = await get_all_subject_info();
        set_subject_data();
      } else {
        //new-user을 전송하고 화면 표시 후 사용자가 버튼을 누르면 set-target-subject 수신
        mainWin.webContents.send("new-user");
      }
    } else {
      mainWin.webContents.send("login-fail");
    }
  });

  ipcMain.on("set-target-subject", async (isFirst) => {
    const { win, page } = await create_sub_win(true);
    await win.loadURL(url + "/courses");
    win.on("close", async () => {
      !!isFirst && mainWin.webContents.send("login-success"); //로그인 하면서 과목설정을 하는경우에 실행
      subjectData = await get_all_subject_info();
      set_subject_data();
    });
  });

  ipcMain.on("open-lms-page", async (event, URL) => {
    const { win, page } = await create_sub_win(true);
    !!URL.data ? await win.loadURL(url + URL.data) : await win.loadURL(url + URL.subject);
    const subjectIndex = subjectData.findIndex((subject) => subject.url === URL.subject);
    win.on("close", async () => {
      subjectData[subjectIndex] = await get_subject_info(subjectData[subjectIndex]);
      set_subject_data();
    });
  });

  ipcMain.on("update-subject", () => {
    get_all_subject_info();
  });
};

function createMainWin() {
  return new Promise((resolve, reject) => {
    app.on("ready", async () => {
      const mainWin = new BrowserWindow({
        minWidth: 1200,
        minHeight: 800,
        show: false,
        webPreferences: {
          preload: path.join(__dirname, "preload.js"), // use a preload script
        },
      });
      if (isDev) {
        mainWin.loadURL("http://localhost:3000");
      } else {
        mainWin.setMenu(null);
        mainWin.loadURL(`file://${path.join(__dirname, "../build/index.html")}`);
      }
      //login view의 정보들이 모두 생성되면 mainWin을 화면에 표시하고 반환
      ipcMain.on("app-ready", () => {
        mainWin.show();
        resolve(mainWin);
      });
    });
  });
}

/*기존에 저장된 로그인 정보가 있으면 불러오고 input에 입력*/
function get_saved_login_info() {
  const savedLoginInfo = fs.existsSync(loginInfoPath)
    ? JSON.parse(fs.readFileSync(loginInfoPath))
    : { id: "", password: "" };
  savedLoginInfo && mainWin.webContents.send("saved-login-info", savedLoginInfo);
  return savedLoginInfo;
}

/*메인 창을 제외한 창 생성*/
async function create_sub_win(show) {
  const window = new BrowserWindow({
    width: 1500,
    height: 900,
    show: show,
    resizable: true,
  });
  isDev && window.show();
  const page = await pie.getPage(browser, window);
  return { win: window, page: page };
}

async function login(loginInfo) {
  if (loginInfo.id.length === 0 || loginInfo.password.length === 0) {
    return false;
  }
  const { win, page } = await create_sub_win(false);
  await win.loadURL(url + "/courses");
  //id 입력
  await page.focus("#login_user_id");
  await page.keyboard.type(loginInfo.id);
  //password 입력
  await page.focus("#login_user_password");
  await page.keyboard.type(loginInfo.password);
  await page.click("#form1 > div.login_btn > a");
  const isLogin = await (() => {
    return new Promise((resolve, reject) => {
      //로그인 성공
      page
        .waitForSelector("#content > div.header-bar", {
          timeout: 60000,
        })
        .then(() => {
          loginInfo.keep
            ? fs.writeFileSync(loginInfoPath, JSON.stringify(loginInfo))
            : fs.unlinkSync(loginInfoPath);
          resolve(true);
        });
      //로그인 실패
      page
        .waitForSelector(".content > div.error", {
          timeout: 60000,
        })
        .then(() => {
          resolve(false);
        });
    });
  })();
  win.close();
  return isLogin;
}

/*자세한 과목 정보들을 크롤링 하기위한 정보들 크롤링*/
async function get_subject_list() {
  const { win, page } = await create_sub_win(false);
  await win.loadURL(url + "/courses");
  const content = await page.content(),
    $ = cheerio.load(content);
  const subjectList = $("#my_courses_table > tbody > tr")
    .map((index, element) => ({
      star: String($(element).find("td").eq(0).find("i").attr("class")).includes("light")
        ? false
        : true,
      title: $(element).find("td").eq(1).find("a").attr("title"),
      url: $(element).find("td").eq(1).find("a").attr("href"),
    }))
    .get()
    .filter((subject) => subject.star && typeof subject.title === "string");
  win.close();
  return subjectList;
}

/*과목 정보들을 크롤링*/
async function get_subject_info(subject) {
  const { win, page } = await create_sub_win(false);
  await win.loadURL(url + subject.url + "/grades");
  const content = await page.content(),
    $ = cheerio.load(content);
  const subjectData = $("#grades_summary > tbody > .student_assignment.editable")
    .map((index, element) => {
      const splitURL = $(element).find("th > a").attr("href").split("/");
      const url = splitURL.slice(0, -2).join("/");
      const deadLine = dateFormater($(element).find("td.due").text()),
        name = $(element).find("th > a").text(),
        isDone =
          $(element).find("td.assignment_score > div > span > span").text().indexOf("-") == -1
            ? true
            : false,
        isFail =
          deadLine == undefined ? false : deadLine <= today && isDone == false ? true : false,
        type = $(element).find("th>.context").text();
      return {
        name: name,
        url: url,
        type: type,
        deadline: deadLine,
        done: isDone,
        fail: isFail,
      };
    })
    .get();

  win.close();
  return {
    title: subject.title,
    url: subject.url,
    data: subjectData,
  };
}

/*모든 과목 크롤링*/
async function get_all_subject_info() {
  mainWin.webContents.send("update-start");
  const subjectList = await get_subject_list();
  const subjectInfo = await Promise.all(
    subjectList.map((subject) => {
      return get_subject_info(subject);
    })
  );
  mainWin.webContents.send("update-finish");
  return subjectInfo;
}

/*과목 정보 front로 전송*/
function set_subject_data() {
  mainWin.webContents.send("set-subject-data", subjectData);
}

main();
