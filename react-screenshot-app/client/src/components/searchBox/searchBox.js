import React from "react";
import { FormGroup, Input, Button } from "reactstrap";
import "./searchBox.css";

export default function searchBox() {
  return (
    <div>
      <FormGroup>
        <Input
          type="textarea"
          name="text"
          id="exampleText"
          placeholder="ex. https://www.google.com/"
        />
      </FormGroup>

      <div class="text-right">
        <button type="submit" class="btn btn-primary btn-md" id="reset">
          <span class="fa fa-refresh"></span>
          Reset
        </button>

        <button type="submit" class="btn btn-primary btn-md" id="save-btn">
          <span class="fa fa-camera"></span> Grab screenshots
        </button>
        <button class="btn btn-primary" type="button" id="load-btn" disabled>
          <span
            class="spinner-border spinner-border-sm"
            role="status"
            aria-hidden="true"
          ></span>
          Processing. Please wait...
        </button>

        <a class="download" href="/api/download" target="_blank">
          <button type="submit" class="btn btn-primary btn-md" id="download">
            <span class="fa fa-camera"></span>Download File
          </button>
        </a>
      </div>
    </div>
  );
}
