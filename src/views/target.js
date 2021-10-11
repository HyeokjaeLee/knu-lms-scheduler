import React from "react";
import { ReactComponent as Logo } from "../assets/img/logo.svg";
import example from "../assets/img/example.gif";
import Footer from "../components/footer";
function TargetView() {
  const set_subjects = () => {
    window.api.send("set-target-subject");
  };

  return (
    <section className="target-section">
      <main>
        <Logo className="logo" />
        <p>
          해당 사용자의 설정값이 존재하지 않습니다.
          <br />
          스케줄러 목록에 추가를 원하는 과목을 체크해주세요.
        </p>
        <img src={example} className="example" alt="example" />
        <button className="add-button" onClick={set_subjects}>
          추가하기
        </button>
      </main>
      <Footer />
    </section>
  );
}
export default TargetView;
