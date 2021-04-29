import React, { Component, useState } from "react";
import "./App.css";
import img from "./KNU.png";

function App() {
  const [password, setPassword] = useState(""),
    [ID, setID] = useState("");
  const [lms_data, set_lms_Data] = useState(undefined);
  window.api.receive("fromMain", (data) => {
    Login = [<></>];
    set_lms_Data(data);
    setView(
      data.map((_data) => {
        const lms = _data;
        return lms.title;
      })
    );
  });
  const info = [ID, password, "2021년1학기"];
  let Login = [
    <>
      <img src={img} style={{ width: "25vh" }} />
      <h1 style={{ color: "#1ABF50", fontWeight: "900", fontFamily: "title" }}>
        LMS 스케줄러
      </h1>
      <div className="input_container">
        <input
          placeholder="Username"
          type="text"
          className="input"
          onChange={(e) => {
            setID(e.target.value);
          }}
        />
      </div>
      <div className="input_container">
        <input
          placeholder="Password"
          type="password"
          className="input"
          onChange={(e) => {
            setPassword(e.target.value);
          }}
        />
      </div>
      <button className="login" onClick={() => window.api.send("toMain", info)}>
        Sign in
      </button>
    </>,
  ];
  const [view, setView] = useState(Login);
  return <div className="App">{Login}</div>;
}

export default App;
