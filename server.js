// Dependencies
// =============================================================
const express = require("express");
const path = require("path");
//const puppeteer = require("puppeteer");
const { Cluster } = require("puppeteer-cluster");
const fs = require("fs");
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
  const { count } = req.body;
  const { arrLength } = req.body;
  //const urlArray = req.body;
  var concurrenyValue = parseInt(arrLength);
  //convert urlArray in req.body into an array
  for (var urlArray in req.body) {
    if (req.body.hasOwnProperty("urlArray")) {
      var urlArrayToUse = req.body[urlArray];
    }
  }

  // console.log(req.body);
  //console.log(typeof concurrenyValue);
  //console.log("urlArray " + urlArray);
  // console.log("The amount of URLs: " + urlArrayToUse.length);

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
        maxConcurrency: concurrenyValue,
        //maxConcurrency: 15,
        workerCreationDelay: 200, //to prevent max cpu at the start
        monitor: true,
        headless: true,
        timeout: 300000,
      });
      // Print errors to console
      cluster.on("taskerror", (err, data) => {
        console.log(`Error crawling ${data}: ${err.message}`);
      });
      await cluster.task(async ({ page, data: url, worker }) => {
        // const browser = await puppeteer.launch({ headless: false, slowMo: 50 });
        // const page = await browser.newPage();
        console.log("sessID: " + sessID);
        console.log("Processing: " + worker.id + url);
        await page.goto(url, { waitUntil: "networkidle0", timeout: 0 });
        // const path = url.replace(/[^a-zA-Z]/g, "_") + ".png";
        //await page.setViewport({ width: 1024, height: 768 });
        //let frames = await page.frames();
        ///this saves at root
        // await page.screenshot({
        //   fullPage: true,
        //   path: `screenshot${worker.id}.png`,
        // });
        await page.screenshot({
          fullPage: true,
          path: `${sessID}/screenshot${worker.id}.png`,
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
      console.log("Completed, check the screenshots");
      res.sendStatus(200);
    })();
    //const dir = "./" + sessID;
    // fs.readdir(dir, (err, files) => {
    //   if (files.length == urlArray.length) {
    //     zipFile(sessID, function (err) {
    //       if (err) {
    //         console.log(err); // Check error if you want
    //       } else {
    //         return;
    //       }
    //     });
    //   }
    // });
  } catch (e) {
    // catch errors and send error status
    console.log(e);
    res.sendStatus(500);
  }
});

app.get("/api/download", function (req, res) {
  // var result = req.body.data
  // console.log("result"+result)
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

  let zipName = "screenshots.zip"; // This just creates a variable to store the name of the zip file that you want to create
  let someDir = fs.readdirSync(__dirname + "/" + sessID); // read the directory that you would like to zip
  let newZipFolder = zip.folder(sessID); // declare a folder with the same name as the directory you would like to zip (we'll later put the read contents into this folder)

  //append each file in the directory to the declared folder
  for (var i = 0; i < someDir.length; i++) {
    newZipFolder.file(
      someDir[i],
      fs.readFileSync(__dirname + "/" + sessID + "/" + someDir[i]),
      { base64: true }
    );
  }

  let data = zip.generate({ base64: false, compression: "DEFLATE" }); //generate the zip file data

  //write the data to file
  fs.writeFile(__dirname + "/temp/" + zipName, data, "binary", function (err) {
    if (err) {
      console.log(err);
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
}
//*****************Zip file functions area**********************/
// Starts the server to begin listening
// =============================================================
app.listen(PORT, function () {
  console.log("App listening on PORT " + PORT);
});

// const { url } = req.body;
//  const { sessID } = req.body;
//  const { count } = req.body;
//  const { arrLength } = req.body;
//  const { urlArray } = req.body;

//  //console.log(urlArray);
//  console.log("SessID: " + sessID);
//  console.log("The amount of URLs: " + urlArray.length);
//  console.log("URLs to be processed: " + urlArray);

//  if (count == 0) {
//    fs.mkdir(path.join(__dirname, sessID), (err) => {
//      if (err) {
//        return console.error("mkdir error: " + err);
//      }
//      console.log("Directory created successfully!");
//    });
//  }

//  try {
//console.log(urlArray);
//  var testCount = 0;
// for (var i = 0; i < 5; i++) {
//   testCount++; //try to send counter from serverside to front
// }

//var count = 0;
//  var promiseArray = [];
//  var sequentialArray = [];
//  var screenShotInstance = [];
// let kickStart1 = await createDir(count, sessID);
// for (var i = 0; i <= urlArray.length; ) {
//   console.log("current url that being processed: " + urlArray[i]);
//   screenShotInstance[i] = saveScreenshot(urlArray[i], sessID, count);
//   //screenShotInstance[i] = urlArray[i]; <--testing
//   promiseArray.push(screenShotInstance[i]);

//   i++;
//   count++;
//   console.log("i: " + i + " count: " + count);
//   console.log("ScreenShotInstance: " + screenShotInstance);
//   console.log("gg result: " + JSON.stringify(promiseArray));
// }

//let screenshot = await saveScreenshot(url, sessID, count);

///promise.all
//await Promise.all(promiseArray.map(item => await saveScreenshot(urlArray[i], sessID, count)));
// let kickStart2 =
//  await Promise.all(
//    urlArray.map(
//      (url, index) => {
//        saveScreenshot(url, sessID, index);
//      },
//      { concurrency: urlArray.length }
//    )
//  );
//const dir = "./" + sessID;
// fs.readdir(dir, (err, files) => {
//   if (files.length == arrLength) {
//     zipFile(sessID, function (err) {
//       if (err) {
//         console.log(err); // Check error if you want
//       } else {
//         return;
//       }
//     });
//   }
// });

///
// const list = [kickStart1, kickStart2];
// for (const fn of list) {
//   await fn();
// }

// let img = screenshot.toString('base64')

//  async function saveScreenshot(url, sessID, index) {
//   // if (count == 0) {
//   //   fs.mkdir(path.join(__dirname, sessID), (err) => {
//   //     if (err) {
//   //       return console.error(err);
//   //     }
//   //     console.log("Directory created successfully!");
//   //   });
//   // }
//   const browser = await puppeteer.launch({
//     headless: true,
//     args: ["--no-sandbox"],
//   });
//   const page = await browser.newPage();
//   await page.goto(url, { waitUntil: "networkidle0", timeout: 0 });
//   // await page.setViewport({
//   //   width: 1400,
//   //   height: 1000,
//   //   deviceScaleFactor: 1,
//   // });
//   // await page.setViewport({ width: 1200, height: 1200 });
//   await page.screenshot({
//     fullPage: true,
//     path: sessID + "/" + index + ".png",
//   });
//   // const screenshot = await page.screenshot({ path: folder + '/' + count + '.png', fullPage: true })

//   await browser.close(
//     console.log("(" + index + ")" + "URL: " + url + " completed")
//   );
//   // return count
// }
