import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import Login from "./views/login";
import Target from "./views/target";
import Contents from "./views/contents";
import "./assets/scss/index.scss";

function App() {
  const [view, setView] = useState(<Login />);
  useEffect(() => {
    window.api.receive("new-user", () => {
      setView(<Target />);
    });
    window.api.receive("login-success", () => {
      setView(<Contents />);
    });
  }, []);
  return <div className="view-wrap">{view}</div>;
}

ReactDOM.render(<App />, document.getElementById("root"));
