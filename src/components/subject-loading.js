import React, { useState } from "react";
import { Progress } from "reactstrap";
import logo from "../assets/img/logo.png";
import example from "../assets/img/ex.png";
import "../assets/style/css/target.min.css";
function SubjectLoading() {
  const [progress, setProgress] = useState("hide");
  const [loading, setLoading] = useState(0);
  let subjectCount = 0;
  window.api.receive("subjectCount", (_subjectCount) => {
    console.log("test33");
    subjectCount = _subjectCount;
    setProgress("show");
  });
  window.api.receive("subjectLoaded", (subjectLoaded) => {
    console.log((subjectLoaded / subjectCount) * 100);
    setLoading((subjectLoaded / subjectCount) * 100);
  });
  window.api.receive("subjectLoadedComplete", () => {
    setProgress("hide");
  });
  return (
    <div className={`loading-wrap ${progress}`}>
      <Progress animated value={loading} className={`subject-loading ${progress}`} color="dark" />
      <p>과목 정보를 불러오는 중입니다.</p>
    </div>
  );
}
export default SubjectLoading;
