import React, { useState } from "react";
import { Spinner } from "reactstrap";
function SubjectLoading() {
  const [show, setShow] = useState("hide");
  window.api.receive("update-start", () => {
    setShow("show");
  });
  window.api.receive("update-finish", () => {
    setShow("hide");
  });
  return (
    <div className={`loading-wrap ${show}`}>
      <label>과목 정보를 불러오는 중입니다.</label>
      <div class="loading-object"></div>
    </div>
  );
}
export default SubjectLoading;
