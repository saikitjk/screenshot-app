import React from "react";
import { FormGroup, Input, Button } from "reactstrap";
import { FaSyncAlt, FaCameraRetro, FaDownload } from "react-icons/fa";
import "./searchBox.css";

const SearchBox = (props) => {
  function refreshPage() {
    window.location.reload(true);
    console.log("Page reloaded");
  }

  return (
    <div>
      <FormGroup>
        <Input
          onChange={props.handleInputChange}
          value={props.inputValue}
          type="textarea"
          name="text"
          id="exampleText"
          placeholder="ex. https://www.google.com/"
        />
      </FormGroup>

      <div className="text-right">
        <Button
          // onClick={props.handleReset}
          onClick={refreshPage}
          color="primary"
          className="resetBtn"
          type="submit"
          id="reset"
        >
          <FaSyncAlt />
          Reset
        </Button>

        {props.submitBtnShow ? (
          <Button
            onClick={props.handleGrab}
            color="primary"
            className="saveBtn"
            type="submit"
            id="save-btn"
          >
            <FaCameraRetro />
            Grab screenshots
          </Button>
        ) : null}

        {props.loadingBtnShow ? (
          <Button
            color="primary"
            className="loadBtn"
            type="button"
            id="load-btn"
            disabled
          >
            Processing. Please wait...
          </Button>
        ) : null}

        {props.downloadBtnShow ? (
          <Button
            onClick={props.handleDl}
            color="primary"
            className="dlBtn"
            type="submit"
            id="download"
          >
            <FaDownload />
            Download File
          </Button>
        ) : null}
      </div>
    </div>
  );
};

export default SearchBox;
