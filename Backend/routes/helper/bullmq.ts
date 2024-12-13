import { Queue } from "bullmq";
import { Worker } from "bullmq";
import { io } from "../../io";
import { executeCode } from "./codeExecuter";
import { dBUpdate } from "./databaseUpdater";
import { codeExecuterProps } from "../../interface/codeExecuterInterface";
const myQueue = new Queue("codebrimQueue", {
  connection: {
    host: "127.0.0.1",
    port: 6379,
  },
});
let errResult: codeExecuterProps;

const myWorker = new Worker(
  "codebrimQueue",
  async job => {
    const result = await executeCode(job.data);
    errResult = result;
    return result;
  },
  {
    connection: {
      host: "127.0.0.1",
      port: 6379,
    },
  },
);

myWorker.on("completed", async (_, result) => {
  const { fileId, stdin, stdout } = result;
  const dbupdate = await dBUpdate(fileId, stdin, stdout);
  if (dbupdate === false) {
    return io.emit("codeResult", {
      success: false,
      stdout: "Database Error",
      stderr: "Database Error",
    });
  }
  return io.emit("codeResult", result);
});

myWorker.on("failed", async (_, err) => {
  await dBUpdate(errResult.fileId, errResult.stdin, errResult.stdout);
  io.emit("codeResult", { success: false, error: err });
});

export { myQueue };
