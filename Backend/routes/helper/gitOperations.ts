import { exec } from "child_process";
import { FileData } from "../../interface/fileData";
import * as fs from "fs";
import * as path from "path";
import { randomUUID } from "crypto";

export function isValidGitUrl(url: string): boolean {
  const gitUrlRegex = /^(git|https?):\/\/[^\s/$.?#].[^\s]*$/;
  return gitUrlRegex.test(url);
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
