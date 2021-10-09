import React from "react";
import Loading from "../components/loading";
import { ReactComponent as Logo } from "../assets/img/logo.svg";
import { ReactComponent as Done } from "../assets/img/done.svg";
import { ReactComponent as ShortCut } from "../assets/img/shortcut.svg";
function Contents(props) {
  const today = new Date().getTime();
  const [subjectList, setSubjectList] = React.useState(<></>);

  function update_subject() {
    window.api.send("update-subject");
  }

  window.api.receive("set-subject-data", (subjectData) => {
    console.log("subject update");
    const subjectElementArr = subjectData.map((subject) => {
      const todoList = subject.data.filter((_data) => !_data.done && !_data.fail);
      const todoCount = todoList.length;
      let deadline = "";
      let lecture = "";
      let task = <Done className="all-done" />;
      let highLight = "";
      if (todoCount > 0) {
        const deadlineList = todoList.map((_data) => _data.deadline);
        const nearDeadline = Math.min(...deadlineList);
        const taskCount = todoList.filter((_data) => _data.type === "과제").length;
        const leftDeadline = Math.floor((nearDeadline - today) / 100 / 60 / 60 / 24) / 10;
        task = `미제출 ${taskCount}개`;
        lecture = `미수강 ${todoCount - taskCount}개`;
        deadline = `마감 ${leftDeadline}일`;
        highLight = leftDeadline < 5 ? "red" : "";
      }

      function link2LMS() {
        window.api.send("open-lms-page", subject.url);
      }

      return (
        <li className="subject-wrap">
          <div className="subject-header">
            <a onClick={link2LMS} className={`shortcut ${highLight}`}>
              <ShortCut class="shortcut-icon" />
            </a>
            <h2 className="subject-title">{subject.title}</h2>
          </div>
          <div className="subject-item-wrap">
            <span className="lecture">{lecture}</span>
            <span className="task">{task}</span>
            <span className="deadline">{deadline}</span>
          </div>
        </li>
      );
    });
    setSubjectList(subjectElementArr);
  });

  return (
    <section className="contents-section">
      <nav>
        <div className="logo-wrap">
          <Logo class="nav-logo" />
          <h1>SCHEDULER</h1>
        </div>
        <div className="nav-txt">Detail</div>
        <button className="edit-button">과목 편집</button>
        <button className="refresh-button" onClick={update_subject}>
          새로고침
        </button>
      </nav>
      <main>
        <ul className="subject-list">{subjectList}</ul>
        <article className="contents">
          <Done />
        </article>
      </main>
      <Loading />
    </section>
  );
}

export default Contents;
