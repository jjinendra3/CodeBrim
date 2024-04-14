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

app.get("/wake-up", async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where:{
        id:"32ea9"
      },
      include: {
        files: true,
      },
    });
    return res.json({ success: 1, users });
  } catch (error:any) {
    const err=error.toString();
return res.json({ success: 0,error:err });
  }
});

app.get("/reset", async (req, res) => {
  try {
    await prisma.user.deleteMany();
    await prisma.files.deleteMany();
    return res.send({ success: 1 });
  } catch (error:any) {
    const err=error.toString();
return res.json({ success: 0,error:err });
  }
});

app.post("/project-save", async (req, res) => {
  try {
    for (let i = 0; i < req.body.files.length; i++) {
      const obj = req.body.files[i];
      if (obj.id[0] !== "c") {
        //creating uuid in frontend aand cuid in backend(prisma)
        await prisma.files.create({
          data: {
            filename: obj.filename,
            content: obj.content,
            user: {
              connect: {
                id: req.body.projectid,
              },
            },
          },
        });
        continue;
      }
      await prisma.files.update({
        where: {
          id: obj.id,
        },
        data: {
          filename: obj.filename,
          content: obj.content,
          stdin: obj.stdin,
          stdout: obj.stdout,
          stderr: obj.stderr,
        },
      });
    }
    return res.send({success:1})
  
  } catch (error) {
    return res.send({success:0,error:error});
  }
 });

app.get("/newcompiler/:lang", async (req, res) => {
  try {
    const Id: string = uuidv4().replace(/-/g, "");
    const newId: string = Id.slice(5, 10);
    const lang: string = req.params.lang;
    await prisma.user.create({
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
    const newfile = await prisma.files.create({
      data: {
        filename: filename,
        content: "",
        user: {
          connect: {
            id: newId,
          },
        },
      },
    });
    const finder = await prisma.user.findMany({
      where: {
        id: newId,
      },
    });
    return res.send({ success: 1, output: finder, newfile });
  } catch (error:any) {
    const err=error.toString();
    return res.send({ success: 0, error: err });
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
    stdin = stdin === undefined|| stdin===null ? (stdin = "") : stdin;
    child.stdin.write(stdin);
    child.stdin.end();
  });
}

app.post("/runcode", async (req: any, res: any) => {
  //run project save then run code
  const lang: string = req.body.lang;
  let ext: string;
  if (lang === "cpp" || lang === "c" || lang === "java" || lang === "go") {
    ext = lang;
  } else if (lang === "python") {
    ext = "py";
  } else if (lang === "rust") {
    ext = "rs";
  } else {
    return res.send({ success: 0, error: "Language not chosen" });
  }
  fs.writeFileSync(`./dock/${lang}/main.${ext}`, req.body.files.content);
  try {
    await buildDockerImage(lang);
  } catch (error:any) {
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
      await prisma.files.update({
        where: {
          id: req.body.files.id,
        },
        data: {
          stdin: req.body.files.stdin,
          stderr: copiedString,
        },
      });
      return res.send({
        success: 0,
        message: "Failure in compiling the code, please try again later.",
        sender: copiedString,
      });
    }
    await prisma.files.update({
      where: {
        id: req.body.files.id,
      },
      data: {
        stdin: req.body.files.stdin,
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
    const Runner: any = await runImage(lang, req.body.files.stdin);
    await prisma.files.update({
      where: {
        id: req.body.files.id,
      },
      data: {
        stdin: req.body.files.stdin,
        stdout: Runner,
      },
    });
    return res.send({ success: 1, stdout: Runner });
  } catch (error: any) {
    await prisma.files.update({
      where: {
        id: req.body.files.id,
      },
      data: {
        stdin: req.body.files.stdin,
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
  try {
    const user = await prisma.user.findMany({
      where: {
        id: req.params.id,
      },
      include:{
        files:true
      }
    });
    if(user.length===0){
      throw new Error("No Such Code Snipper Found!");
    }
    return res.send({ success: 1,  user:user[0] });
  } catch (error:any) {
return res.json({ success: 0,error:error });;
  }
 
});

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
      await prisma.files.create({
        data: {
          filename: item.name,
          content: content,
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
    return res.send({ success: 0, error: "Invalid Git Repository link" });
  }
  try {
    const projectname: string = url.slice(0, -4).slice(19).replace(/\//g, "-");
    const foldername: string = projectname.slice(projectname.indexOf("-") + 1);
    const git: any = await simpleGit().clone(url);
    const response: Array<any> = await processFolder(foldername, snippet_id);
    await deleteFolderRecursive(foldername);
    return res.send({ success: 1, response });
  } catch (error:any) {
return res.json({ success: 0,error:error });
  }
});


app.post("/gitpush/:id", async (req, res) => {
  try {
    if(!isValidGitUrl(req.body.url)){
      return res.send({ success: 0, error: "Please enter a valid git repository link" })
    }
    const user = await prisma.user.findMany({
      where: {
        id: req.params.id,
      },
      include:{
        files:true
      }
    });
    if(user.length===0){
      throw new Error("No Such Code Snipper Found!");
    }
    const files = user[0].files;
    const foldername: string = user[0].id;
    if (!fs.existsSync(foldername)) {
      fs.mkdirSync(foldername);
    }
    for (const file of files) {
      fs.writeFileSync(`${foldername}/${file.filename}`, file.content);
    }
    const git = simpleGit(foldername);
    await git.init();
    await git.add(".");
    await git.commit(req.body.commitmsg);
    let flag=0;
    await git.getRemotes(true, (err, remotes) => {
      if (err) {
        throw err;
      }
    
      const originExists = remotes.some(remote => remote.name === 'origin');
    
      if (originExists) {
        flag=0;
      } else {
        flag=1;
      }
    });
    if(flag===1){
    await git.addRemote("origin", req.body.url);
  }
    await git.push("origin", req.body.branch);
    if (fs.existsSync(foldername)) {
      fs.rmdirSync(`${foldername}`);
    }
    return res.send({ success: 1 });
  }catch (error:any) {
    const err=error.toString();
    return res.json({ success: 0,error:err });
  }
} );

app.listen(5000, () => {
  return console.log(`Express is listening at http://localhost:5000`);
});
