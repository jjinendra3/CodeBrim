import { codeExecuterProps } from "../../interface/codeExecuterInterface";
const { exec } = require("child_process");
import * as fs from "fs";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { javaFileNameExtracter } from "./javaFileNameExtracter";
dayjs.extend(utc);
dayjs.extend(timezone);

function buildDockerImage(lang: string) {
  return new Promise((resolve, reject) => {
    const dockerCommand = `sudo docker build --rm -t my-${lang}-app ./dock/${lang}`;
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
    const dockerRunCommand = `sudo docker run --rm -i --ulimit cpu=1 my-${lang}-app`;
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

const extractBuildErrorMessage = (error: { stderr: Buffer }): string => {
  const originalString = error.stderr.toString();
  const firstMarker = "[4/4]";
  const secondMarker = "> [4/4]";

  const firstIndex = originalString.indexOf(firstMarker);
  const secondIndex = originalString.indexOf(secondMarker);
  if (firstIndex === -1 || secondIndex === -1) {
    return originalString;
  }

  return originalString.slice(
    firstIndex + firstMarker.length,
    secondIndex - 24,
  );
};

const executeCode = async (data: any): Promise<codeExecuterProps> => {
  const fileId: string = data.files.id;
  const lang: string = data.files.lang;
  const stdin: string = data.files.stdin;
  const date =
    dayjs.tz(new Date(), "Asia/Kolkata").format("ddd, DD-MM-YYYY HH:mm:ss") +
    " ";

  const languageExtensions: Record<string, string> = {
    c: "c",
    cpp: "cpp",
    java: "java",
    go: "go",
    python: "py",
    javascript: "js",
  };

  const ext = languageExtensions[lang];
  if (!ext || !lang) {
    return {
      success: false,
      fileId: fileId,
      stdin: stdin,
      stdout: "Language not supported",
      stderr: "Language not supported",
    };
  }
  const fileName =
    lang === "java" ? javaFileNameExtracter(data.files.content) : "main";
  fs.writeFileSync(`./dock/${lang}/${fileName}.${ext}`, data.files.content);
  try {
    await buildDockerImage(lang);
  } catch (error: any) {
    if (error.stderr) {
      error.stdout += error.stderr;
    }
    if (lang === "cpp" || lang === "java") {
      const copiedString: string = extractBuildErrorMessage(error);
      return {
        success: false,
        fileId: fileId,
        stdin: stdin,
        stdout: date + ">>>\n" + copiedString,
        stderr: date + ">>>\n" + copiedString,
      };
    }
    return {
      success: false,
      fileId: fileId,
      stdin: stdin,
      stdout:
        date +
        ">>>\n" +
        "Failure in compiling the code, please try again later.",
      stderr:
        date +
        ">>>\n" +
        "Failure in compiling the code, please try again later.",
    };
  }
  try {
    const Runner: any = await runImage(lang, stdin);
    return {
      success: typeof Runner != "string" ? false : true,
      fileId: fileId,
      stdin: stdin ? stdin.toString() : "",
      stdout:
        date +
        ">>>\n" +
        (Runner !== ""
          ? Runner.toString()
          : "There is an issue in the code, please check!"),
      stderr:
        typeof Runner != "string"
          ? "There is an issue, please try again later!"
          : "",
    };
  } catch (error: any) {
    if (error.error !== null) {
      if (
        error.error.code === "ERR_CHILD_PROCESS_STDIO_MAXBUFFER" ||
        error.error.code === 137
      ) {
        return {
          success: false,
          fileId: fileId,
          stdin: stdin,
          stdout: date + ">>>\n" + "Timeout Error",
          stderr: date + ">>>\n" + "Timeout Error",
        };
      }
    }
    const err = error.stderr ?? "Error in Running the code";
    return {
      success: false,
      fileId: fileId,
      stdin: stdin,
      stdout: date + ">>>\n" + err,
      stderr: date + ">>>\n" + "Run Error",
    };
  }
};
export { executeCode };
