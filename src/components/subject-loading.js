import React, { useState } from "react";
import { Spinner } from "reactstrap";
function SubjectLoading() {
  const [spinner, setSpinner] = useState("hide");
  window.api.receive("update-start", () => {
    setSpinner("show");
  });
  window.api.receive("update-finish", () => {
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
