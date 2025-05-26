"use client";

import { useState, useEffect } from "react";
import {
  ChevronRight,
  ChevronDown,
  FileText,
  Trash,
  FilePlus,
  FolderPlus,
} from "lucide-react";
import { cn, supportedLanguages } from "@/lib/utils";
import { useCodeStore } from "@/lib/codeStore";
import { File } from "@/type";
import AddFileModal from "../Modals/AddFileModal";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";

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
    setExpandedFolders(prev => {
      const newExpandedFolders = new Set(prev);
      if (newExpandedFolders.has(folderId)) {
        newExpandedFolders.delete(folderId);
      } else {
        newExpandedFolders.add(folderId);
      }
      return newExpandedFolders;
    });
  };

  const handleFileClick = (fileId: string) => {
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
    if (!extension || !supportedLanguages.includes(extension)) {
      return <FileText size={16} />;
    }

    return (
      <Image
        src={`/languageIcon/${extension}.svg`}
        alt={extension ?? "Language Icon"}
        width={16}
        height={16}
      />
    );
  };

  const handleCreateNewItem = async () => {
    if (!newItemName) return;

    const newItemId = `new-${Date.now()}`;

    const newItem: File = {
      id: newItemId,
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
          ? (() => {
              const supportedLangs = [
                "go",
                "java",
                "cpp",
                "c",
                "js",
                "py",
                "python",
              ];
              const extension = newItemName.includes(".")
                ? newItemName.split(".").pop()?.toLowerCase() ?? ""
                : "";
              return supportedLangs.includes(extension) ? extension : "txt";
            })()
          : null,
      content: newItemType === "file" ? "" : undefined,
      children: newItemType === "folder" ? [] : undefined,
      userId: "",
      datetime: new Date(),
    };

    try {
      const response = await addFile(newItem);

      const finalId = response?.id || newItemId;

      const newItemWithId = {
        ...newItem,
        id: finalId,
      };

      setFiles([...files, newItemWithId]);

      if (currentParentId) {
        setExpandedFolders(prev => {
          const newSet = new Set(prev);
          newSet.add(currentParentId);
          return newSet;
        });
      }

      if (newItemType === "folder") {
        setExpandedFolders(prev => {
          const newSet = new Set(prev);
          newSet.add(finalId);
          return newSet;
        });
      }

      setIsCreatingItem(false);
      setNewItemName("");
    } catch (error) {
      console.error("Failed to add item:", error);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
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

        const idsToRemove = [
          itemToRemoveId,
          ...getDescendantIds(itemToRemoveId),
        ];

        return allFiles.filter(file => !idsToRemove.includes(file.id));
      };

      const updatedFiles = findAndRemoveItems(files, itemId);
      setFiles(updatedFiles);

      setExpandedFolders(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });

      if (selectedFile === itemId) {
        setSelectedFile(null);
      }
    } catch (error) {
      console.error("Failed to delete item:", error);
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

      setFiles(
        files.map((file: File) =>
          file.id === draggedId ? { ...file, parentId: targetFolderId } : file,
        ),
      );

      setExpandedFolders(prev => {
        const newSet = new Set(prev);
        newSet.add(targetFolderId);
        return newSet;
      });
    } catch (error) {
      console.error("Failed to update file parent:", error);
    }
  };

  const renderFileTree = (items: File[], level = 0) => {
    return items.map(item => (
      <div key={item.id}>
        <div
          className={cn(
            "flex items-center w-full cursor-pointer text-sm rounded-sm transition-colors",
            "hover:bg-[#2a2d2e]",
            fileId === item.id && "bg-[#37373d]",
            dragOverItem === item.id &&
              "bg-[#3e3e42] border border-dashed border-[#007fd4]",
          )}
          style={{
            paddingLeft: `${level * 12 + 8}px`,
            paddingTop: "4px",
            paddingBottom: "4px",
            paddingRight: "8px",
          }}
          onClick={e => {
            e.stopPropagation();
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
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-1 min-w-0">
              <span
                className={cn(
                  "flex items-center",
                  item.type === "folder" ? "text-yellow-400" : "text-gray-300",
                )}
              >
                <span className="w-4 flex justify-center items-center flex-shrink-0">
                  {getFileIcon(item)}
                </span>
              </span>
              <span className="truncate text-gray-200 text-sm">
                {item.name}
              </span>
            </div>

            <button
              title="Delete"
              aria-label="Delete"
              className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300 p-1"
              onClick={async e => {
                e.stopPropagation();
                await handleDeleteItem(item.id);
              }}
            >
              <Trash size={12} />
            </button>
          </div>
        </div>

        {item.type === "folder" && expandedFolders.has(item.id) && (
          <div
            className={cn(
              "ml-[16px] border-l border-[#2f2f2f]",
              level > 0 ? "mt-0.5" : "",
            )}
          >
            {item.children && item.children.length > 0 ? (
              renderFileTree(item.children, level + 1)
            ) : (
              <div className="py-1 px-3 text-gray-500 text-xs italic">
                Empty folder
              </div>
            )}
          </div>
        )}
      </div>
    ));
  };
  return (
    <div className="w-full flex-grow flex flex-col">
      <div className="p-2 text-xs font-semibold uppercase tracking-wider text-gray-400 flex justify-between items-center">
        Explorer
        <div className="flex gap-2 justify-center items-center">
          <FilePlus
            size={18}
            className="cursor-pointer hover:text-blue-400"
            onClick={() => {
              setCurrentParentId(null);
              setNewItemType("file");
              setIsCreatingItem(true);
            }}
          />
          <FolderPlus
            size={18}
            className="cursor-pointer hover:text-yellow-400"
            onClick={() => {
              setCurrentParentId(null);
              setNewItemType("folder");
              setIsCreatingItem(true);
            }}
          />
        </div>
      </div>
      <div className="flex flex-col overflow-auto">
        {renderFileTree(organizedFiles)}
      </div>
      <AddFileModal
        isCreatingItem={isCreatingItem}
        setIsCreatingItem={setIsCreatingItem}
        newItemType={newItemType}
        newItemName={newItemName}
        setNewItemName={setNewItemName}
        handleCreateNewItem={handleCreateNewItem}
        parentId={currentParentId}
      />
    </div>
  );
}
