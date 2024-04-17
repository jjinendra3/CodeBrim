import { Router } from "express";
import prisma from "../db";
const { exec } = require("child_process");
import * as fs from "fs";
const app = Router();
const date = new Date();
function buildDockerImage(lang: string) {
  console.log("Building Docker Image");
  return new Promise((resolve, reject) => {
    console.log("Building Docker Image2");
    const dockerCommand = `docker build -t my-${lang}-app ./dock/${lang}`;
    exec(dockerCommand, (error: any, stdout: any, stderr: any) => {
      if (error) {
        console.log({ stderr, error });
        reject({ stderr, error });
        return;
      }
      console.log(stdout);
      resolve(stdout);
    });
  });
}

function runImage(lang: string, stdin: string) {
  return new Promise((resolve, reject) => {
    console.log("Running Docker Image");
    const dockerRunCommand = `docker run -i my-${lang}-app`;
    const child = exec(
      dockerRunCommand,
      (error: any, stdout: any, stderr: any) => {
        if (error) {
          console.log({ error, stderr });
          reject({ error, stderr });
          return;
        }
        console.log(stdout);
        resolve(stdout);
      },
    );
    console.log("Running Docker Image2 Interactively");
    stdin = stdin === undefined || stdin === null ? (stdin = "") : stdin;
    child.stdin.write(stdin);
    child.stdin.end();
    console.log('Running container for interactive console.')
  });
}
function findClassName(javaCode: string): string | null {
  const classRegex = /class\s+([A-Za-z_][A-Za-z0-9_]*)\s*\{/g;
  const match = classRegex.exec(javaCode);
  return match ? match[1] : null;
}
app.post("/runcode", async (req: any, res: any) => {
  //run project save then run code
  console.log(1);
  const lang: string = req.body.files.lang;
  let ext: string;
  if (lang === "cpp" || lang === "java" || lang === "go") {
    ext = lang;
  } else if (lang === "python") {
    ext = "py";
  } else if (lang === "rust") {
    ext = "rs";
  } else if (lang === "javascript") {
    ext = "js";
  } else {
    return res.send({ success: 0, error: "Language not chosen" });
  }
  console.log(1);
  if (lang === "java") {
    const javafilename = findClassName(req.body.files.content);
    fs.writeFileSync(
      `./dock/java/Dockerfile`,
      `FROM openjdk:11\nCOPY . /usr/src/myapp\nWORKDIR /usr/src/myapp\nRUN javac ${javafilename}.java\nCMD ["java", "${javafilename}"]`,
    );
    fs.writeFileSync(
      `./dock/${lang}/${javafilename}.${ext}`,
      req.body.files.content,
    );
  } else {
    fs.writeFileSync(`./dock/${lang}/main.${ext}`, req.body.files.content);
  }
  console.log(2);
  try {
    console.log(3);
    await buildDockerImage(lang);
    console.log(4);
  } catch (error: any) {
    console.log({ error });
    if (lang === "cpp" || lang === "java") {
      const originalString = error.stderr;
      const firststring = "[4/4]";
      const firstindex = originalString.indexOf(firststring);
      const substring = "> [4/4]";
      const index = originalString.indexOf(substring);
      const copiedString =
        index !== -1
          ? originalString.substring(
              firstindex + firststring.length,
              index - 24,
            )
          : originalString;
          console.log(copiedString,'error1');
      await prisma.files.update({
        where: {
          id: req.body.files.id,
        },
        data: {
          stdin: req.body.files.stdin,
          stdout: date + ">>>\n" + copiedString,
        },
      });
      return res.send({
        success: 0,
        stdout:
          date +
          ">>>\n" +
          "Failure in compiling the code, please try again later.",
        sender: date + ">>>\n" + copiedString,
      });
    }
    await prisma.files.update({
      where: {
        id: req.body.files.id,
      },
      data: {
        stdin: req.body.files.stdin,
        stdout:
          date +
          ">>>\n" +
          "Failure in compiling the code, please try again later.",
      },
    });
    console.log(''+error,'error3')
    return res.send({
      success: 0,
      stdout:
        date +
        ">>>\n" +
        "Failure in compiling the code, please try again later.",
      error: date + ">>>\n" + error,
    });
  }
  try {
    console.log('running image')
    const Runner: any = await runImage(lang, req.body.files.stdin);
    console.log('image ran')
    await prisma.files.update({
      where: {
        id: req.body.files.id,
      },
      data: {
        stdin: req.body.files.stdin,
        stdout: date + ">>>\n" + Runner,
      },
    });
    console.log('updated');
    return res.send({ success: 1, stdout: date + ">>>\n" + Runner });
  } catch (error: any) {
    const err = error.stderr.toString();
    console.log(error,err,"running image error");
    await prisma.files.update({
      where: {
        id: req.body.files.id,
      },
      data: {
        stdin: req.body.files.stdin,
        stdout: date + ">>>\n" + err,
      },
    });
    console.log('updated',err);
    return res.send({
      success: 0,
      stdout: date + ">>>\n" + error.stderr,
      error: date + ">>>\n" + error.error,
      message:
        date +
        ">>>\n" +
        "Failure in compiling the code, please try again later.",
    });
  }
});
module.exports = app;
