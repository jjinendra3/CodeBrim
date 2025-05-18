"use client";

import { DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FileJson,
  FileText,
  FileCode,
  FileType,
  FileCog,
  FileImage,
  MoreVertical,
  Trash,
  Edit,
  Copy,
  FolderPlus,
  FilePlus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCodeStore } from "@/lib/codeStore";
import { File } from "@/type";
import AddFileModal from "./AddFileModal";
import { usePathname, useRouter } from "next/navigation";

export function FileExplorer() {
  const router = useRouter();
  const usePathName = usePathname();
  const fileId = usePathName.split("/")[3];
  const { id, files, setFiles, addFile, deleteFile, updateFile } =
    useCodeStore();
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(),
  );
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [isCreatingItem, setIsCreatingItem] = useState(false);
  const [newItemType, setNewItemType] = useState<"file" | "folder">("file");
  const [newItemName, setNewItemName] = useState("");
  const [currentParentId, setCurrentParentId] = useState<string | null>(null);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOverItem, setDragOverItem] = useState<string | null>(null);
  const [organizedFiles, setOrganizedFiles] = useState<File[]>([]);

  useEffect(() => {
    const buildFileTree = (flatFiles: File[]) => {
      const fileMap: Record<string, File> = {};
      const rootFiles: File[] = [];

      flatFiles.forEach(file => {
        fileMap[file.id] = {
          ...file,
          children: file.type === "folder" ? [] : undefined,
        };
      });

      flatFiles.forEach(file => {
        const fileWithChildren = fileMap[file.id];

        if (file.parentId && fileMap[file.parentId]) {
          if (!fileMap[file.parentId].children) {
            fileMap[file.parentId].children = [];
          }
          fileMap[file.parentId].children!.push(fileWithChildren);
        } else {
          rootFiles.push(fileWithChildren);
        }
      });

      return rootFiles;
    };

    setOrganizedFiles(buildFileTree(files));
  }, [files]);

  const toggleFolder = (folderId: string) => {
    const newExpandedFolders = new Set(expandedFolders);
    if (newExpandedFolders.has(folderId)) {
      newExpandedFolders.delete(folderId);
    } else {
      newExpandedFolders.add(folderId);
    }
    setExpandedFolders(newExpandedFolders);
  };

  const handleFileClick = async (fileId: string) => {
    console.log("File clicked:", fileId);
    router.push(`/code/${id}/${fileId}`);
  };

  const getFileIcon = (file: File) => {
    if (file.type === "folder") {
      return expandedFolders.has(file.id) ? (
        <ChevronDown size={16} />
      ) : (
        <ChevronRight size={16} />
      );
    }

    const extension = file.name.split(".").pop()?.toLowerCase();

    switch (extension) {
      case "json":
        return <FileJson size={16} />;
      case "md":
        return <FileText size={16} />;
      case "ts":
        return <FileCode size={16} className="text-blue-400" />;
      case "tsx":
        return <FileCode size={16} className="text-blue-400" />;
      case "js":
        return <FileCode size={16} className="text-yellow-400" />;
      case "jsx":
        return <FileCode size={16} className="text-yellow-400" />;
      case "css":
        return <FileType size={16} className="text-purple-400" />;
      case "scss":
        return <FileType size={16} className="text-pink-400" />;
      case "html":
        return <FileCode size={16} className="text-orange-400" />;
      case "svg":
      case "png":
      case "jpg":
      case "jpeg":
        return <FileImage size={16} className="text-green-400" />;
      case "config":
        return <FileCog size={16} />;
      default:
        return <FileCode size={16} />;
    }
  };

  const getFileTypeIcon = (file: File) => {
    if (file.type === "folder") {
      return <Folder size={16} className="text-gray-400" />;
    }

    const extension = file.name.split(".").pop()?.toLowerCase();

    switch (extension) {
      case "json":
        return <FileJson size={16} className="text-yellow-300" />;
      case "md":
        return <FileText size={16} className="text-blue-300" />;
      case "ts":
        return <FileCode size={16} className="text-blue-400" />;
      case "tsx":
        return <FileCode size={16} className="text-blue-400" />;
      case "js":
        return <FileCode size={16} className="text-yellow-400" />;
      case "jsx":
        return <FileCode size={16} className="text-yellow-400" />;
      case "css":
        return <FileType size={16} className="text-purple-400" />;
      case "scss":
        return <FileType size={16} className="text-pink-400" />;
      case "html":
        return <FileCode size={16} className="text-orange-400" />;
      case "svg":
      case "png":
      case "jpg":
      case "jpeg":
        return <FileImage size={16} className="text-green-400" />;
      case "config":
        return <FileCog size={16} />;
      default:
        return <FileCode size={16} />;
    }
  };

  const handleCreateNewItem = async () => {
    if (!newItemName) return;

    const newItem: File = {
      id: `new-${Date.now()}`,
      name:
        newItemType === "file"
          ? newItemName.includes(".")
            ? newItemName
            : `${newItemName}.txt`
          : newItemName,
      type: newItemType,
      parentId: currentParentId,
      lang:
        newItemType === "file"
          ? newItemName.includes(".")
            ? newItemName.split(".").pop() ?? "txt"
            : "txt"
          : null,
      content: newItemType === "file" ? "" : null,
      children: newItemType === "folder" ? [] : undefined,
    };

    const response = await addFile(newItem);
    if (!response) {
      console.error("Failed to add file:", newItem);
      return;
    }
    console.log("Response from addFile:", response);

    const newItemWithId = {
      ...newItem,
      id: response.id || newItem.id,
    };

    const updatedFiles = [...files, newItemWithId];
    setFiles(updatedFiles);

    if (newItemType === "folder") {
      setExpandedFolders(
        new Set([...Array.from(expandedFolders), newItemWithId.id]),
      );
    }
    setIsCreatingItem(false);
    setNewItemName("");
  };

  const handleDeleteItem = async (itemId: string) => {
    await deleteFile(itemId);

    const findAndRemoveItems = (
      allFiles: File[],
      itemToRemoveId: string,
    ): File[] => {
      const getDescendantIds = (fileId: string): string[] => {
        const descendants: string[] = [];

        allFiles.forEach(file => {
          if (file.parentId === fileId) {
            descendants.push(file.id);
            descendants.push(...getDescendantIds(file.id));
          }
        });

        return descendants;
      };

      const idsToRemove = [itemToRemoveId, ...getDescendantIds(itemToRemoveId)];

      return allFiles.filter(file => !idsToRemove.includes(file.id));
    };

    const updatedFiles = findAndRemoveItems(files, itemId);
    setFiles(updatedFiles);

    if (selectedFile === itemId) {
      setSelectedFile(null);
    }
  };

  const handleDragDrop = async (draggedId: string, targetFolderId: string) => {
    if (!draggedId || !targetFolderId || draggedId === targetFolderId) return;

    const draggedItem = files.find(file => file.id === draggedId);
    if (!draggedItem) return;

    const isDescendant = (
      parentId: string | null,
      potentialChildId: string,
    ): boolean => {
      if (!parentId) return false;
      if (parentId === potentialChildId) return true;

      const child = files.find(file => file.id === parentId);
      return child && child.parentId
        ? isDescendant(child.parentId, potentialChildId)
        : false;
    };

    if (isDescendant(draggedId, targetFolderId)) return;

    const updatedItem = {
      ...draggedItem,
      parentId: targetFolderId,
    };

    try {
      await updateFile(updatedItem);
      const updatedFiles = files.map(file =>
        file.id === draggedId ? { ...file, parentId: targetFolderId } : file,
      );
      setFiles(updatedFiles);
    } catch (error) {
      console.error("Failed to update file parent:", error);
    }
  };

  const renderFileTree = (items: File[], level = 0) => {
    return items.map(item => (
      <div key={item.id}>
        <ContextMenu>
          <ContextMenuTrigger>
            <div
              className={cn(
                "flex items-center py-1 px-2 text-sm cursor-pointer hover:bg-[#2a2d2e] rounded",
                fileId === item.id && "bg-[#37373d]",
                dragOverItem === item.id &&
                  "bg-[#3e3e42] border border-dashed border-[#007fd4]",
              )}
              style={{ paddingLeft: `${level * 12 + 4}px` }}
              onClick={() => {
                if (item.type === "folder") {
                  toggleFolder(item.id);
                } else {
                  handleFileClick(item.id);
                }
              }}
              draggable
              onDragStart={e => {
                e.stopPropagation();
                setDraggedItem(item.id);
              }}
              onDragOver={e => {
                e.preventDefault();
                e.stopPropagation();
                if (item.type === "folder" && draggedItem !== item.id) {
                  setDragOverItem(item.id);
                }
              }}
              onDragLeave={() => {
                setDragOverItem(null);
              }}
              onDrop={async e => {
                e.preventDefault();
                e.stopPropagation();
                setDragOverItem(null);

                if (
                  draggedItem &&
                  draggedItem !== item.id &&
                  item.type === "folder"
                ) {
                  await handleDragDrop(draggedItem, item.id);
                }

                setDraggedItem(null);
              }}
            >
              <div className="flex items-center">
                {item.type === "folder" && getFileIcon(item)}
                <span className="w-5 flex justify-center mr-1">
                  {getFileTypeIcon(item)}
                </span>
                <span className="truncate">{item.name}</span>
              </div>
              <div className="ml-auto opacity-0 group-hover:opacity-100">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <MoreVertical size={14} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    {item.type === "folder" && (
                      <>
                        <DropdownMenuItem
                          onClick={e => {
                            e.stopPropagation();
                            setCurrentParentId(item.id);
                            setNewItemType("file");
                            setIsCreatingItem(true);
                          }}
                        >
                          <FilePlus size={14} className="mr-2" />
                          New File
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={e => {
                            e.stopPropagation();
                            setCurrentParentId(item.id);
                            setNewItemType("folder");
                            setIsCreatingItem(true);
                          }}
                        >
                          <FolderPlus size={14} className="mr-2" />
                          New Folder
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}

                    <DropdownMenuItem
                      onClick={async e => {
                        e.stopPropagation();
                        await handleDeleteItem(item.id);
                      }}
                      className="text-red-500"
                    >
                      <Trash size={14} className="mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </ContextMenuTrigger>
          <ContextMenuContent className="w-48">
            {item.type === "folder" && (
              <>
                <ContextMenuItem
                  onClick={() => {
                    setCurrentParentId(item.id);
                    setNewItemType("file");
                    setIsCreatingItem(true);
                  }}
                >
                  <FilePlus size={14} className="mr-2" />
                  New File
                </ContextMenuItem>
                <ContextMenuItem
                  onClick={() => {
                    setCurrentParentId(item.id);
                    setNewItemType("folder");
                    setIsCreatingItem(true);
                  }}
                >
                  <FolderPlus size={14} className="mr-2" />
                  New Folder
                </ContextMenuItem>
                <ContextMenuSeparator />
              </>
            )}

            <ContextMenuSeparator />
            <ContextMenuItem
              onClick={async () => await handleDeleteItem(item.id)}
              className="text-red-500"
            >
              <Trash size={14} className="mr-2" />
              Delete
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>

        {item.type === "folder" &&
          item.children &&
          expandedFolders.has(item.id) &&
          renderFileTree(item.children, level + 1)}
      </div>
    ));
  };

  return (
    <div className="w-full h-full border-r flex flex-col">
      <div className="p-2 text-xs font-semibold uppercase tracking-wider text-gray-400 flex justify-between items-center">
        Explorer
        <div className="flex gap-2 justify-center items-center">
          <FilePlus
            size={18}
            onClick={() => {
              setCurrentParentId(null);
              setNewItemType("file");
              setIsCreatingItem(true);
            }}
          />
          <FolderPlus
            size={18}
            onClick={() => {
              setCurrentParentId(null);
              setNewItemType("folder");
              setIsCreatingItem(true);
            }}
          />
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        {renderFileTree(organizedFiles)}
      </div>
      <AddFileModal
        isCreatingItem={isCreatingItem}
        setIsCreatingItem={setIsCreatingItem}
        newItemType={newItemType}
        newItemName={newItemName}
        setNewItemName={setNewItemName}
        handleCreateNewItem={handleCreateNewItem}
      />
    </div>
  );
}
