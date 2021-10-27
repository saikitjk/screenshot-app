import React from "react";
import { Alert, Button } from "reactstrap";
import "./notification.css";

export default function notification(props) {
  return (
    <div>
      <div>
        {props.displayInfoMsg ? (
          <Alert color="info">
            {props.message} <Button close onClick={props.closeDownloadMsg} />
          </Alert>
        ) : null}
      </div>
      <div>
        {props.displayErrorMsg ? (
          <Alert color="danger">
            {props.message}
            <Button close onClick={props.closeErrorMsg} />
          </Alert>
        ) : null}
      </div>
    </div>
  );
}
