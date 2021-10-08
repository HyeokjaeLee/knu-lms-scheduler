import React from "react";
import Loading from "../components/loading";

function Contents(props) {
  const [subjectList, setSubjectList] = React.useState(<></>);
  window.api.receive("set-subject-data", (subjectData) => {
    console.log("check");
    const subjectElementArr = subjectData.map((subject) => (
      <li>
        <div>
          <h2>{subject.title}</h2>
          <a href={subject.url}>바로가기</a>
        </div>
      </li>
    ));
    setSubjectList(subjectElementArr);
  });

  return (
    <section className="contents-section">
      <ul className="subject-list">{subjectList}</ul>
      <Loading />
    </section>
  );
}

export default Contents;
