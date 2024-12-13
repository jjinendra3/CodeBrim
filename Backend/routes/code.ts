import { Router } from "express";
import { myQueue } from "./helper/bullmq";

const app = Router();

app.post("/runcode", async (req: any, res: any) => {
  try {
    await myQueue.add("runCode", req.body);
    return res.send({ success: true });
  } catch (error) {
    return res.send({
      success: false,
      stderr: "Error in backend, please try again in sometime!",
    });
  }
});
module.exports = app;
