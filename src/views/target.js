import React, { useState } from "react";
import { Progress } from "reactstrap";
import logo from "../assets/img/logo.png";
import example from "../assets/img/ex.png";
import SubjectLoading from "../components/subject-loading";
import "../assets/style/css/target.min.css";
function TargetView() {
  const set_subjects = () => {
    window.api.send("setSubjects");
  };
  const [view, setView] = useState(
    <>
      <p>
        해당 사용자의 설정값이 존재하지 않습니다.
        <br />
        스케줄러 목록에 추가를 원하는 과목을 체크해주세요.
      </p>
      <img src={example} className="example" />
      <button className="add-button" onClick={set_subjects}>
        추가하기
      </button>
    </>
  );

  window.api.receive("subjectCount", () => {
    setView(<></>);
  });
  return (
    <section className="target-section">
      <h1 className="title">
        <img src={logo} className="logo" />
      </h1>
      {view}
      <SubjectLoading />
    </section>
  );
}
export default TargetView;
