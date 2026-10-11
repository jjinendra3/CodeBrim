import { codeExecuterProps } from "../../interface/codeExecuterInterface";
import { execFile } from "child_process";
import { randomUUID } from "crypto";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { javaClassName } from "./javaFileNameExtracter";
dayjs.extend(utc);
dayjs.extend(timezone);

// Set DOCKER_SUDO=true on hosts where the app user can only run docker via sudo.
const DOCKER =
  process.env.DOCKER_SUDO === "true" ? ["sudo", "docker"] : ["docker"];

// Limits for running the user's program (compiling is not limited by these).
const RUN_CPU_SECONDS = 1;
const RUN_WALL_SECONDS = 10;
// Hard cap for the whole container, compile included, so no job can hold the queue.
const CONTAINER_TIMEOUT_MS = 60_000;
const MAX_OUTPUT_BYTES = 1024 * 1024;

const limitRun = `ulimit -t ${RUN_CPU_SECONDS} && exec timeout -s KILL ${RUN_WALL_SECONDS}`;

interface LanguageSetup {
  image: string;
  fileName: string;
  script: string;
}

// Images must exist locally (see dock/prepare-images.sh); keep the two in sync.
function languageSetup(lang: string, code: string): LanguageSetup | null {
  switch (lang) {
    case "c":
      return {
        image: "gcc:latest",
        fileName: "main.c",
        script: `gcc -o /tmp/app main.c && ${limitRun} /tmp/app`,
      };
    case "cpp":
      return {
        image: "gcc:latest",
        fileName: "main.cpp",
        script: `g++ -o /tmp/app main.cpp && ${limitRun} /tmp/app`,
      };
    case "go":
      // Built at deploy from dock/go; has the standard library precompiled.
      return {
        image: "codebrim-go",
        fileName: "main.go",
        script: `go build -o /tmp/app main.go && ${limitRun} /tmp/app`,
      };
    case "java": {
      const className = javaClassName(code);
      return {
        // openjdk:11 was removed from Docker Hub; Temurin is its official successor.
        image: "eclipse-temurin:11-jdk",
        fileName: `${className}.java`,
        script: `javac -d /tmp/classes ${className}.java && ${limitRun} java -cp /tmp/classes ${className}`,
      };
    }
    case "python":
      return {
        image: "python:3",
        fileName: "main.py",
        script: `${limitRun} python3 main.py`,
      };
    case "javascript":
      return {
        image: "node:20",
        fileName: "main.js",
        script: `${limitRun} node main.js`,
      };
    default:
      return null;
  }
}

interface RunResult {
  stdout: string;
  stderr: string;
  exitCode: number | null;
  limit?: "time" | "output";
}

function runContainer(
  setup: LanguageSetup,
  codeDir: string,
  stdin: string,
): Promise<RunResult> {
  const name = `codebrim-run-${randomUUID()}`;
  const args = [
    ...DOCKER.slice(1),
    "run",
    "--rm",
    "-i",
    "--name",
    name,
    "--network",
    "none",
    "--memory",
    "256m",
    "--memory-swap",
    "256m",
    "--pids-limit",
    "128",
    "--mount",
    `type=bind,src=${codeDir},dst=/code,readonly`,
    "-w",
    "/code",
    setup.image,
    "sh",
    "-c",
    setup.script,
  ];

  return new Promise(resolve => {
    const child = execFile(
      DOCKER[0],
      args,
      { timeout: CONTAINER_TIMEOUT_MS, maxBuffer: MAX_OUTPUT_BYTES },
      (error: any, stdout, stderr) => {
        let limit: RunResult["limit"];
        if (error?.code === "ERR_CHILD_PROCESS_STDIO_MAXBUFFER") {
          limit = "output";
        } else if (error?.killed) {
          limit = "time";
        }
        if (limit) {
          execFile(DOCKER[0], [...DOCKER.slice(1), "rm", "-f", name], () => {});
        }
        resolve({
          stdout: stdout.toString(),
          stderr: stderr.toString(),
          exitCode: error ? (typeof error.code === "number" ? error.code : null) : 0,
          limit,
        });
      },
    );
    // docker may exit before reading stdin; without a handler EPIPE crashes the app.
    child.stdin?.on("error", () => {});
    child.stdin?.end(stdin ?? "");
  });
}

// 124/137: killed by the wall-clock timeout (or out of memory), 152: CPU limit.
const TIMEOUT_EXIT_CODES = [124, 137, 152];

const executeCode = async (data: any): Promise<codeExecuterProps> => {
  const fileId: string = data.files.id;
  const lang: string = data.files.lang;
  const stdin: string = data.files.stdin ?? "";
  const date =
    dayjs.tz(new Date(), "Asia/Kolkata").format("ddd, DD-MM-YYYY HH:mm:ss") +
    " ";
  const fail = (message: string, stderr = message): codeExecuterProps => ({
    success: false,
    fileId: fileId,
    stdin: stdin,
    stdout: date + ">>>\n" + message,
    stderr: date + ">>>\n" + stderr,
  });

  const setup = lang ? languageSetup(lang, data.files.content ?? "") : null;
  if (!setup) {
    return {
      success: false,
      fileId: fileId,
      stdin: stdin,
      stdout: "Language not supported",
      stderr: "Language not supported",
    };
  }

  const codeDir = fs.mkdtempSync(path.join(os.tmpdir(), "codebrim-"));
  try {
    fs.writeFileSync(path.join(codeDir, setup.fileName), data.files.content);
    const result = await runContainer(setup, codeDir, stdin);

    if (result.limit === "output") {
      return fail("Output limit exceeded (1 MB)");
    }
    if (
      result.limit === "time" ||
      TIMEOUT_EXIT_CODES.includes(result.exitCode ?? -1)
    ) {
      return fail("Timeout Error");
    }
    if (result.exitCode !== 0) {
      return fail(
        result.stdout + result.stderr || "Error in Running the code",
        "Run Error",
      );
    }
    return {
      success: true,
      fileId: fileId,
      stdin: stdin,
      stdout:
        date +
        ">>>\n" +
        (result.stdout !== ""
          ? result.stdout
          : "There is an issue in the code, please check!"),
      stderr: "",
    };
  } catch (error) {
    return fail("There is an issue, please try again later!");
  } finally {
    fs.rmSync(codeDir, { recursive: true, force: true });
  }
};
export { executeCode };
