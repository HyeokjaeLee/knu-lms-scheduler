const puppeteer = require("puppeteer");
const cheerio = require("cheerio");

const knuLMS = "https://knulms.kongju.ac.kr";
const today = new Date();

//Main
//D:\Workspace\knu-lms-Scheduler\node_modules\puppeteer\.local-chromium\win64-856583\chrome-win
const LMS_crawler = async (id, pw, semester) => {
  const browser = await puppeteer.launch({
    executablePath:
      "./node_modules/puppeteer/.local-chromium/win64-856583/chrome-win/chrome.exe",
    headless: true,
  });
  await login();
  const subjectList = await get_subject_list();
  const result = [];
  await Promise.all(
    subjectList.map(async (subject) => {
      result.push({
        title: subject.title,
        url: knuLMS + subject.url + "/external_tools/1",
        data: await get_a_subject_data(subject.url),
      });
    })
  );
  browser.close();
  console.log(result);
  return result;
  //--------------------------------------------------
  async function get_a_subject_data(url) {
    const page = await browser.newPage();
    await page.goto(`${knuLMS + url}/grades`);
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
        isFail = deadLine <= today && isDone == false ? true : false;
      subjectData.push({
        name: name,
        deadLine: deadLine,
        done: isDone,
        fail: isFail,
      });
    });
    return subjectData;
  }

  async function login() {
    const loginPage = await browser.newPage();
    await loginPage.goto(knuLMS + "/courses");
    await loginPage.evaluate(
      (id, pw) => {
        document.querySelector('input[name="login_user_id"]').value = id;
        document.querySelector('input[name="login_user_password"]').value = pw;
      },
      id,
      pw
    );
    await loginPage.click('div[class="login_btn"]');
    await loginPage.waitForSelector("#content > div.header-bar");
    loginPage.close();
  }

  async function get_subject_list() {
    const listPage = await browser.newPage();
    await listPage.goto(knuLMS + "/courses");
    const result = [];
    const content = await listPage.content();
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
    listPage.close();
    return result.filter((data) => data.semester == semester);
  }
};

const removeEmpty = (str) => str.replace(/\s/g, "");
const dateFormater = (str) => {
  const year = today.getFullYear();
  let strDate = removeEmpty(str);
  strDate = strDate.indexOf("오후") != -1 ? strDate + " PM" : strDate;
  strDate =
    year +
    "-" +
    strDate
      .replace("월", "-")
      .replace("일", "")
      .replace("오후", " ")
      .replace("까지", "");
  return new Date(strDate);
};

exports.LMS_crawler = LMS_crawler;
