const { ipcMain, BrowserWindow, app } = require("electron"),
  path = require("path"),
  isDev = require("electron-is-dev"),
  pie = require("puppeteer-in-electron"),
  puppeteer = require("puppeteer-core"),
  cheerio = require("cheerio"),
  fs = require("fs");
const today = new Date();
const removeEmpty = (str) => str.replace(/\s/g, ""),
  dateFormater = (str) => {
    let date = undefined;
    if (str.indexOf("일") != -1) {
      date = removeEmpty(str);
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

let browser = (async () => {
  // browser.pages is not a function 에러로 인한 선언형태
  await pie.initialize(app);
  browser = await pie.connect(app, puppeteer);
})();

!fs.existsSync(basePath) && fs.mkdirSync(basePath);

let mainWin, crawlerWin, crawlerPage;

const main = async () => {
  mainWin = await createMainWin();

  let savedLoginInfo;
  /*저장된 로그인 정보가 있다면 로그인 정보를 불러옴*/
  if (fs.existsSync(loginInfoPath)) {
    savedLoginInfo = JSON.parse(fs.readFileSync(loginInfoPath));
    mainWin.webContents.send("loginInfo", savedLoginInfo);
  }

  /*로그인 시도 후 실행*/
  ipcMain.on("loginInfo", async (event, loginInfo) => {
    if (await login(loginInfo)) {
      mainWin.webContents.send("loginSuccess");
      if (savedLoginInfo.id === loginInfo.id && savedLoginInfo.pw === loginInfo.pw) {
        console.log("same");
      } else {
        console.log("dif");
      }
      const subjectList = await get_subject_list();
      const test = await Promise.all(subjectList.map((subject) => get_subject_info(subject)));

      console.log(test);
    } else {
      mainWin.webContents.send("loginFail");
    }
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
      mainWin.on("close", () => {
        app.quit();
      });
      if (isDev) {
        mainWin.loadURL("http://localhost:3000");
      } else {
        mainWin.setMenu(null);
        mainWin.loadURL(`file://${path.join(__dirname, "../build/index.html")}`);
      }
      //login view의 정보들이 모두 생성되면 mainWin을 화면에 표시하고 반환
      ipcMain.on("appReady", () => {
        mainWin.show();
        resolve(mainWin);
      });
    });
  });
}

async function create_sub_win() {
  const window = new BrowserWindow({
    width: 800,
    height: 800,
    show: true,
    resizable: false,
  });
  isDev && window.show();
  const page = await pie.getPage(browser, window);
  return { win: window, page: page };
}

async function login(loginInfo) {
  const { win, page } = await create_sub_win();
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

main();

async function get_subject_list() {
  const { win, page } = await create_sub_win();
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

async function get_subject_info(subject) {
  const { win, page } = await create_sub_win();
  await win.loadURL(url + subject.url + "/grades");
  const content = await page.content(),
    $ = cheerio.load(content);
  const subjectData = $("#grades_summary > tbody > .student_assignment.editable")
    .map((index, element) => {
      const deadLine = dateFormater($(element).find("td.due").text()),
        name = $(element).find("th > a").text(),
        isDone =
          $(element).find("td.assignment_score > div > span > span").text().indexOf("-") == -1
            ? true
            : false,
        isFail =
          deadLine == undefined ? false : deadLine <= today && isDone == false ? true : false;
      return {
        name: name,
        deadLine: deadLine,
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

function crawlerBackup() {
  //Front 에서 toMain 채널로 정보 전달 시 실행
  ipcMain.on("toMain", async () => {
    const result = [],
      knuLMS = "https://knulms.kongju.ac.kr",
      subWin = new BrowserWindow({
        width: 800,
        height: 800,
        show: true,
        resizable: false,
      });
    subWin.setMenu(null);
    let page = await pie.getPage(browser, subWin); //사람이 로그인하는동안 작동(선 배치 시 로그인 페이지 로딩 지연)
    await subWin.loadURL(knuLMS + "/courses");
    subWin.show();
    await page.waitForSelector("#content > div.header-bar", {
      timeout: 60000, //로그인 대기 시간 1시간(1시간 이내 로그인 안할 시 오류 발생)
    });
    subWin.hide();
    const subjectList = (
      await (async () => {
        const content = await page.content(),
          $ = cheerio.load(content);
        return $("#my_courses_table > tbody > tr")
          .map((index, element) => ({
            title: $(element).find("td").eq(1).find("a").attr("title"),
            url: $(element).find("td").eq(1).find("a").attr("href"),
          }))
          .get();
      })()
    ).filter((_subject) => typeof _subject.url === "string");
    const subjectCount = subjectList.length;
    mainWin.webContents.send("fromLogin", subjectCount);
    const get_a_subject_data = async (url) => {
      await subWin.loadURL(`${knuLMS + url}/grades`);
      const content = await page.content(),
        $ = cheerio.load(content);
      return $("#grades_summary > tbody > .student_assignment.editable")
        .map((index, element) => {
          const deadLine = dateFormater($(element).find("td.due").text()),
            name = $(element).find("th > a").text(),
            isDone =
              $(element).find("td.assignment_score > div > span > span").text().indexOf("-") == -1
                ? true
                : false,
            isFail =
              deadLine == undefined ? false : deadLine <= today && isDone == false ? true : false;
          return {
            name: name,
            deadLine: deadLine,
            done: isDone,
            fail: isFail,
          };
        })
        .get();
    };
    page = await pie.getPage(browser, subWin); //초기화(없으면 오류남)
    //하나의 subWin을 공유하기 때문에 병렬처리 하면 오류발생(map, forEach 사용 불가)
    for (i = 0; i < subjectList.length; i++) {
      result.push({
        title: subjectList[i].title,
        url: knuLMS + subjectList[i].url + "/external_tools/1",
        data: await get_a_subject_data(subjectList[i].url),
      });
      mainWin.webContents.send("fromCrawler", i + 1);
    }
    subWin.close();
    mainWin.webContents.send("fromLMS", result);
  });
}
