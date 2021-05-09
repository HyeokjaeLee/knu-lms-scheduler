import React from "react";
import shortcut from "../img/Shortcut.png";
import done from "../img/done.png";
import late from "../img/late.png";
import todo from "../img/todo.png";
import { ListGroup, ListGroupItem, UncontrolledCollapse } from "reactstrap";
function Subject(props) {
  const today = new Date(),
    subjectList = props.subjectList,
    view = subjectList.map((_subjectList, index) => {
      let done_count = 0;
      const todo_count = _subjectList.data.length,
        deadLineArr = [],
        id = "subject" + index,
        subject_item = _subjectList.data.map((_item) => {
          if (_item.done == true) {
            done_count++;
          } else if (
            typeof _item.deadLine === "object" &&
            _item.fail == false
          ) {
            deadLineArr.push(_item.deadLine.getTime());
          }
          const state = _item.fail ? late : _item.done ? done : todo,
            state_ico = (
              <img src={state} style={{ width: "20px", marginRight: "15px" }} />
            ),
            deadLine =
              typeof _item.deadLine === "object"
                ? _item.deadLine.getFullYear() +
                  "년" +
                  (_item.deadLine.getMonth() + 1) +
                  "월" +
                  _item.deadLine.getDate() +
                  "일" +
                  _item.deadLine.getHours() +
                  ":" +
                  _item.deadLine.getMinutes() +
                  "까지"
                : "",
            textColor =
              state == todo ? "#50AFEF" : state == late ? "#FF7B60" : "#C3C2C3",
            textDecoration = state == todo ? "none" : "line-through";
          return (
            <ListGroupItem
              tag="span"
              action
              style={{
                background: "#F3F5F6",
                color: textColor,
                textDecoration: textDecoration,
              }}
            >
              {state_ico}
              {_item.name}
              <span style={{ float: "right" }}>{deadLine}</span>
            </ListGroupItem>
          );
        }),
        near_deadLine =
          deadLineArr.length == 0
            ? "완료"
            : Math.round(
                ((Math.min.apply(null, deadLineArr) - today.getTime()) /
                  (1000 * 60 * 60 * 24)) *
                  10
              ) / 10,
        comment = near_deadLine == "완료" ? "" : "일",
        deadLineColor =
          near_deadLine == "완료"
            ? "#1FE560"
            : near_deadLine <= 7
            ? "#FF7B60"
            : "#C0C2C3";
      return (
        <>
          <ListGroupItem
            tag="a"
            action
            style={{ textAlign: "left", borderRadius: "5px" }}
          >
            <a
              href="#"
              id={id}
              style={{ textDecoration: "none", color: "black" }}
            >
              {_subjectList.title}
            </a>
            <a
              href={_subjectList.url}
              target="_blank"
              style={{ float: "right" }}
            >
              <img
                src={shortcut}
                style={{ width: "20px" }}
                href={_subjectList.url}
              />
            </a>
            <span
              style={{
                float: "right",
                background: deadLineColor,
                width: "100px",
                textAlign: "center",
                marginRight: "15px",
                borderRadius: "10px",
                color: "white",
              }}
            >
              {near_deadLine + comment}
            </span>
            <img
              src={todo}
              style={{ width: "20px", marginRight: "10px", float: "right" }}
            />
            <span
              style={{
                float: "right",
                marginRight: "5px",
                textAlign: "center",
                width: "100px",
              }}
            >
              {done_count + " / " + todo_count}
            </span>
            <UncontrolledCollapse toggler={"#" + id}>
              <ListGroup style={{ padding: "20px" }}>{subject_item}</ListGroup>
            </UncontrolledCollapse>
          </ListGroupItem>
        </>
      );
    });
  return <ListGroup style={{ width: "90%" }}>{view}</ListGroup>;
}

export default Subject;
