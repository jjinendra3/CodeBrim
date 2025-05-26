import { exec } from "child_process";
import { FileData } from "../../interface/fileData";
import * as fs from "fs";
import * as path from "path";
import { randomUUID } from "crypto";

function getLangName(extension: string): string {
  switch (extension) {
    case "js":
      return "javascript";
    case "java":
      return "java";
    case "py":
      return "python";
    case "cpp":
    case "cc":
    case "cxx":
      return "cpp";
    case "c":
      return "c";
    case "go":
      return "go";
    default:
      return "txt";
  }
}

export function isValidGitUrl(url: string): boolean {
  const gitUrlRegex = /^(git|https?):\/\/[^\s/$.?#].[^\s]*$/;
  return gitUrlRegex.test(url);
}

export async function processFolder(
  folderPath: string,
  userId: string,
  files: FileData[] = [],
  basePath: string = folderPath,
  parentId: string = "",
): Promise<FileData[]> {
  try {
    const folderContents = fs.readdirSync(folderPath, { withFileTypes: true });

    for (const item of folderContents) {
      if (item.name === ".git") {
        continue;
      }

      const itemPath = path.join(folderPath, item.name);
      const relativePath = path.relative(basePath, itemPath);
      const itemId = randomUUID();
      if (item.isDirectory()) {
        files.push({
          id: itemId,
          name: item.name,
          type: "folder",
          parentId: parentId ? parentId : undefined,
        });

        await processFolder(itemPath, userId, files, basePath, itemId);
      } else if (item.isFile()) {
        const content = fs.readFileSync(itemPath, "utf8").replace(/\x00/g, " ");
        const fileExtension = path.extname(item.name).slice(1);
        const itemId = randomUUID();

        let lang = getLangName(fileExtension);
        files.push({
          id: itemId,
          name: item.name,
          type: "file",
          content: content,
          lang: lang,
          parentId: parentId ? parentId : undefined,
        });
      }
    }

    return files;
  } catch (error: any) {
    console.error("Error processing folder:", error);
    return files;
  }
}

export async function deleteFolderRecursive(folderPath: string) {
  if (fs.existsSync(folderPath)) {
    fs.rmSync(folderPath, {
      recursive: true,
      force: true,
    });
  }
}

export async function executeGitClone(
  repoUrl: string,
  folderPath: string,
): Promise<void> {
  return new Promise((resolve, reject) => {
    exec(`git clone ${repoUrl} ${folderPath}`, (err, stdout, stderr) => {
      if (err) {
        console.error("Failed to clone:", stderr);
        reject(new Error("Failed to clone repository"));
      } else {
        resolve();
      }
    });
  });
}
