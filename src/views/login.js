import React, { useState } from "react";
import { Progress } from "reactstrap";
import logo from "../assets/img/logo.png";
import "../assets/style/css/login.min.css";
function LoginView() {
  const [id, setId] = useState("");
  const onChangeId = (e) => {
    setId(e.target.value);
    console.log(id);
  };
  const [password, setPassword] = useState("");
  const onChangePassword = (e) => {
    setPassword(e.target.value);
    console.log(password);
  };
  const send_login_info = () => {
    window.api.send("loginInfo", { id: id, password: password });
    console.log("test2");
  };
  return (
    <section className="login-section">
      <img src={logo} className="logo" />
      <h1 className="title">LMS Scheduler</h1>
      <p>학번</p>
      <input
        className="login-input"
        placeholder="201600000"
        value={id}
        onChange={onChangeId}
      ></input>
      <p>비밀번호</p>
      <input
        className="login-input"
        placeholder="password"
        value={password}
        onChange={onChangePassword}
      ></input>
      <button className="login-button" onClick={send_login_info}>
        Login
      </button>
    </section>
  );
}
export default LoginView;
