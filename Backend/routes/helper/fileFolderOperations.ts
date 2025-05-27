import archiver from "archiver";
import fs from "fs";
import path from "path";
import { FileData } from "../../interface/fileData";
import { randomUUID } from "crypto";

export async function createZipFromFolder(
  folderPath: string,
  outputZipPath: any,
) {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outputZipPath);
    const archive = archiver("zip", {
      zlib: { level: 9 },
    });

    output.on("close", () => {
      console.log(`ZIP created: ${archive.pointer()} total bytes`);
      resolve(outputZipPath);
    });

    archive.on("error", err => {
      reject(err);
    });

    archive.pipe(output);

    archive.directory(folderPath, false);

    archive.finalize();
  });
}

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

export async function createFolderStructureRecursive(
  files: any[],
  basePath: string,
) {
  if (!fs.existsSync(basePath)) {
    fs.mkdirSync(basePath, { recursive: true });
  }
  const rootFiles = files.filter(file => !file.parentId);

  function createFileOrFolder(file: any, currentPath: string) {
    const fullPath = path.join(currentPath, file.name);

    if (file.type === "folder") {
      fs.mkdirSync(fullPath, { recursive: true });
      const children = files.filter(f => f.parentId === file.id);
      for (const child of children) {
        createFileOrFolder(child, fullPath);
      }
    } else {
      const content = file.content || "";
      fs.writeFileSync(fullPath, content, "utf8");
    }
  }
  for (const rootFile of rootFiles) {
    createFileOrFolder(rootFile, basePath);
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
