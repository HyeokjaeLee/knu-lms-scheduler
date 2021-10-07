import React, { useState } from "react";
import { Progress } from "reactstrap";
import logo from "../assets/img/logo.png";
import "../assets/style/css/login.min.css";
function LoginView() {
  /*id 상태 관리*/
  const [id, setId] = useState("");
  const on_change_id = (e) => {
    setId(e.target.value);
  };
  /*비밀번호 상태 관리*/
  const [password, setPassword] = useState("");
  const on_change_password = (e) => {
    setPassword(e.target.value);
  };

  /*로그인 정보 저장할지 여부*/
  const [keepLoginInfo, setKeepLoginInfo] = useState(true);
  const on_change_keepLoginInfo = (e) => {
    setKeepLoginInfo(e.target.checked);
  };
  /*입력 받은 id,비밀번호를 electron으로 전달*/
  const send_login_info = () => {
    window.api.send("loginInfo", { id: id, password: password, keep: keepLoginInfo });
  };

  /*로그인 실패를 사용자에게 알려줌*/
  const [loginFailAlert, setLoginFailAlert] = useState("hide");
  window.api.receive("loginFail", () => {
    setLoginFailAlert("show");
    setTimeout(() => {
      setLoginFailAlert("hide");
    }, 1000);
  });

  window.api.receive("loginInfo", (loginInfo) => {
    console.log(loginInfo);
    setId(loginInfo.id);
    setPassword(loginInfo.password);
  });

  window.api.send("appReady");
  return (
    <section className="login-section">
      <h1 className="title">
        <img src={logo} className="logo" />
        LMS Scheduler
      </h1>

      <label className="input-wrap">
        <p>학번</p>
        <input
          className="login-input"
          placeholder="201600000"
          value={id}
          onChange={on_change_id}
        ></input>
      </label>
      <label className="input-wrap">
        <p>비밀번호</p>
        <input
          placeholder="password"
          type="password"
          value={password}
          onChange={on_change_password}
        ></input>
      </label>

      <lable className="keep-login-info-wrap">
        <p>로그인정보 저장</p>
        <input type="checkbox" onChange={on_change_keepLoginInfo} checked={keepLoginInfo} />
      </lable>

      <button className="login-button" onClick={send_login_info}>
        Login
      </button>
      <div className={`login-fail ${loginFailAlert}`}>
        로그인에 실패했습니다.
        <br />
        학번과 비밀번호를 확인해 주세요.
      </div>
    </section>
  );
}
export default LoginView;
