import React, { useEffect } from "react";
import { ReactComponent as Logo } from "../assets/img/logo.svg";
import { ReactComponent as Done } from "../assets/img/done.svg";
import { ReactComponent as Todo } from "../assets/img/todo.svg";
import { ReactComponent as Late } from "../assets/img/late.svg";
import { ReactComponent as ShortCut } from "../assets/img/shortcut.svg";
import Footer from "../components/footer";
let currentSubjectIndex = 0;

function Contents() {
  const today = new Date().getTime();
  const [subjectList, setSubjectList] = React.useState(<></>);
  const [navTxt, setNavTxt] = React.useState("Detail");
  const [detail, setDetail] = React.useState(<></>);
  const [clickPrevent, setClickPrevent] = React.useState("show");
  const update_subject = () => {
    window.api.send("update-subject");
  };

  const set_subjects = () => {
    window.api.send("set-target-subject");
  };

  const link2LMS = (subjectURL, dataURL) => {
    window.api.send("open-lms-page", {
      subject: subjectURL,
      data: dataURL,
    });
  };

  useEffect(() => {
    window.api.receive("update-start", () => {
      setClickPrevent("show");
      setNavTxt(
        <div className="loading-wrap">
          <label>과목 정보를 불러오는 중입니다...</label>
          <div className="loading-object"></div>
        </div>
      );
    });

    window.api.receive("update-finish", () => {
      setClickPrevent("hide");
      setNavTxt("Detail");
    });

    window.api.receive("set-subject-data", (allSubject) => {
      const subjectElementArr = allSubject.map((subject, subjectIndex) => {
        const todoList = subject.data.filter((data) => !data.done && !data.fail);
        const pastList = subject.data.filter((data) => data.done || data.fail);
        const todoCount = todoList.length;
        let highlight = "finished";
        let subjectItem = {
          deadline: "", //마감일
          lecture: "", //강의
          task: "완료", //과제
        };

        if (todoCount > 0) {
          const deadlineList = todoList.map((data) => data.deadline).filter((deadline) => !!deadline);
          const nearDeadline = Math.min(...deadlineList);
          const taskCount = todoList.filter((data) => data.type === "과제").length;
          const leftDeadline = Math.floor((nearDeadline - today) / 100 / 60 / 60 / 24) / 10;
          subjectItem = {
            deadline: `마감 ${leftDeadline}일`,
            lecture: `미수강 ${todoCount - taskCount}개`,
            task: `미제출 ${taskCount}개`,
          };
          if (leftDeadline <= 1) {
            highlight = "urgent";
          } else {
            highlight = "";
          }
        }

        const viewDetail = () => {
          currentSubjectIndex = subjectIndex;
          const create_view_detail = (sbuject) =>
            sbuject.map((data, index) => {
              const result = data.done ? (
                <Done className="done" />
              ) : data.fail ? (
                <Late className="fail" />
              ) : (
                <Todo className="todo" />
              );
              const deadline = !!data.deadline ? new Date(data.deadline) : undefined;
              const deadlineTxt = !!deadline
                ? `${
                    deadline.getMonth() + 1
                  }월 ${deadline.getDate()}일 ${deadline.getHours()}:${deadline.getMinutes()}까지`
                : "";
              const detail_highlight =
                data.done || data.fail
                  ? "finished"
                  : Math.floor((deadline - today) / 100 / 60 / 60 / 24) / 10 <= 1
                  ? "urgent"
                  : "";
              return (
                <article
                  key={`${index}.${data.name}`}
                  className={`subject-detail-item ${detail_highlight}`}
                  onClick={() => {
                    link2LMS(subject.url, data.url);
                  }}
                >
                  <div className="subject-info-wrap">
                    <div className="type">{data.type}</div>
                    <h2 className="name">{data.name}</h2>
                    <div className="deadline">{deadlineTxt}</div>
                  </div>
                  {result}
                </article>
              );
            });

          setDetail([create_view_detail(todoList), create_view_detail(pastList)]);
        };
        subjectIndex === currentSubjectIndex && viewDetail();
        return (
          <li className={`subject-wrap ${highlight}`} onClick={viewDetail} key={subject.title}>
            <div className="subject-header">
              <button
                onClick={() => {
                  link2LMS(subject.url);
                }}
                className="shortcut"
              >
                <ShortCut className="shortcut-icon" />
              </button>
              <h2 className="subject-title">{subject.title}</h2>
              <span className={`warning ${highlight}`}>⚠️마감</span>
            </div>
            <div className="subject-item-wrap">
              <span className="lecture">{subjectItem.lecture}</span>
              <span className="task">{subjectItem.task}</span>
              <span className="deadline">{subjectItem.deadline}</span>
            </div>
          </li>
        );
      });
      setSubjectList(subjectElementArr);
    });
  }, []);

  return (
    <section className="contents-section">
      <div className={`click-prevention ${clickPrevent}`}></div>
      <nav>
        <div className="logo-wrap">
          <Logo className="nav-logo" />
          <h1>SCHEDULER</h1>
        </div>
        <div className="nav-txt">{navTxt}</div>
        <button className="edit-button" onClick={set_subjects}>
          과목 편집
        </button>
        <button className="refresh-button" onClick={update_subject}>
          새로고침
        </button>
      </nav>
      <main>
        <ul className="subject-list">{subjectList}</ul>
        <section className="contents">
          {detail}
          <Footer />
        </section>
      </main>
    </section>
  );
}

export default Contents;
