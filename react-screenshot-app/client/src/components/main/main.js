import React from "react";
import ControlPanel from "../controlPanel/controlPanel.js";
import { Card, CardTitle, CardBody, FormGroup, Input } from "reactstrap";
import "./main.css";

export default function main() {
  return (
    <div>
      <Card>
        <CardTitle tag="h3">Enter URL below</CardTitle>
        <CardBody>
          <FormGroup>
            <Input
              type="textarea"
              name="text"
              id="exampleText"
              placeholder="ex. https://www.google.com/"
            />
          </FormGroup>
        </CardBody>
      </Card>
    </div>
  );
}
