import { Router } from 'express';
import prisma from '../db';
const { exec } = require("child_process");
import * as fs from 'fs';
const app=Router();

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
      stdin = stdin === undefined|| stdin===null ? (stdin = "") : stdin;
      child.stdin.write(stdin);
      child.stdin.end();
    });
  }
  
 app.post("/runcode", async (req: any, res: any) => {
    //run project save then run code
    const lang: string = req.body.lang;
    let ext: string;
    if (lang === "cpp" || lang === "c" || lang === "java" || lang === "go") {
      ext = lang;
    } else if (lang === "python") {
      ext = "py";
    } else if (lang === "rust") {
      ext = "rs";
    } else {
      return res.send({ success: 0, error: "Language not chosen" });
    }
    fs.writeFileSync(`./dock/${lang}/main.${ext}`, req.body.files.content);
    try {
      await buildDockerImage(lang);
    } catch (error:any) {
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
        await prisma.files.update({
          where: {
            id: req.body.files.id,
          },
          data: {
            stdin: req.body.files.stdin,
            stderr: copiedString,
          },
        });
        return res.send({
          success: 0,
          message: "Failure in compiling the code, please try again later.",
          sender: copiedString,
        });
      }
      await prisma.files.update({
        where: {
          id: req.body.files.id,
        },
        data: {
          stdin: req.body.files.stdin,
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
      const Runner: any = await runImage(lang, req.body.files.stdin);
      await prisma.files.update({
        where: {
          id: req.body.files.id,
        },
        data: {
          stdin: req.body.files.stdin,
          stdout: Runner,
        },
      });
      return res.send({ success: 1, stdout: Runner });
    } catch (error: any) {
      await prisma.files.update({
        where: {
          id: req.body.files.id,
        },
        data: {
          stdin: req.body.files.stdin,
          stderr: error.stderr,
        },
      });
      return res.send({
        success: 0,
        stderr: error.stderr,
        err: error.error,
        message: "Failure in compiling the code, please try again later.",
      });
    }
  });
  module.exports = app;