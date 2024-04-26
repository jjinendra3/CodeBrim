import { Router } from "express";
import prisma from "../db";
const { exec } = require("child_process");
import * as fs from "fs";
const app = Router();
const date = new Date();

async function prismaupdate(id: string, stdin: string, stdout: string) {
  try {
    await prisma.files.update({
      where: {
        id: id,
      },
      data: {
        stdin: stdin,
        stdout: stdout,
      },
    });
    return { success: 1 };
  } catch (error) {
    return { success: false, error: error };
  }
}

function buildDockerImage(lang: string) {
  return new Promise((resolve, reject) => {
    const dockerCommand = `sudo docker build -t my-${lang}-app ./dock/${lang}`;
    exec(dockerCommand, (error: any, stdout: any, stderr: any) => {
      if (error) {
        reject({ stderr, error });
        return;
      }
      resolve(stdout);
    });
  });
}

function runImage(lang: string, stdin: string) {
  return new Promise((resolve, reject) => {
    const dockerRunCommand = `sudo docker run -i --ulimit cpu=1 my-${lang}-app`;
    const child = exec(
      dockerRunCommand,
      (error: any, stdout: any, stderr: any) => {
        if (error) {
          reject({ error, stderr });
          return;
        }
        resolve(stdout);
      },
    );
    stdin = stdin === undefined || stdin === null ? (stdin = "") : stdin;
    child.stdin.write(stdin);
    child.stdin.end();
  });
}
function findClassName(javaCode: string): string | null {
  const classRegex = /class\s+([A-Za-z_][A-Za-z0-9_]*)\s*\{/g;
  const match = classRegex.exec(javaCode);
  return match ? match[1] : null;
}
app.post("/runcode", async (req: any, res: any) => {
  //run project save then run code
  const lang: string = req.body.files.lang;
  let ext: string;
  if (lang === "cpp" || lang === "java" || lang === "go") {
    ext = lang;
  } else if (lang === "python") {
    ext = "py";
  } else if (lang === "javascript") {
    ext = "js";
  } else {
    return res.send({ success: false, error: "Language not chosen" });
  }
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
  try {
    await buildDockerImage(lang);
  } catch (error: any) {
    if(error.stderr){
      error.stdout+=error.stderr;
    }
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
      const dbupdate = await prismaupdate(
        req.body.files.id,
        req.body.files.stdin,
        date + ">>>\n" + copiedString,
      );
      if (dbupdate.success === false) {
        return res.send({
          success: false,
          stdout: "Database Error",
        });
      }
      return res.send({
        success: false,
        stdout: date + ">>>\n" + copiedString,
      });
    }
    const dbupdate = await prismaupdate(
      req.body.files.id,
      req.body.files.stdin,
      date + ">>>\n" + "Failure in compiling the code, please try again later.",
    );
    if (dbupdate.success === false) {
      return res.send({
        success: false,
        stdout: "Database Error",
      });
    }
    return res.send({
      success: false,
      stdout:
        date +
        ">>>\n" +
        "Failure in compiling the code, please try again later.",
      error: error,
    });
  }
  try {
    const Runner: any = await runImage(lang, req.body.files.stdin);
    const dbupdater = await prismaupdate(
      req.body.files.id,
      req.body.files.stdin,
      date + ">>>\n" + Runner,
    );
    if (dbupdater.success === false) {
      return res.send({
        success: false,
        stdout: "Database Error",
      });
    }
    if (typeof Runner !== "string") {
      return res.send({
        success: false,
        stdout: date + ">>>\n" + "Please try again later!",
      });
    }
    return res.send({ success: 1, stdout: date + ">>>\n" + Runner });
  } catch (error: any) {
    if(error.stderr){
      error.stdout+=error.stderr;
    }
    if (error.error !== null) {
      if (
        error.error.code === "ERR_CHILD_PROCESS_STDIO_MAXBUFFER" ||
        error.error.code === 137
      ) {
        const dbupdaterun = await prismaupdate(
          req.body.files.id,
          req.body.files.stdin,
          date + ">>>\n" + "Timeout Error",
        );
        if (dbupdaterun.success === false) {
          return res.send({
            success: false,
            stdout: "Database Error",
          });
        }
        return res.send({
          success: false,
          stdout: date + ">>>\n" + "Timeout Error",
        });
      }
    }
    const err = error.toString();
    const db = await prismaupdate(
      req.body.files.id,
      req.body.files.stdin,
      date + ">>>\n" + err,
    );
    if (db.success === false) {
      return res.send({
        success: false,
        stdout: "Database Error",
      });
    }
    return res.send({
      success: false,
      stdout: date + ">>>\n" + err,
    });
  }
});
module.exports = app;
