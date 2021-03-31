const puppeteer = require("puppeteer");
const cheerio = require("cheerio");

const hisnet_id = "201601858";
const hisnet_pw = "dlgurwo12!@";
const semester = "2021년 1학기";
const knuLMS = "https://knulms.kongju.ac.kr";

const removeEmpty = (str) => str.replace(/^\s+|\s+$/gm, "");

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();

  {
    //login
    await page.goto(knuLMS + "/courses");
    await page.evaluate(
      (id, pw) => {
        document.querySelector('input[name="login_user_id"]').value = id;
        document.querySelector('input[name="login_user_password"]').value = pw;
      },
      hisnet_id,
      hisnet_pw
    );
    await page.click('div[class="login_btn"]');
    await page.waitForSelector("#content > div.header-bar");
  }

  const subjectList = await (async () => {
    let result = [];
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
  })();

  const test = [];
  for (z = 0; z < subjectList.length; z++) {
    const aSubjectData = await getAsubjectData(subjectList[z].url);
    console.log(aSubjectData);
    test.push({
      title: subjectList[z].title,
      semester: subjectList[z].semester,
      data: aSubjectData,
    });
  }
  
  console.log(test[14]);

  async function getAsubjectData(url) {
    const result = [];
    await page.goto(`${knuLMS + url}/assignments/syllabus`);
    await page.waitForSelector("#syllabus > tbody > tr");
    await page.waitForTimeout(500);
    const content = await page.content();
    const $ = cheerio.load(content);
    const deadLineCount = $("#syllabus > tbody > tr").length;
    for (i = 0; i < deadLineCount; i++) {
      const date = $("#syllabus > tbody > tr")
        .eq(i)
        .find("td")
        .eq(0)
        .attr("data-date");
      const objectCount = $("#syllabus > tbody > tr")
        .eq(i)
        .find("td.details > table > tbody > tr").length;
      for (k = 0; k < objectCount; k++) {
        const assignmentInfo = {
          date: date,
          name: $("#syllabus > tbody > tr")
            .eq(i)
            .find("td.details > table > tbody > tr")
            .eq(k)
            .find("td > a")
            .text(),
          url: $("#syllabus > tbody > tr")
            .eq(i)
            .find("td.details > table > tbody > tr")
            .eq(k)
            .find("td > a")
            .attr("href")
        };
        result.push(assignmentInfo);
      }
    }
    return result;
  }
  browser.close();
})();
