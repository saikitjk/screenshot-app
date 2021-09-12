import React from "react";
import SearchBox from "../searchBox/searchBox.js";
import { Card, CardTitle, CardBody } from "reactstrap";
import "./main.css";

class Main extends React.Component {
  state = {
    url: "",
    urlArray: [],
  };

  handleInputChange = (event) => {
    const url = event.target.value;

    console.log("url " + url);
    this.setState({ urlArray: url.trim().match(/[^\r\n]+/g) });
  };

  handleGrab = (event) => {
    event.preventDefault();
    if (this.state.urlArray.length < 1) {
      alert("Please enter an URL");
    }
    console.log("click");
    console.log(this.state);
    console.log("type: " + typeof this.state.urlArray);
  };

  render() {
    return (
      <div>
        <Card>
          <CardTitle tag="h3">Enter URL below</CardTitle>
          <CardBody>
            <SearchBox
              inputURL={this.state.url}
              handleInputChange={this.handleInputChange}
              handleGrab={this.handleGrab}
            />
          </CardBody>
        </Card>
      </div>
    );
  }
}

export { Main as default };
