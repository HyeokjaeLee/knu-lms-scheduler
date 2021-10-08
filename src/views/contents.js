import React from "react";
import Loading from "../components/loading";
import { ReactComponent as Logo } from "../assets/img/logo.svg";
import { ReactComponent as ShortCut } from "../assets/img/shortcut.svg";
function Contents(props) {
  const [subjectList, setSubjectList] = React.useState(<></>);
  window.api.receive("set-subject-data", (subjectData) => {
    console.log(subjectData[1].data);
    const subjectElementArr = subjectData.map((subject) => (
      <li className="subject-wrap">
        <div>
          <h2>{subject.title}</h2>
          <div className="subject-item-wrap">
            <span>12/32</span>
            <span>13/22</span>
            <span>13.9일</span>
          </div>
        </div>
        <a href={subject.url}>
          <ShortCut class="shortcut" />
        </a>
      </li>
    ));
    setSubjectList(subjectElementArr);
  });

  return (
    <section className="contents-section">
      <nav>
        <div className="logo-wrap">
          <Logo class="nav-logo" />
          <h1>LMS Scheduler</h1>
        </div>
      </nav>
      <main>
        <ul className="subject-list">{subjectList}</ul>
        <article className="contents">ss</article>
      </main>
      <Loading />
    </section>
  );
}

export default Contents;
