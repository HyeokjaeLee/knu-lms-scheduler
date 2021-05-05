import React, { Component, useState } from "react";
import "./App.css";
import img from "./img/KNU.png";
import Login from "./components/login";
import Subject from "./components/subject";
import { Spinner, ListGroup, ListGroupItem } from "reactstrap";

function App() {
  const [login, setLogin] = useState(<Login />);
  const [view, setView] = useState(<></>);
  window.api.receive("fromLogin", (data) => {
    setLogin(<Spinner type="grow" color="primary" />);
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
      <footer style={{ height: "10vh" }}>
        <hr />
      </footer>
    </div>
  );
}

export default App;
