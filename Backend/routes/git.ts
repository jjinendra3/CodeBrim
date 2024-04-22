import { Router } from "express";
import prisma from "../db";
import { simpleGit } from "simple-git";
import path from "path";
import * as fs from "fs";
const app = Router();

function isValidGitUrl(url: string): boolean {
  const gitUrlRegex = /^(git|https?):\/\/[^\s/$.?#].[^\s]*$/;
  return gitUrlRegex.test(url);
}

interface FileData {
  filename: string;
  content?: string;
  userId?: string;
}

async function processFolder(
  folderPath: string,
  userId: string,
  files: FileData[] = [],
): Promise<FileData[]> {
  const folderContents = fs.readdirSync(folderPath, { withFileTypes: true });
  for (const item of folderContents) {
    if (item.name === ".git") {
      continue;
    }
    const itemPath = path.join(folderPath, item.name);
    if (item.isDirectory()) {
      await processFolder(itemPath, userId);
    } else if (item.isFile()) {
      const content = fs.readFileSync(itemPath, "utf8").replace(/\x00/g, " ");
      const fileExtension = path.extname(item.name).slice(1);
      let lang = "";
      switch (fileExtension) {
        case "js":
          lang = "javaScript";
          break;
        case "java":
          lang = "java";
          break;
        case "py":
          lang = "Python";
          break;
        case "cpp":
          lang = "cpp";
          break;
        case "cpp":
          lang = "cpp";
          break;
        case "go":
          lang = "go";
          break;
        default:
          lang = "";
      }
      await prisma.files.create({
        data: {
          filename: item.name,
          content: content,
          lang: lang,
          user: {
            connect: {
              id: userId,
            },
          },
        },
      });
      files.push({
        filename: item.name,
        content,
        userId,
      });
    }
  }
  return files;
}

function deleteFolderRecursive(folderPath: string): void {
  if (fs.existsSync(folderPath)) {
    fs.readdirSync(folderPath).forEach((file) => {
      const curPath = path.join(folderPath, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        deleteFolderRecursive(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(folderPath);
  }
}

app.post("/gitclone", async (req, res) => {
  const url: string = req.body.url;
  const snippet_id: string = req.body.id;
  if (!isValidGitUrl(url)) {
    return res.send({ success: false, error: "Invalid Git Repository link" });
  }
  try {
    const projectname: string = url.slice(0, -4).slice(19).replace(/\//g, "-");
    const foldername: string = projectname.slice(projectname.indexOf("-") + 1);
    const git: any = await simpleGit().clone(url);
    const response: Array<any> = await processFolder(foldername, snippet_id);
    await deleteFolderRecursive(foldername);
    return res.send({ success: 1, response });
  } catch (error: any) {
    return res.json({ success: false, error: error });
  }
});
app.post("/gitpush/:id", async (req, res) => {
  try {
      if (!isValidGitUrl(req.body.url)) {
          throw new Error("Invalid Git Repository link");
      }
      const user = await prisma.user.findMany({
          where: {
              id: req.params.id,
          },
          include: {
              files: true,
          },
      });
      if (!user) {
          throw new Error("No Such Code Snippet Found!");
      }
      const files = user[0].files;
      const foldername: string = user[0].id.toString();
      if (!fs.existsSync(foldername)) {
          fs.mkdirSync(foldername);
      }
      for (const file of files) {
          fs.writeFileSync(`${foldername}/${file.filename}`, file.content);
      }
      const git = simpleGit(foldername);
      await git.init();
      await git.add(".");
      await git.commit(req.body.commitmsg + " (Pushed using CodeBrim)");
      
      const branchName = req.body.branch;
      const remoteUrl = req.body.url;
      
      await git.fetch();
      const remoteExists = await git.listRemote(['--get-url', 'origin']).then((url) => url.trim() === remoteUrl);
      if (!remoteExists) {
          await git.addRemote("origin", remoteUrl);
      }

      const localBranches = await git.branchLocal();
      const branchExists = localBranches.all.includes(branchName);
      if (!branchExists) {
          await git.checkoutLocalBranch(branchName);
      } else {
          await git.checkout(branchName);
      }

      await git.push("origin", branchName);

      if (fs.existsSync(foldername)) {
          fs.rmdirSync(foldername, { recursive: true });
      }
      return res.send({ success: true });
  } catch (error: any) {
      return res.json({ success: false, error: error.message });
  }
});

module.exports = app;
