// Dependencies
// =============================================================
const express = require("express");
const path = require("path");
//const puppeteer = require("puppeteer");
const { Cluster } = require("puppeteer-cluster");
const fs = require("fs");
//const CircularJSON = require("circular-json");
// var Promise = require("bluebird");

// Sets up the Express App
// =============================================================
var app = express();
var PORT = 5000;

// Sets up the Express app to handle data parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(__dirname + "/src"));

// Routes
// =============================================================

// Basic route that sends the user first to the AJAX Page
app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.post("/api/savescreenshot", async (req, res) => {
  // const { url } = req.body;
  const { sessID } = req.body;
  //const { count } = req.body;
  const { arrLength } = req.body;
  //const urlArray = req.body;
  var concurrenyValue = parseInt(arrLength); //this is for dynamic concurrency value
  //convert urlArray in req.body into an array
  for (var urlArray in req.body) {
    if (req.body.hasOwnProperty("urlArray")) {
      var urlArrayToUse = req.body[urlArray];
    }
  }

  console.log("The amount of URLs: " + urlArrayToUse.length);

  // ///url for test
  // var urlArray = [
  //   "https://www.google.com/",
  //   "https://www.porsche.com/",
  //   "https://www.bmw.com/",
  // ];

  try {
    (async () => {
      const cluster = await Cluster.launch({
        //concurrency: Cluster.CONCURRENCY_CONTEXT,
        concurrency: Cluster.CONCURRENCY_BROWSER, //to prevent hang,
        //maxConcurrency: concurrenyValue, //this is for dynamic concurrency value
        maxConcurrency: 10,
        workerCreationDelay: 200, //to prevent max cpu at the start
        monitor: true,
        headless: true,
        timeout: 600000,
      });
      // Print errors to console
      cluster.on("taskerror", (err, data) => {
        console.log(`Error crawling ${data}: ${err.message}`);
      });
      await cluster.task(async ({ page, data: url, worker }) => {
        await page.goto(url, { waitUntil: "networkidle0", timeout: 0 });

        await page.screenshot({
          fullPage: true,
          //path: `${sessID}/screenshot${worker}.png`,

          path: `${sessID}` + "/" + url.replace(/[^a-zA-Z]/g, "_") + ".png",
        });
        console.log(`Screenshot of ${url} saved`);
      });
      for (let i = 0; i < urlArrayToUse.length; i++) {
        if (i === 0) {
          fs.mkdir(path.join(__dirname, sessID), (err) => {
            if (err) {
              return console.error("mkdir error: " + err);
            }
            console.log("Directory created successfully!");
          });
        }
        cluster.queue(urlArrayToUse[i]);
      }
      await cluster.idle();
      await cluster.close();

      //****************************************** */
      const dir = "./" + sessID;
      var readyDL = false;
      fs.readdir(dir, (err, files) => {
        console.log("File size: " + files.length);
        if (files.length == urlArrayToUse.length) {
          zipFile(sessID, function (err) {
            if (err) {
              console.log(err); // Check error if you want
            } else {
              return;
            }
          });
          readyDL = true;
          console.log("Is ready to download: " + readyDL);
          return res.status(200).json({ readyDL: readyDL });
        }
      });

      //****************************************** */

      console.log("Completed, check the screenshots");
      //res.sendStatus(200);
      //res.send({ readyDL: readyDL, status: 200 });
      //res.status(200).json(readyDL);
    })();
  } catch (e) {
    // catch errors and send error status
    console.log(e);
    res.sendStatus(500);
  }
});

app.get("/api/download", function (req, res) {
  // var result = req.body.data
  // var sessID = req.body.sessID;
  // console.log("res body " + req);
  // console.log("sessssssid " + sessID);
  // const file = __dirname + `/${sessID}screenshots.zip`;
  // res.download(file, `${sessID}screenshots.zip`, function (err) {
  const file = __dirname + "/temp/screenshots.zip";
  res.download(file, "screenshots.zip", function (err) {
    if (err) {
      console.log(err); // Check error if you want
    } else {
      fs.unlink(file, function () {
        console.log("File was deleted"); // Callback
      });
    }
  }); // Set disposition and send it.
  // res.download(path.join(__dirname, "/" + result + "/screenshots.zip"))
  // res.download("../" + "0098" + '/screenshots.zip', function(error){
  //     console.log("Error : ", error)
  // });
});

//*****************Zip file functions**********************/

function zipFile(sessID) {
  let zip = require("node-zip")();
  //console.log("0.1 " + sessID);
  let zipName = "screenshots.zip";
  // let zipName = `${sessID}_screenshots.zip`; // This just creates a variable to store the name of the zip file that you want to create
  let someDir = fs.readdirSync(__dirname + "/" + sessID); // read the directory that you would like to zip
  let newZipFolder = zip.folder(sessID); // declare a folder with the same name as the directory you would like to zip (we'll later put the read contents into this folder)

  //append each file in the directory to the declared folder

  for (var i = 0; i < someDir.length; i++) {
    //console.log("inside zip file forloop");
    newZipFolder.file(
      someDir[i],
      fs.readFileSync(__dirname + "/" + sessID + "/" + someDir[i]),
      { base64: true }
    );
  }

  let data = zip.generate({ base64: false, compression: "DEFLATE" }); //generate the zip file data

  fs.promises
    .mkdir(__dirname + "/temp/", { recursive: true })
    .catch(console.error);

  //write the data to file
  fs.writeFile(__dirname + "/temp/" + zipName, data, "binary", function (err) {
    //console.log("1. " + __dirname);
    if (err) {
      console.log("triggered: " + err);
    } else {
      fs.rmdir(__dirname + "/" + sessID, { recursive: true }, (err) => {
        if (err) {
          throw err;
        }

        console.log(`${someDir} is deleted!`);
      });
    }
    // do something with the new zipped file
  });
  return;
}
//*****************Zip file functions area**********************/
// Starts the server to begin listening
// =============================================================
app.listen(PORT, function () {
  console.log("App listening on PORT " + PORT);
});
