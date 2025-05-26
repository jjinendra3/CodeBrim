import { Router } from "express";
import prisma from "../utils/db";
import { v4 as uuidv4 } from "uuid";
import { simpleGit } from "simple-git";
import * as fs from "fs";
import { executeGitClone, isValidGitUrl } from "./helper/gitOperations";
import {
  processFolder,
  createFolderStructureRecursive,
  deleteFolderRecursive,
} from "./helper/fileFolderOperations";
import path from "path";

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
  const { gitUrl, accessToken, branch, commitMsg } = req.body;
  try {
    if (!gitUrl || !accessToken || !branch || !commitMsg || !req.params.id) {
      throw new Error(
        "Missing required fields: url, pan, branch, commit message or user ID",
      );
    }

    if (!isValidGitUrl(req.body.url)) {
      throw new Error("Invalid Git Repository link");
    }

    const urlParts = req.body.url.replace(".git", "").split("/");
    const reponame = urlParts.slice(-2).join("/");

    const user = await prisma.user.findFirst({
      where: {
        id: req.params.id,
      },
      include: {
        items: {
          orderBy: {
            datetime: "asc",
          },
        },
      },
    });

    if (!user) {
      throw new Error("User not found!");
    }

    if (!user.items || user.items.length === 0) {
      throw new Error("No files found to push!");
    }

    const files = user.items;

    const tempDir = path.join(process.cwd(), "temp");
    foldername = path.join(tempDir, `push-${user.id}-${Date.now()}`);

    fs.mkdirSync(tempDir, { recursive: true });
    fs.mkdirSync(foldername, { recursive: true });

    const git = simpleGit(foldername);
    await git.init();

    const remoteUrl = `https://${req.body.pan}@github.com/${reponame}`;
    await git.addRemote("origin", remoteUrl);

    const branchName = req.body.branch;

    try {
      await git.pull("origin", branchName);
      console.log(`Pulled existing branch: ${branchName}`);
    } catch (error) {
      console.log(
        `Branch ${branchName} doesn't exist remotely, will create new one`,
      );
    }

    await createFolderStructureRecursive(files, foldername);

    await git.add(".");
    const status = await git.status();
    if (status.files.length === 0) {
      throw new Error("No changes to commit");
    }

    await git.commit(req.body.commitmsg + " (Pushed using CodeBrim)");

    try {
      const localBranches = await git.branchLocal();
      const branchExists = localBranches.all.includes(branchName);

      if (!branchExists) {
        await git.checkoutLocalBranch(branchName);
      } else {
        await git.checkout(branchName);
      }
    } catch (error) {
      console.log("Branch checkout warning:", error);
    }

    await git.push("origin", branchName, { "--set-upstream": null });

    await deleteFolderRecursive(foldername);

    return res.json({
      success: true,
      message: `Successfully pushed to ${reponame}/${branchName}`,
      filesCount: files.length,
    });
  } catch (error: any) {
    console.error("Git push error:", error);

    if (foldername && fs.existsSync(foldername)) {
      try {
        await deleteFolderRecursive(foldername);
      } catch (cleanupError) {
        console.error("Cleanup error:", cleanupError);
      }
    }

    return res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = app;
