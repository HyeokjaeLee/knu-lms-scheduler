import React, { useState } from "react";
import { ReactComponent as Logo } from "../assets/img/logo.svg";
import Footer from "../components/footer";

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
    window.api.send("login", { id: id, password: password, keep: keepLoginInfo });
  };

  /*로그인 실패를 사용자에게 알려줌*/
  const [loginFailAlert, setLoginFailAlert] = useState("default");
  window.api.receive("login-fail", () => {
    setLoginFailAlert("show");
    setTimeout(() => {
      setLoginFailAlert("hide");
    }, 1500);
  });

  window.api.receive("saved-login-info", (loginInfo) => {
    setId(loginInfo.id);
    setPassword(loginInfo.password);
  });

  window.api.send("app-ready");
  return (
    <section className="login-section">
      <main>
        <Logo className="logo" />
        <article className="login">
          <section className="input-wrap">
            <label>학번</label>
            <input placeholder="201600000" value={id} onChange={on_change_id}></input>
          </section>
          <section className="input-wrap">
            <label>비밀번호</label>
            <input
              placeholder="password"
              type="password"
              value={password}
              onChange={on_change_password}
            ></input>
          </section>

          <section className="keep-login-wrap">
            <label>로그인정보 저장</label>
            <input type="checkbox" onChange={on_change_keepLoginInfo} checked={keepLoginInfo} />
          </section>

          <button className="login-button" onClick={send_login_info}>
            로그인
          </button>
        </article>
        <div className={`login-fail ${loginFailAlert}`}>
          로그인에 실패했습니다.
          <br />
          학번과 비밀번호를 확인해 주세요.
        </div>
      </main>
      <Footer />
    </section>
  );
}
export default LoginView;
