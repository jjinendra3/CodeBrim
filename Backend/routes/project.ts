import { Router } from "express";
import prisma from "../utils/db";
import { v4 as uuidv4 } from "uuid";
import { languageContent } from "./helper/languageContent";
import { rollbar } from "../utils/rollbar";

const app = Router();

app.post("/file-save", async (req, res) => {
  try {
    const file = req.body.presentFile;
    await prisma.files.update({
      where: {
        id: file.id,
      },
      data: file,
    });
    return res.send({ success: 1 });
  } catch (error) {
    return res.send({ success: false, error: error });
  }
});

app.get("/newcompiler/:lang", async (req, res) => {
  try {
    const Id: string = uuidv4().replace(/-/g, "");
    const newId: string = Id.slice(5, 10);
    const lang: string = req.params.lang;
    const content: string = languageContent(lang);
    const filename: string =
      "main." +
      (lang === "python" || lang === "javascript"
        ? lang === "python"
          ? "py"
          : "js"
        : lang);
    const newUser = await prisma.user.create({
      data: {
        id: newId,
        files: {
          create: {
            filename: filename,
            content: content,
            lang: lang,
          },
        },
      },
      include: {
        files: true,
      },
    });
    return res.send({ success: 1, output: newUser });
  } catch (error: any) {
    const err = error.toString();
    return res.send({ success: false, error: err });
  }
});

app.post("/add-file", async (req, res) => {
  try {
    const Id: string = uuidv4().replace(/-/g, "");
    const projectId: string = req.body.projectId;
    const content: string = languageContent(req.body.lang);
    const filename: string = req.body.filename;
    const newFile = await prisma.files.create({
      data: {
        id: Id,
        filename: filename,
        content: content,
        lang: req.body.lang,
        userId: projectId,
      },
    });
    return res.send({ success: 1, output: newFile });
  } catch (error: any) {
    const err = error.toString();
    return res.send({ success: false, error: err });
  }
});

app.get("/getproject/:id", async (req, res) => {
  try {
    const user = await prisma.user.findFirst({
      where: {
        id: req.params.id,
      },
      include: {
        files: {
          orderBy: {
            datetime: "asc",
          },
        },
      },
    });
    if (!user) {
      throw new Error("No Such Code Snippet Found!");
    }
    return res.send({ success: 1, user: user });
  } catch (error: any) {
    return res.json({ success: false, error: error });
  }
});
app.get("/getfile/:id", async (req, res) => {
  try {
    const file = await prisma.files.findFirst({
      where: {
        id: req.params.id,
      },
    });
    return res.send({ success: 1, file: file });
  } catch (error: any) {
    return res.json({ success: false, error: error });
  }
});

app.get("/clone-snippet/:id", async (req, res) => {
  try {
    const user = await prisma.user.findMany({
      where: {
        id: req.params.id,
      },
      include: {
        files: true,
      },
    });
    if (user.length === 0) {
      throw new Error("No Such Code Snipper Found!");
    }
    const Id: string = uuidv4().replace(/-/g, "");
    const newId: string = Id.slice(5, 10);
    const newUser = await prisma.user.create({
      data: {
        id: newId,
        files: {
          create: {
            filename: user[0].files[0].filename,
            content: user[0].files[0].content,
            lang: user[0].files[0].lang,
          },
        },
      },
      include: {
        files: true,
      },
    });
    return res.send({ success: 1, output: newUser });
  } catch (error) {
    return res.send({ success: false, error: error });
  }
});

app.post("/set-password/:id", async (req, res) => {
  try {
    const user = await prisma.user.update({
      where: {
        id: req.params.id,
      },
      data: {
        password: req.body.password,
      },
    });

    if (user === null) {
      throw new Error("No Such Code Snipper Found!");
    }
    return res.send({ success: 1, output: user });
  } catch (error) {
    return res.send({ success: false, error: error });
  }
});

app.post("/lock-user/:id", async (req, res) => {
  try {
    const user = await prisma.user.update({
      where: {
        id: req.params.id,
      },
      data: {
        password: req.body.password,
      },
    });
    if (user === null) {
      throw new Error("No Such Code Snipper Found!");
    }
    return res.send({ success: 1, output: user });
  } catch (error) {
    return res.send({ success: false, error: error });
  }
});

app.post("/add-feedback", async (req, res) => {
  const feedback = req.body.feedback;
  try {
    await rollbar.log("Feedback", feedback);
    await prisma.feedback.create({
      data: {
        content: feedback.content,
        happy: feedback.happy,
      },
    });
    return res.send({ success: 1 });
  } catch (error) {
    return res.send({ success: false, error: error });
  }
});
module.exports = app;
