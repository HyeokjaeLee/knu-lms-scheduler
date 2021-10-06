import React, { Component, useState } from "react";

import img from "./assets/img/logo.png";
import Subject from "./views/subject";
import Loading from "./views/loading";

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
    <div className="body">
      <img src={img} style={{ width: "25vh", marginBottom: "2vh" }} />
      <h3 style={{ color: "black", fontWeight: "900" }}>LMS Scheduler</h3>
      {view}
      <footer style={{ height: "5vh", marginTop: "30px", color: "#C0C2C3" }}>
        HyeokjaeLee © All rights reserved.
      </footer>
    </div>
  );
}

export default App;
