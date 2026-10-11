import { Job, Queue } from "bullmq";
import { Worker } from "bullmq";
import { io } from "../../index";
import { executeCode } from "./codeExecuter";
import { dBUpdate } from "./databaseUpdater";
import { codeExecuterProps } from "../../interface/codeExecuterInterface";
const myQueue = new Queue("codebrimQueue", {
  connection: {
    host: "127.0.0.1",
    port: 6379,
  },
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 100,
  },
});
const myWorker = new Worker(
  "codebrimQueue",
  async job => {
    return executeCode(job.data);
  },
  {
    connection: {
      host: "127.0.0.1",
      port: 6379,
    },
  },
);

// Send the result only to the browser that asked for it. Clients that don't
// send a socket id (older frontends) still get the broadcast.
function emitResult(job: Job | undefined, payload: object) {
  const socketId = job?.data?.socketId;
  (socketId ? io.to(socketId) : io).emit("codeResult", payload);
}

myWorker.on("completed", async (job, result: codeExecuterProps) => {
  const { fileId, stdin, stdout } = result;
  const dbupdate = await dBUpdate(fileId, stdin, stdout);
  if (dbupdate === false) {
    return emitResult(job, {
      success: false,
      fileId,
      stdout: "Database Error",
      stderr: "Database Error",
    });
  }
  return emitResult(job, result);
});

myWorker.on("failed", async (job, err) => {
  const file = job?.data?.files;
  const stdout = "Error in backend, please try again in sometime!";
  if (file?.id) {
    await dBUpdate(file.id, file.stdin, stdout);
  }
  emitResult(job, {
    success: false,
    fileId: file?.id,
    stdout,
    stderr: err.message,
  });
});

export { myQueue };
