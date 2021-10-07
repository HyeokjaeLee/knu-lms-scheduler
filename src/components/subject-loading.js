import React, { useState } from "react";
import { Spinner } from "reactstrap";
import logo from "../assets/img/logo.png";
import example from "../assets/img/ex.png";
import "../assets/style/css/target.min.css";
function SubjectLoading() {
  const [spinner, setSpinner] = useState("hide");
  window.api.receive("getSubjectList", () => {
    setSpinner("show");
  });
  window.api.receive("subjectLoadedComplete", () => {
    setSpinner("hide");
  });
  return (
    <div className={`loading-wrap ${spinner}`}>
      <Spinner type="grow" color="dark" className="spinner " />
      <p>과목 정보를 불러오는 중입니다.</p>
    </div>
  );
}
export default SubjectLoading;
