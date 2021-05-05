import React from "react";
import shortcut from "../img/Shortcut.png";
import done from "../img/done.png";
import late from "../img/late.png";
import todo from "../img/todo.png";
import { ListGroup, ListGroupItem, UncontrolledCollapse } from "reactstrap";
function Subject(props) {
  const subjectList = props.subjectList;
  console.log(subjectList);
  const view = subjectList.map((_subjectList, index) => {
    const id = "subject" + index;
    const subject_item = _subjectList.data.map((_item) => {
      const state = _item.fail ? late : _item.done ? done : todo,
        state_ico = (
          <img src={state} style={{ width: "20px", marginRight: "15px" }} />
        ),
        deadLine =
          _item.deadLine == undefined
            ? ""
            : _item.deadLine.getFullYear() +
              "년" +
              (_item.deadLine.getMonth() + 1) +
              "월" +
              _item.deadLine.getDate() +
              "일" +
              _item.deadLine.getHours() +
              ":" +
              _item.deadLine.getMinutes() +
              "까지",
        textColor =
          state == todo ? "#50AFEF" : state == late ? "#FF7B60" : "#C3C2C3",
        textDecoration = state == todo ? "none" : "line-through";

      return (
        <ListGroupItem
          tag="span"
          action
          style={{
            background: "#F3F5F6",
            color: { textColor },
            textDecoration: { textDecoration },
          }}
        >
          {state_ico}
          {_item.name}
          <span style={{ float: "right" }}>{deadLine}</span>
        </ListGroupItem>
      );
    });
    return (
      <>
        <ListGroupItem tag="a" action style={{ textAlign: "left" }}>
          <a
            href="#"
            id={id}
            style={{ textDecoration: "none", color: "black" }}
          >
            {_subjectList.title}
          </a>
          <a href={_subjectList.url} target="_blank" style={{ float: "right" }}>
            <img
              src={shortcut}
              style={{ width: "20px" }}
              href={_subjectList.url}
            />
          </a>
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
