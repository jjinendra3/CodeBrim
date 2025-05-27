import { Router } from "express";
import prisma from "../utils/db";
import { v4 as uuidv4 } from "uuid";
import { languageContent } from "./helper/languageContent";
import { rollbar } from "../utils/rollbar";
import {
  createFolderStructureRecursive,
  createZipFromFolder,
  deleteFolderRecursive,
} from "./helper/fileFolderOperations";
import * as fs from "fs";
import path from "path";
const app = Router();

app.get("/newcompiler/:lang", async (req, res) => {
  try {
    const id = uuidv4().replace(/-/g, "").slice(5, 10);
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
        id: id,
        items: {
          create: {
            name: filename,
            content: content,
            lang: lang,
            type: "file",
          },
        },
      },
      include: {
        items: true,
      },
    });
    return res.send({ success: 1, output: newUser });
  } catch (error: any) {
    const err = error.toString();
    return res.send({ success: false, error: err });
  }
});

app.put("/update-item", async (req, res) => {
  try {
    const { file } = req.body;
    const updatedFile = await prisma.files.update({
      where: { id: file.id },
      data: file,
    });

    return res.send({ success: 1, output: updatedFile });
  } catch (error) {
    console.error("Error updating file:", error);
    return res.send({ success: false, error: error });
  }
});

app.post("/add-item", async (req, res) => {
  try {
    const { projectId, name, type, parentId, lang } = req.body;
    const content: string = languageContent(req.body.lang);
    const newFile = await prisma.files.create({
      data: {
        name: name,
        content: content,
        lang: lang ?? "txt",
        userId: projectId,
        type: type,
        parentId: parentId,
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
        items: true,
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

app.delete("/delete-item/:id", async (req, res) => {
  try {
    const file = await prisma.files.delete({
      where: {
        id: req.params.id,
      },
    });
    if (file === null) {
      throw new Error("No Such Code Snipper Found!");
    }
    return res.send({ success: 1, output: file });
  } catch (error: any) {
    const err = error.toString();
    return res.send({ success: false, error: err });
  }
});

app.get("/download/:id", async (req, res) => {
  let tempFolderPath: string = "";
  let zipFilePath: string = "";

  try {
    if (!req.params.id) {
      return res
        .status(400)
        .json({ success: false, error: "User ID is required" });
    }

    const user = await prisma.user.findFirst({
      where: {
        id: req.params.id,
      },
      include: {
        items: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "No code snippets found for this user",
      });
    }

    const timestamp = Date.now();
    const folderName = `temp-${user.id}-${timestamp}`;
    const zipFileName = `${folderName}.zip`;

    tempFolderPath = path.resolve(folderName);
    zipFilePath = path.resolve(zipFileName);

    console.log(`Creating folder structure for user ${user.id}...`);

    await createFolderStructureRecursive(user.items, tempFolderPath);
    await createZipFromFolder(tempFolderPath, zipFilePath);

    if (!fs.existsSync(zipFilePath)) {
      throw new Error("Failed to create zip file");
    }
    const stats = fs.statSync(zipFilePath);
    const filename = `code-snippets-codebrim-${user.id}.zip`;

    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Length", stats.size);

    res.download(zipFilePath, filename, async downloadError => {
      await deleteFolderRecursive(tempFolderPath);
      if (fs.existsSync(zipFilePath)) {
        fs.unlinkSync(zipFilePath);
      }
      if (downloadError) {
        console.error("Download error:", downloadError);
        if (!res.headersSent) {
          return res.status(500).json({
            success: false,
            error: "Failed to download file",
          });
        }
      }
    });
  } catch (error: any) {
    console.error("Download endpoint error:", error);

    await deleteFolderRecursive(tempFolderPath);
    if (fs.existsSync(zipFilePath)) {
      fs.unlinkSync(zipFilePath);
    }
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        error: error.message || "Internal server error",
      });
    }
  }
});

app.get("/clone-snippet/:id", async (req, res) => {
  try {
    const user = await prisma.user.findMany({
      where: {
        id: req.params.id,
      },
      include: {
        items: true,
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
        items: {
          create: {
            name: user[0].items[0].name,
            content: user[0].items[0].content,
            lang: user[0].items[0].lang,
            type: user[0].items[0].type,
          },
        },
      },
      include: {
        items: true,
      },
    });
    return res.send({ success: 1, output: newUser });
  } catch (error) {
    return res.send({ success: false, error: error });
  }
});

app.post("/project-privacy/:id", async (req, res) => {
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
