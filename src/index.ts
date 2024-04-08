import express from "express";
import * as fs from "fs";
const { exec } = require("child_process");
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import { simpleGit } from "simple-git";
import path from "path";
import { v4 as uuidv4 } from "uuid";
const prisma = new PrismaClient();
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/newcompiler/:lang", async (req, res) => {
  //make seperate user for git clone purpose
  try {
    const Id: string = uuidv4().replace(/-/g, "");
    const newId: string = Id.slice(5, 10);
    const lang: string = req.params.lang;
    const response = await prisma.user.create({
      data: {
        id: newId,
        lang: lang,
      },
    });
    const filename: string =
      "main." +
      (lang === "python" || lang === "nodejs"
        ? lang === "python"
          ? "py"
          : "js"
        : lang);
    await prisma.files.create({
      data: {
        filename: filename,
        content: "",
        path: "./",
        user: {
          connect: {
            id: newId,
          },
        },
      },
    });
    return res.send({ success: 1, output: response });
  } catch (error) {
    return res.send({ success: 0, message: "Error in creating new porject" });
  }
});

app.get("/wake-up", async (req, res) => {
  try {
    return res.json({ success: 1 });
  } catch (error) {
    return res.json({ success: 0 });
  }
});

function buildDockerImage(lang: string) {
  return new Promise((resolve, reject) => {
    const dockerCommand = `docker build -t my-${lang}-app ./dock/${lang}`;
    exec(dockerCommand, (error: any, stdout: any, stderr: any) => {
      if (error) {
        reject({ stderr, error });
        return;
      }
      resolve(stdout);
    });
  });
}

function runImage(lang: string, stdin: string) {
  return new Promise((resolve, reject) => {
    const dockerRunCommand = `docker run -i my-${lang}-app`;
    const child = exec(
      dockerRunCommand,
      (error: any, stdout: any, stderr: any) => {
        if (error) {
          reject({ error, stderr });
          return;
        }
        resolve(stdout);
      },
    );
    stdin = stdin === undefined ? (stdin = "") : stdin;
    child.stdin.write(stdin);
    child.stdin.end();
  });
}

app.post("/runcode", async (req: any, res: any) => {
  const lang: string = req.body.lang;
  let ext: string;
  if (lang === "cpp" || lang === "c" || lang === "java") {
    ext = lang;
  } else if (lang === "python") {
    ext = "py";
  } else {
    return res.send({ success: 0, message: "Language not chosen" });
  }
  fs.writeFileSync(`./dock/${lang}/main.${ext}`, req.body.code);
  try {
    await buildDockerImage(lang);
  } catch (error: any) {
    if (lang === "cpp" || lang === "java" || lang === "c") {
      const originalString = error.stderr;
      const firststring = "[4/4]";
      const firstindex = originalString.indexOf(firststring);
      const substring = "> [4/4]";
      const index = originalString.indexOf(substring);
      const copiedString =
        index !== -1
          ? originalString.substring(
              firstindex + firststring.length,
              index - 24,
            )
          : originalString;
      await prisma.user.update({
        where: {
          id: req.body.id,
        },
        data: {
          stdin: req.body.stdin,
          stderr: copiedString,
        },
      });
      return res.send({
        success: 0,
        message: "Failure in compiling the code, please try again later.",
        sender: copiedString,
      });
    }
    await prisma.user.update({
      where: {
        id: req.body.id,
      },
      data: {
        stdin: req.body.stdin,
        stderr: "Failure in compiling the code, please try again later.",
      },
    });
    return res.send({
      success: 0,
      message: "Failure in compiling the code, please try again later.",
      error,
    });
  }
  try {
    const Runner: any = await runImage(lang, req.body.stdin);
    await prisma.user.update({
      where: {
        id: req.body.id,
      },
      data: {
        stdin: req.body.stdin,
        stdout: Runner,
      },
    });
    return res.send({ success: 1, stdout: Runner });
  } catch (error: any) {
    await prisma.user.update({
      where: {
        id: req.body.id,
      },
      data: {
        stdin: req.body.stdin,
        stderr: error.stderr,
      },
    });
    return res.send({
      success: 0,
      stderr: error.stderr,
      err: error.error,
      message: "Failure in compiling the code, please try again later.",
    });
  }
});


app.get("/code-snippet/:id", async (req, res) => {
  const user = await prisma.user.findMany({
    where: {
      id: req.params.id,
    },
  });
  const files = await prisma.files.findMany({
    where: {
      userId: req.params.id,
    },
  });
  if (user.length === 0) {
    return res.send({ success: 0, message: "No Such Code Snippet Found" });
  }
  return res.send({ success: 1, user, files });
});


function isValidGitUrl(url: string): boolean {
  const gitUrlRegex = /^(git|https?):\/\/[^\s/$.?#].[^\s]*$/;
  return gitUrlRegex.test(url);
}

interface FileData {
  filename: string;
  content?: string;
  path: string;
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
      await prisma.files.create({
        data: {
          filename: item.name,
          content: content,
          path: itemPath,
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
        path: itemPath,
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
    console.log(`Deleted folder: ${folderPath}`);
  }
}


app.post("/gitclone", async (req, res) => {
  const url: string = req.body.url;
  const snippet_id: string = req.body.id;
  if (!isValidGitUrl(url)) {
    return res.send({ success: 0, message: "Invalid Git Repository link" });
  }
  try {
    const projectname: string = url.slice(0, -4).slice(19).replace(/\//g, "-");
    const foldername: string = projectname.slice(projectname.indexOf("-") + 1);
    const git: any = await simpleGit().clone(url);
    const response: Array<any> = await processFolder(foldername, snippet_id);
    await deleteFolderRecursive(foldername);
    return res.send({ success: 1, response });
  } catch (error) {
    console.log(error);
    return res.send({ success: 1, message: error });
  }
});

app.listen(5000, () => {
  return console.log(`Express is listening at http://localhost:5000`);
});