import React from "react";
import SearchBox from "../searchBox/searchBox.js";
import { Card, CardTitle, CardBody } from "reactstrap";
import axios from "axios";
import "./main.css";

class Main extends React.Component {
  state = {
    url: "",
    urlArray: [],
  };

  handleInputChange = (event) => {
    const url = event.target.value;

    //console.log("url " + url);
    this.setState({ urlArray: url.trim().match(/[^\r\n]+/g) });
    //console.log("urlArray: " + this.state.urlArray);
  };

  handleGrab = (event) => {
    event.preventDefault();
    ///generate random sessID
    let ranGen = () => {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    };

    var sessID = ranGen();
    console.log(sessID);
    ///generate random sessID
    console.log("urlArray after grab: " + this.state.urlArray);

    var arrLength = this.state.urlArray.length;
    console.log("array length: " + arrLength);
    var urlArray = this.state.urlArray;
    if (arrLength < 1) {
      alert("Please enter an URL");
    }
    console.log("Clicked. SessID is :" + sessID);
    console.log(this.state);
    // console.log("type: " + typeof this.state.urlArray);

    function doNext(count = 0) {
      console.log("urlArray is: " + urlArray);
      //console.log("The count: " +count)
      if (count < 1) {
        //$.post("/api/savescreenshot", { arrLength: arrLength,sessID:sessID,urlArray:this.state.urlArray })
        axios
          .request({
            method: "POST",
            url: "http://localhost:3001/api/savescreenshot",
            header: { "Content-Type": "x-www-form-urlencoded" },
            data: {
              arrLength: arrLength,
              sessID: sessID,
              urlArray: urlArray,
            },
          })
          .then((res) => {
            console.log("res: " + res.readyDL);
            if (res.readyDL === true) {
              // $("#load-btn").hide()
              // $("#save-btn").show()
              // $("#download").show()
              alert("your file is ready for download!");
            } else {
              console.log("something wrong");
              //doNext();
            }
          });
        //   .fail(function (xhr, status, error) {
        //     console.log("xhr" + JSON.stringify(xhr));
        //     console.log("status" + status);
        //     console.log("error" + error);
        //     // error handling
        //     //   $("#load-btn").hide()
        //     //   $("#save-btn").show()
        //     alert(
        //       "Please check the URL(s) you've entered and make sure the requirements are met. \n\n Requirements: \n\n  1. Make sure URL is formatted correct (ex. https://www.google.com/ )\n 2. Only 1 URL per line in textbox"
        //     );
        //   });
        count++;
      }
    }

    if (arrLength > 0) {
      doNext();
    }
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
