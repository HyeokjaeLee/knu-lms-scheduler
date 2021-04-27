const express = require("express"); //express를 설치했기 때문에 가져올 수 있다.
const app = express();
const { LMS_crawler } = require("./components/lms-crawler");

console.log("ss");

const id1 = "201601858";
const pw1 = "dlgurwo12!@";
const semester1 = "2021년1학기";

(async () => {
  const test = await LMS_crawler(id1, pw1, semester1);
  app.get("/", (req, res) => {
    res.json(test);
  });
})();

app.listen(5000);
