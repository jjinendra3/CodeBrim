import { Router } from "express";
import prisma from "../db";
const { exec } = require("child_process");
import * as fs from "fs";
const app = Router();
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
dayjs.extend(utc);
dayjs.extend(timezone);
import { Queue } from 'bullmq';
const myQueue = new Queue('codebrimQueue', {
    connection: {
        host: '127.0.0.1',
        port: 6379,
    },
});
import { Worker } from 'bullmq';



const myWorker = new Worker('codebrimQueue', async (job) => {
    console.log(`Processing job ${job.id}`);
    const result = await executeCode(job.data);
    return result; 
}, {
    connection: {
        host: '127.0.0.1',
        port: 6379,
    },
});

myWorker.on('completed', (job, result) => {
    console.log(`Job ${job.id} completed with result:`, result);
});

myWorker.on('failed', (job, err) => {
    console.error(`Job ${job?.id} failed:`, err);
});
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
    const dockerCommand = `docker build --rm -t my-${lang}-app ./dock/${lang}`;
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
    const dockerRunCommand = `docker run -i --ulimit cpu=1 my-${lang}-app`;
    //timeout for 5 seconds
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
const executeCode = async (data: any) => {
  console.log(data,"Into the funtions!")
  const date =
    dayjs.tz(new Date(), "Asia/Kolkata").format("ddd, DD-MM-YYYY HH:mm:ss") +
    " ";
  const lang: string = data.files.lang;
  let ext: string;
  if (lang === "cpp" || lang === "java" || lang === "go") {
    ext = lang;
  } else if (lang === "python") {
    ext = "py";
  } else if (lang === "javascript") {
    ext = "js";
  } else {
    return ({ success: false, stderr: "Language not chosen" });
  }
  if (lang === "java") {
    const javafilename = findClassName(data.files.content);
    fs.writeFileSync(
      `./dock/java/Dockerfile`,
      `FROM openjdk:11\nCOPY . /usr/src/myapp\nWORKDIR /usr/src/myapp\nRUN javac ${javafilename}.java\nCMD ["java", "${javafilename}"]`,
    );
    fs.writeFileSync(
      `./dock/${lang}/${javafilename}.${ext}`,
      data.files.content,
    );
  } else {
    fs.writeFileSync(`./dock/${lang}/main.${ext}`, data.files.content);
  }
  try {
    await buildDockerImage(lang);
  } catch (error: any) {
    if (error.stderr) {
      error.stdout += error.stderr;
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
        data.files.id,
        data.files.stdin,
        date + ">>>\n" + copiedString,
      );
      if (dbupdate.success === false) {
        return ({
          success: false,
          stdout: "Database Error",
        });
      }
      return ({
        success: false,
        stdout: date + ">>>\n" + copiedString,
        stderr: date + ">>>\n" + copiedString,
      });
    }
    const dbupdate = await prismaupdate(
      data.files.id,
      data.files.stdin,
      date + ">>>\n" + "Failure in compiling the code, please try again later.",
    );
    if (dbupdate.success === false) {
      return ({
        success: false,
        stdout: "Database Error",
      });
    }
    return ({
      success: false,
      stdout:
        date +
        ">>>\n" +
        "Failure in compiling the code, please try again later.",
      error: error.stderr,
    });
  }
  try {
    const Runner: any = await runImage(lang, data.files.stdin);
    const dbupdater = await prismaupdate(
      data.files.id,
      data.files.stdin,
      date + ">>>\n" + Runner,
    );
    if (dbupdater.success === false) {
      return ({
        success: false,
        stdout: "Database Error",
      });
    }
    if (typeof Runner !== "string") {
      return ({
        success: false,
        stdout: date + ">>>\n" + "Please try again later!",
        stderr: "There is an issue, please try again later!",
      });
    }
    return ({ success: 1, stdout: date + ">>>\n" + Runner });
  } catch (error: any) {
    if (error.error !== null) {
      if (
        error.error.code === "ERR_CHILD_PROCESS_STDIO_MAXBUFFER" ||
        error.error.code === 137
      ) {
        const dbupdaterun = await prismaupdate(
          data.files.id,
          data.files.stdin,
          date + ">>>\n" + "Timeout Error",
        );
        if (dbupdaterun.success === false) {
          return ({
            success: false,
            stdout: "Database Error",
          });
        }
        return ({
          success: false,
          stdout: date + ">>>\n" + "Timeout Error",
          stderr: date + ">>>\n" + "Timeout Error",
        });
      }
    }
    const err = error.toString();
    const db = await prismaupdate(
      data.files.id,
      data.files.stdin,
      date + ">>>\n" + err,
    );
    if (db.success === false) {
      return ({
        success: false,
        stdout: "Database Error",
      });
    }
    return ({
      success: false,
      stdout: date + ">>>\n" + err,
      stderr: date + ">>>\n" + err,
    });
  }
}
app.post("/runcode", async (req: any, res: any) => {
  //run project save then run code
  console.log("hi i amgere");
  myQueue.add('runCode', req.body);
  return ({ success: 1 });
});
module.exports = app;
