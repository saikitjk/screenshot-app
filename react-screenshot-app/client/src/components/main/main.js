import React from "react";
import SearchBox from "../searchBox/searchBox.js";
import Notifcation from "../notification/notification.js";
import { Card, CardTitle, CardBody } from "reactstrap";
import axios from "axios";
import isURL from "validator/lib/isURL";
import "./main.css";

class Main extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      url: "",
      urlArray: [],
      submitBtnShow: true,
      loadingBtnShow: false,
      downloadBtnShow: true, //change it back to false later
      displayInfoMsg: false,
      displayErrorMsg: false,
      msg: "",
    };
  }

  //////////////////////////////////////
  /////////////Button Control///////////
  enableBtn = (btnProperty) => {
    this.setState({ [btnProperty]: true }); //dynamic key
    console.log(`${JSON.stringify(btnProperty)}. Btn is enabled!`);
  };

  disableBtn = (btnProperty) => {
    this.setState({ [btnProperty]: false }); //dymanic key
    console.log(`${JSON.stringify(btnProperty)}. Btn is disabled!`);
  };

  /////////////Button Control///////////
  //////////////////////////////////////

  //////////////////////////////////////
  ////////////////Display Msg///////////
  displayDownloadMsg = (msg) => {
    console.log("displayDownloadMsg method called");
    this.setState({ displayInfoMsg: true });
    this.setState({ msg: msg });
  };

  displayErrorMsg = (msg) => {
    console.log("displayErrorMsg method called");
    this.setState({ displayErrorMsg: true });
    this.setState({ msg: msg });
  };

  closeDownloadMsg = () => {
    console.log("Info box closed");
    this.setState({ displayInfoMsg: false });
  };

  closeErrorMsg = () => {
    console.log("Alert box closed");
    this.setState({ displayErrorMsg: false });
  };
  ////////////////Display Msg///////////
  //////////////////////////////////////

  handleInputChange = (event) => {
    const url = event.target.value;
    this.setState({ urlArray: url.trim().match(/[^\r\n]+/g) });
    //console.log("urlArray: " + this.state.urlArray);
  };

  handleGrab = (event) => {
    event.preventDefault();
    const that = this; // this is to keep the scopt of this.state

    //////////////////////////generate random sessID//////////////////////////
    let ranGen = () => {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    };

    var sessID = ranGen();
    console.log(sessID);
    ///////////////////////////generate random sessID////////////////////////

    console.log("what is urlArray: " + this.state.urlArray);

    var arrLength = this.state.urlArray.length;
    console.log("array length: " + arrLength);
    var urlArray = this.state.urlArray;
    console.log("Clicked. SessID is :" + sessID);

    function doNext(count = 0) {
      console.log("urlArray is: " + urlArray);
      //console.log("The count: " +count)
      if (count < 1) {
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
            console.log("what is in response: " + JSON.stringify(res));
            //console.log("res: " + res.data);
            const { readyDl } = res.data; //object destructuring
            const { msg } = res.data; //object destructuring
            const { err } = res.data; //object destructuring
            const { fileSize } = res.data;
            //console.log("Value of readyDl: "+readyDl);
            if (readyDl === true) {
              that.disableBtn("loadingBtnShow");
              that.enableBtn("submitBtnShow");
              that.enableBtn("downloadBtnShow");
              //console.log(msg);
              that.displayDownloadMsg(
                `${msg}  Captured:(${fileSize}/${arrLength})`
              );
            }
            if (readyDl === false) {
              console.log("something wrong: " + err);
              that.disableBtn("loadingBtnShow");
              that.enableBtn("submitBtnShow");
              that.displayErrorMsg(msg);
              //doNext();
            }
          });
        //.fail(function (xhr, status, error) {
        //     console.log("xhr" + JSON.stringify(xhr));
        //     console.log("status" + status);
        //     console.log("error" + error);
        //     // error handling
        //     //   $("#load-btn").hide()
        //     //   $("#save-btn").show()
        //     alert(
        //       "Please check the URL(s) you've entered and make sure the requirements are met. \n\n Requirements: \n\n  1. Make sure URL is formatted correct (ex. https://www.google.com/ )\n 2. Only 1 URL per line in textbox"
        //     );
        // });
        count++;
      }
    }
    if (arrLength < 1) {
      that.displayErrorMsg("Please enter at least 1 URL");
    }
    if (arrLength > 0) {
      //Input Validation
      for (let i = 0; i < urlArray.length; i++) {
        if (
          isURL(urlArray[i], {
            protocols: ["http", "https"],
            require_protocol: true,
            require_tld: true,
          })
        ) {
          i++;
        } else {
          console.log(urlArray[i] + " is not an valid URL");
          that.displayErrorMsg(
            urlArray[i] +
              " does not meet the URL requirements. Please see instructions below"
          );
          return;
        }
      }
      that.closeErrorMsg();
      that.closeDownloadMsg();
      that.enableBtn("loadingBtnShow");
      that.disableBtn("submitBtnShow");
      doNext();
    }
  };

  handleDl = () => {
    function downloadFile(result) {
      // $.get('/api/download', { result: result })
      // .then(res=>{
      //   console.log("DONE")
      // })
      console.log("the result is " + result);
      fetch("/api/download", {
        method: "post",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          data: result,
          //sessID:sessID
        }),
      })
        .then((resp) => resp.blob())
        .then((blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.style.display = "none";
          a.href = url;
          // the filename you want
          a.download = "screenshots.zip";
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          alert("your file is ready for download!"); // or you know, something with better UX...
        })
        .catch(() =>
          alert("oh no! something went wrong. Please contact the page admin")
        );
    }

    downloadFile();
  };

  render() {
    console.log(this.state);
    return (
      <div>
        <Card>
          <CardTitle tag="h3">Enter URL below</CardTitle>
          <CardBody>
            <Notifcation
              displayInfoMsg={this.state.displayInfoMsg}
              displayErrorMsg={this.state.displayErrorMsg}
              message={this.state.msg}
              closeDownloadMsg={this.closeDownloadMsg}
              closeErrorMsg={this.closeErrorMsg}
            />
            <SearchBox
              //    inputURL={this.state.url}
              handleInputChange={this.handleInputChange.bind(this)}
              //val={this.handleInputChange}
              handleGrab={this.handleGrab.bind(this)}
              submitBtnShow={this.state.submitBtnShow}
              loadingBtnShow={this.state.loadingBtnShow}
              downloadBtnShow={this.state.downloadBtnShow}
              handleDl={this.handleDl.bind(this)}
            />
          </CardBody>
        </Card>
      </div>
    );
  }
}

export { Main as default };
