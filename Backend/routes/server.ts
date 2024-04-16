import { Router } from "express";
import prisma from "../db";

const app = Router();

app.get("/wake-up", async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    return res.json({ success: 1, users });
  } catch (error: any) {
    const err = error.toString();
    return res.json({ success: 0, error: err });
  }
});

app.get("/reset", async (req, res) => {
  try {
    await prisma.user.deleteMany();
    await prisma.files.deleteMany();
    return res.send({ success: 1 });
  } catch (error: any) {
    const err = error.toString();
    return res.json({ success: 0, error: err });
  }
});
module.exports = app;
