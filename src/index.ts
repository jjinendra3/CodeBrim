import express from "express";
import * as fs from "fs";
const { exec } = require("child_process");
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

function buildDockerImage(lang: String) {
  return new Promise((resolve, reject) => {
    const dockerCommand = `docker build -t my-${lang}-app ./dock/${lang}`;
    exec(dockerCommand, (error: any, stdout: any, stderr: any) => {
      if (error) {
        reject({ stderr, error });
        return;
      }
      resolve(stdout);
    });
  });
}

function runImage(lang: String) {
  return new Promise((resolve, reject) => {
    const dockerRunCommand = `docker run my-${lang}-app`;
    exec(dockerRunCommand, (error: any, stdout: any, stderr: any) => {
      // clearTimeout(3000); //will work for 3 seconds only.
      if (error) {
        reject({ error, stderr });
        return;
      }
      resolve(stdout);
    });
  });
}

//TO FIX : FIX C RUNNING
//TO ENHANCE : ALSO INTEGRATE STDIN
// ADD: ADD THE DATA TO DATABASE
app.post("/runcode", async (req, res) => {
  const lang: String = req.body.lang;
  let ext: String;
  if (lang === "cpp" || lang === "c") {
    ext = lang;
  } else if (lang === "python") {
    ext = "py";
  } else {
    return res.send({ success: 0, msg: "Language not chosen" });
  }
  console.log(lang, ext);
  fs.writeFileSync(`./dock/${lang}/main.${ext}`, req.body.code);
  console.log(1);
  try {
    await buildDockerImage(lang);
  } catch (error: any) {
    console.log(error);
    if (lang === "cpp") {
      //because cpp runs the code while building it.
      const originalString = error.stderr;
      const substring = "Dockerfile:4";
      const index = originalString.indexOf(substring);
      const firststring = "[4/4]";
      const firstindex = originalString.indexOf(firststring);
      const copiedString =
        index !== -1
          ? originalString.substring(
              firstindex + firststring.length,
              index - 24,
            )
          : originalString;
      return res.send({
        success: 0,
        message: "Failure in compiling the code, please try again later.",
        sender: copiedString,
      });
    }
    return res.send({
      success: 0,
      message: "Failure in compiling the code, please try again later.",
    });
  }
  try {
    const Runner = await runImage(lang);
    return res.send({ success: 1, stdout: Runner });
  } catch (error: any) {
    console.log(error);
    return res.send({ success: 0, stderr: error.stderr, err: error.error });
  }
});

app.listen(5000, () => {
  return console.log(`Express is listening at http://localhost:5000`);
});
