import React, { Component, useState } from "react";
import "./App.css";
import img from "./img/KNU.png";
import Login from "./components/login";
import Subject from "./components/subject";
import { Spinner } from "reactstrap";

function App() {
  const [login, setLogin] = useState(<Login />);
  const [view, setView] = useState(<></>);
  window.api.receive("fromLogin", (data) => {
    setLogin(
      <>
        <span>
          LMS 정보를 불러오는 중입니다.
          <br />
          잠시만 기다려주세요.{" ( 예상시간 : 1분 )"}
        </span>
        <Spinner type="grow" color="secondary" style={{ margin: "5vh" }} />
      </>
    );
  });
  window.api.receive("fromLMS", (data) => {
    setLogin(<></>);
    setView(<Subject subjectList={data} />);
  });
  return (
    <div className="App">
      <img src={img} style={{ width: "25vh", marginBottom: "2vh" }} />
      <h1 style={{ color: "#1ABF50", fontWeight: "900", fontFamily: "title" }}>
        LMS 스케줄러
      </h1>
      {login}
      {view}
      <footer style={{ height: "5vh", marginTop: "30px", color: "#C0C2C3" }}>
        HyeokjaeLee © All rights reserved.
      </footer>
    </div>
  );
}

export default App;
