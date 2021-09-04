import React from "react";
import { Jumbotron } from "reactstrap";
import "./header.css";

export default function header() {
  return (
    <div>
      <Jumbotron>
        <h1>Screenshot App</h1>
        <h3>Capture screenshot of any URL</h3>
        <hr></hr>
      </Jumbotron>
    </div>
  );
}
