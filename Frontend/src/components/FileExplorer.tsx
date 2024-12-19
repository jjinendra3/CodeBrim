import React from "react";
import { ChevronRight, ChevronDown, File, Folder } from "lucide-react";

interface File {
  name: string;
  content: string;
  type: "file" | "folder";
  children?: File[];
}

interface FileExplorerProps {
  files: File[];
  onFileSelect: (file: File) => void;
  selectedFile: File;
}

export function FileExplorer({
  files,
  onFileSelect,
  selectedFile,
}: FileExplorerProps) {
  const renderFile = (file: File) => {
    if (file.type === "folder") {
      return (
        <details key={file.name} className="ml-4 text-white">
          <summary className="flex items-center cursor-pointer py-1">
            <ChevronRight className="w-4 h-4 mr-1" />
            <Folder className="w-4 h-4 mr-2" />
            {file.name}
          </summary>
          {file.children?.map(renderFile)}
        </details>
      );
    } else {
      return (
        <div
          key={file.name}
          className={`${selectedFile.name === file.name ? "bg-gray-200 bg-opacity-50 rounded-md" : ""} flex items-center ml-8 cursor-pointer text-white p-1`}
          onClick={() => onFileSelect(file)}
        >
          <File className="w-4 h-4 mr-2" />
          {file.name}
        </div>
      );
    }
  };

  return <div className="p-1">{files.map(renderFile)}</div>;
}
