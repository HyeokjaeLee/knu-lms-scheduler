import React, { Component, useState } from "react";
import "./App.css";
import img from "./img/KNU.png";
import Subject from "./components/subject";
import Loading from "./components/loading";

function App() {
  const [view, setView] = useState(
    <button
      className="login"
      onClick={() => window.api.send("toMain")}
      style={{ marginTop: "5vh" }}
    >
      Sign in
    </button>
  );
  window.api.receive("fromLogin", (subjectCount) => {
    setView(<Loading subjectCount={subjectCount} />);
  });
  window.api.receive("fromLMS", (data) => {
    const Contents = <Subject subjectList={data} />;
    setInterval(() => {
      setView(Contents);
    }, 300);
  });

  return (
    <div className="App">
      <img src={img} style={{ width: "25vh", marginBottom: "2vh" }} />
      <h1 style={{ color: "#1ABF50", fontWeight: "900", fontFamily: "title" }}>
        LMS 스케줄러
      </h1>
      {view}
      <footer style={{ height: "5vh", marginTop: "30px", color: "#C0C2C3" }}>
        HyeokjaeLee © All rights reserved.
      </footer>
    </div>
  );
}

export default App;
