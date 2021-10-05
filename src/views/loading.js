import React, { useState } from "react";
import { Progress } from "reactstrap";
function Loading(props) {
  const subjectCount = props.subjectCount,
    [subjectNum, setSubjectNum] = useState(0);

  window.api.receive("fromCrawler", (subjectNum) => {
    setSubjectNum(subjectNum);
  });

  return (
    <>
      <sapn>
        LMS 정보를 불러오는 중입니다. <br />
        잠시만 기다려주세요.
      </sapn>
      <span>{` ( 예상시간 : ${(subjectCount - subjectNum) * 3}초 )`}</span>
      <Progress
        animated
        striped
        color="success"
        value={(subjectNum / subjectCount) * 100}
        style={{
          width: "50%",
          marginTop: "5vh",
        }}
      />
    </>
  );
}
export default Loading;
