// Dependencies
// =============================================================
var express = require("express");
var path = require("path");
var puppeteer = require("puppeteer");
var fs = require("fs");
var Promise = require("bluebird");

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

app.post("/api/screenshot", async (req, res) => {
  const { url } = req.body;

  try {
    let screenshot = await takeScreenshot(url);
    let img = screenshot.toString("base64");
    res.send({ result: img });
  } catch (e) {
    // catch errors and send error status
    console.log(e);
    res.sendStatus(500);
  }
});

async function takeScreenshot(url) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox"],
  });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle0" });
  // await page.setViewport({
  //   width: 1400,
  //   height: 1000,
  //   deviceScaleFactor: 1,
  // });
  await page.setViewport({ width: 1200, height: 1200 });
  const screenshot = await page.screenshot({ fullPage: true });

  await browser.close();
  return screenshot;
}

app.post("/api/savescreenshot", async (req, res) => {
  // const { url } = req.body;
  const { sessID } = req.body;
  //const { count } = req.body;
  const { arrLength } = req.body;
  const { urlArray } = req.body;

  //console.log(urlArray);

  try {
    console.log("SessID: " + sessID);
    console.log("The amount of URLs: " + urlArray.length);
    console.log("URLs to be processed: " + urlArray);
    //console.log(urlArray);
    var testCount = 0;
    // for (var i = 0; i < 5; i++) {
    //   testCount++; //try to send counter from serverside to front
    // }

    var count = 0;
    var promiseArray = [];
    var screenShotInstance = [];
    let kickStart1 = await createDir(count, sessID);
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
    let kickStart2 = await Promise.all(
      urlArray.map(
        (url, index) => {
          screenShotFunction(url, sessID, index);
        },
        { concurrency: 2 }
      )
    );
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
    res.sendStatus(200);
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

async function createDir(count, sessID) {
  if (count == 0) {
    fs.mkdir(path.join(__dirname, sessID), (err) => {
      if (err) {
        return console.error(err);
      }
      console.log("Directory created successfully!");
    });
  }
}

const screenShotFunction = async function saveScreenshot(url, sessID, index) {
  // if (count == 0) {
  //   fs.mkdir(path.join(__dirname, sessID), (err) => {
  //     if (err) {
  //       return console.error(err);
  //     }
  //     console.log("Directory created successfully!");
  //   });
  // }
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox"],
  });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle0", timeout: 0 });
  // await page.setViewport({
  //   width: 1400,
  //   height: 1000,
  //   deviceScaleFactor: 1,
  // });
  // await page.setViewport({ width: 1200, height: 1200 });
  await page.screenshot({
    fullPage: true,
    path: sessID + "/" + index + ".png",
  });
  // const screenshot = await page.screenshot({ path: folder + '/' + count + '.png', fullPage: true })

  await browser.close(
    console.log("(" + index + ")" + "URL: " + url + " completed")
  );
  // return count
};

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

// Starts the server to begin listening
// =============================================================
app.listen(PORT, function () {
  console.log("App listening on PORT " + PORT);
});
