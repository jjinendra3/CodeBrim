import { Router } from "express";
import prisma from "../utils/db";
import { v4 as uuidv4 } from "uuid";
import { simpleGit } from "simple-git";
import * as fs from "fs";
import {
  deleteFolderRecursive,
  executeGitClone,
  isValidGitUrl,
  processFolder,
} from "./helper/gitOperations";

const app = Router();

app.post("/clone", async (req, res) => {
  const { repoUrl } = req.body;
  const userId = uuidv4().replace(/-/g, "").slice(5, 10);
  if (!isValidGitUrl(repoUrl)) {
    return res.send({ success: false, error: "Invalid Git Repository link" });
  }
  const folderPath = `temp-repo-${userId}`;
  try {
    await executeGitClone(repoUrl, folderPath);
    const files = await processFolder(folderPath, userId);
    const response = await prisma.user.create({
      data: {
        id: userId,
        items: {
          create: files,
        },
      },
      include: {
        items: true,
      },
    });
    await deleteFolderRecursive(folderPath);
    return res.send({
      success: true,
      output: response,
    });
  } catch (error: any) {
    console.error("Error cloning repository:", error);
    await deleteFolderRecursive(folderPath);
    return res.send({ success: false, error: error.message });
  }
});

app.post("/gitpush/:id", async (req, res) => {
  let foldername: string = "";
  let reponame: string = "";
  try {
    if (!isValidGitUrl(req.body.url)) {
      throw new Error("Invalid Git Repository link");
    }
    reponame = req.body.url.slice(0, -4).slice(19);
    const user = await prisma.user.findMany({
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
    const files = user[0].items;
    foldername = user[0].id.toString();
    await fs.mkdirSync(foldername, { recursive: true });
    const git = simpleGit(foldername);
    await git
      .init()
      .addRemote("origin", `https://${req.body.pan}@github.com/${reponame}`);
    const branchName = req.body.branch;
    await git.pull("origin", branchName);
    for (const file of files) {
      fs.writeFileSync(`${foldername}/${file.name}`, file.content ?? "");
    }
    await git.add(".");
    await git.commit(req.body.commitmsg + "  (Pushed using CodeBrim)");
    await git.fetch();
    const localBranches = await git.branchLocal();
    const branchExists = localBranches.all.includes(branchName);
    if (!branchExists) {
      await git.checkoutLocalBranch(branchName);
    } else {
      await git.checkout(branchName);
    }
    await git.push("origin", branchName);
    await deleteFolderRecursive(foldername);
    return res.send({ success: true });
  } catch (error: any) {
    if (foldername != "") {
      await deleteFolderRecursive(foldername);
    }
    return res.json({ success: false, error: error.message });
  }
});

module.exports = app;
