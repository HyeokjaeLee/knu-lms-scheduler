import React, { Component, useState } from "react";
import "./App.css";
import img from "./img/KNU.png";
import Login from "./components/login";
import Subject from "./components/subject";
import { Progress } from "reactstrap";

function App() {
  const [view, setView] = useState(<Login />);
  const [progress, setProgress] = useState(0);
  const [progressState, setProgressState] = useState("hidden");
  let subjectCount;
  window.api.receive("fromLogin", (data) => {
    subjectCount = data;
    setProgressState("visible");
    setView(
      <>
        <span>
          LMS 정보를 불러오는 중입니다.
          <br />
          잠시만 기다려주세요.{" ( 예상시간 : 1분 )"}
        </span>
      </>
    );
  });
  window.api.receive("fromCrawler", (data) => {
    setProgress((data / subjectCount) * 100);
  });
  window.api.receive("fromLMS", (data) => {
    setProgressState("hidden");
    setView(<Subject subjectList={data} />);
  });

  return (
    <div className="App">
      <img src={img} style={{ width: "25vh", marginBottom: "2vh" }} />
      <h1 style={{ color: "#1ABF50", fontWeight: "900", fontFamily: "title" }}>
        LMS 스케줄러
      </h1>
      {view}
      <Progress
        striped
        color="success"
        value={progress}
        style={{
          width: "50%",
          marginTop: "5vh",
          visibility: progressState,
        }}
      />
      <footer style={{ height: "5vh", marginTop: "30px", color: "#C0C2C3" }}>
        HyeokjaeLee © All rights reserved.
      </footer>
    </div>
  );
}

export default App;
