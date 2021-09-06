import React from "react";
import SearchBox from "../searchBox/searchBox.js";
import { Card, CardTitle, CardBody } from "reactstrap";
import "./main.css";

export default function main() {
  return (
    <div>
      <Card>
        <CardTitle tag="h3">Enter URL below</CardTitle>
        <CardBody>
          <SearchBox />
        </CardBody>
      </Card>
    </div>
  );
}
