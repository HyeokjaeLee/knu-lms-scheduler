const puppeteer = require("puppeteer");
const cheerio = require("cheerio");

const hisnet_id = "201601858";
const hisnet_pw = "dlgurwo12!@";
const knuLMS = "https://knulms.kongju.ac.kr";

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
  });

  const page = await browser.newPage();
  await page.goto(knuLMS+"/courses");

  await page.evaluate(
    (id, pw) => {
      document.querySelector('input[name="login_user_id"]').value = id;
      document.querySelector('input[name="login_user_password"]').value = pw;
    },
    hisnet_id,
    hisnet_pw
  );

  await page.click('div[class="login_btn"]');

  await page.waitForTimeout(3000);
  const subjectInfo = [];
  let content = await page.content();
  const $ = cheerio.load(content);
  const trCount = $("body").find("tbody").find("tr").length;
  const infoDir = (eq1,eq2) => $("body").find("tbody").find("tr").eq(eq1).find("td").eq(eq2)
  for(i=1;i<trCount;i++){
      subjectInfo.push(
          {
              title:infoDir(i,1).find("a").attr("title"),
              url:knuLMS+infoDir(i,1).find("a").attr("href"),
              index:infoDir(i,3).text().replace(/^\s+|\s+$/gm,'')
          }
      )
    
  }
  console.log(subjectInfo);
  browser.close();
})();
