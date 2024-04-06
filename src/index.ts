import express from "express";
import * as fs from "fs";
const { exec } = require("child_process");
import cors from "cors";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

function buildDockerImage(lang: string) {
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

function runImage(lang: string, stdin: string) {
  return new Promise((resolve, reject) => {
    const dockerRunCommand = `docker run -i my-${lang}-app`;
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
    stdin=stdin===undefined?stdin="":stdin;
    child.stdin.write(stdin);
    child.stdin.end();
  });
}

app.post("/runcode", async (req: any, res: any) => {
  const ok=await prisma.user.findMany();
  console.log(ok);
  const lang: string = req.body.lang;
  let ext: string;
  if (lang === "cpp" || lang === "c" || lang === "java") {
    ext = lang;
  } else if (lang === "python") {
    ext = "py";
  } else {
    return res.send({ success: 0,  message: "Language not chosen" });
  }
  fs.writeFileSync(`./dock/${lang}/main.${ext}`, req.body.code);
  try {
    await buildDockerImage(lang);
  } catch (error: any) {
    if (lang === "cpp" || lang === "java" || lang === "c") {
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
      await prisma.user.create({
        data: {
          lang: lang,
          code: req.body.code,
          stdin: req.body.stdin,
          stderr: copiedString,
        },
      });
      return res.send({
        success: 0,
        message: "Failure in compiling the code, please try again later.",
        sender: copiedString,
      });
    }
    await prisma.user.create({
      data: {
        lang: lang,
        code: req.body.code,
        stdin: req.body.stdin,
        stderr: "Failure in compiling the code, please try again later.",
      },
    });
    return res.send({
      success: 0,
      message: "Failure in compiling the code, please try again later.",
      error,
    });
  }
  try {
    const Runner: any = await runImage(lang, req.body.stdin);
    await prisma.user.create({
      data: {
        lang: lang,
        code: req.body.code,
        stdin: req.body.stdin,
        stdout: Runner,
      },
    });
    return res.send({ success: 1, stdout: Runner });
  } catch (error: any) {
    await prisma.user.create({
      data: {
        lang: lang,
        code: req.body.code,
        stdin: req.body.stdin,
        stderr: error.stderr,
      },
    });
    return res.send({ success: 0, stderr: error.stderr, err: error.error, message: "Failure in compiling the code, please try again later.", });
  }
});

app.listen(5000, () => {
  return console.log(`Express is listening at http://localhost:5000`);
});
