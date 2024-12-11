import { Router } from "express";
import prisma from "../db";

const app = Router();

import * as dotenv from "dotenv";
dotenv.config();

app.get("/wake-up/:pwd", async (req, res) => {
  try {
    const pwd = req.params.pwd;
    if (pwd !== process.env.RESET_PWD) {
      throw new Error("Invalid Password");
    }
    const users = await prisma.user.findMany();
    return res.json({ success: 1, users });
  } catch (error: any) {
    const err = error.toString();
    return res.json({ success: false, error: err });
  }
});

app.get("/reset/:pwd", async (req, res) => {
  try {
    const pwd = req.params.pwd;
    if (pwd !== process.env.RESET_PWD) {
      throw new Error("Invalid Password");
    }
    await prisma.user.deleteMany();
    await prisma.files.deleteMany();
    return res.send({ success: 1 });
  } catch (error: any) {
    const err = error.toString();
    return res.json({ success: false, error: err });
  }
});
module.exports = app;
