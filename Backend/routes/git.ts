import { Router } from "express";
import prisma from "../db";
import { simpleGit } from "simple-git";
import path from "path";
import * as fs from "fs";
import { v4 as uuidv4 } from "uuid";
const app = Router();
function isValidGitUrl(url: string): boolean {
  const gitUrlRegex = /^(git|https?):\/\/[^\s/$.?#].[^\s]*$/;
  return gitUrlRegex.test(url);
}

interface FileData {
  id: string;
  filename: string;
  content?: string;
  userId?: string | null;
  lang: string;
  stdin: string;
  stdout: string;
}

async function processFolder(
  folderPath: string,
  userId: string,
  files: FileData[] = [],
): Promise<FileData[]> {
  try {
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
            lang = "javascript";
            break;
          case "java":
            lang = "java";
            break;
          case "py":
            lang = "python";
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
        const file_create = await prisma.files.create({
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
        files.push(file_create);
      }
    }
    return files;
  } catch (error: any) {
    return [];
  }
}

function deleteFolderRecursive(folderPath: string): void {
  if (fs.existsSync(folderPath)) {
    fs.readdirSync(folderPath).forEach(file => {
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
  if (!isValidGitUrl(url)) {
    return res.send({ success: false, error: "Invalid Git Repository link" });
  }
  const projectname: string = url.slice(0, -4).slice(19).replace(/\//g, "-");
  const foldername: string = projectname.slice(projectname.indexOf("-") + 1);
  try {
    const id: string = uuidv4().replace(/-/g, "").slice(5, 10);
    const git: any = await simpleGit().clone(url);
    const user = await prisma.user.create({
      data: {
        id: id,
      },
    });

    const main: Array<any> = await processFolder(foldername, id);
    const response = {
      id: id,
      files: main,
    };
    if (main.length === 0) {
      throw { message: "No files found in the repository" };
    }
    await deleteFolderRecursive(foldername);
    return res.send({ success: 1, response });
  } catch (error: any) {
    await deleteFolderRecursive(foldername);
    return res.json({ success: false, error: error });
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
        files: true,
      },
    });
    if (!user) {
      throw new Error("No Such Code Snippet Found!");
    }
    const files = user[0].files;
    foldername = user[0].id.toString();
    await fs.mkdirSync(foldername, { recursive: true });
    const git = simpleGit(foldername);
    await git
      .init()
      .addRemote("origin", `https://${req.body.pan}@github.com/${reponame}`);
    const branchName = req.body.branch;
    await git.pull("origin", branchName);
    for (const file of files) {
      fs.writeFileSync(`${foldername}/${file.filename}`, file.content);
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
