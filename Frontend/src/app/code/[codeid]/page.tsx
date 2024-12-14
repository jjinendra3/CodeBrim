"use client";
import React, { useState, useRef, useContext, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Editor from "@monaco-editor/react";
import Context from "@/ContextAPI";
import { usePathname } from "next/navigation";
import Modal from "@/components/Modal";
import FileModal from "@/components/FileModal";
import PasswordModal from "@/components/PasswordModal";
import { useBreakpoint } from "@/use-breakpoint";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Home,
  FilePlus,
  Play,
  Lock,
  Unlock,
  Copy,
  GitBranch,
  Save,
  Menu,
  FolderInput,
  FolderOutput,
} from "lucide-react";
import { useSocket } from "../../../../lib/socket";

export default function Form() {
  const [fileId, setFileId] = useState<string | null>(null);
  const [fileIndex, setFileIndex] = useState(0);
  const socket = useSocket();

  useEffect(() => {
    function handleEvent(payload: any) {
      console.log(payload);
      context.files.find((file: any, index: number) => {
        if (file.id === payload.fileId) {
          context.setFiles((prevFiles: any) => {
            const updatedFiles = [...prevFiles];
            updatedFiles[file.index].stdout = payload.stdout;
            return updatedFiles;
          });
        }
      });
    }
    if (socket) {
      socket.on("codeResult", handleEvent);
    }
  }, [socket]);

  const isTabBigger = useBreakpoint("md");
  const context = useContext(Context);
  const editorRef = useRef<any>(null);
  const stdinRef = useRef<any>(null);
  const [pwdmod, setpwdmod] = useState(false);
  const [pwdflag, setpwdflag] = useState(false);
  const [mod, setmod] = useState<boolean>(false);
  const [filemod, setfilemod] = useState<boolean>(false);
  const [gitcontrols, setgitcontrols] = useState<any>({
    repolink: "",
    commitmsg: "commit",
    branch: "master",
    pan: "",
  });
  const pathname = usePathname();

  function handleCodeChange(value: string | undefined, event: any) {
    if (value) {
      context.setFiles((prevFiles: any) => {
        const updatedFiles = [...prevFiles];
        updatedFiles[fileIndex].content = value;
        return updatedFiles;
      });
    }
  }

  function handlestdinChange(value: string | undefined, event: any) {
    if (value) {
      context.setFiles((prevFiles: any) => {
        const updatedFiles = [...prevFiles];
        updatedFiles[fileIndex].stdin = value;
        return updatedFiles;
      });
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      if (!context.newproject) {
        const str = pathname.slice(-5);
        const response = await context.code_getter(str);

        if (response.success === 1) {
          setFileId(response.user.files[0].id);
          if (response.user.password !== null) {
            context.seteditable(false);
            setpwdmod(true);
          }
        }
      }
    };

    fetchData();
  }, []);

  function handlestdDidMount(stdin: any, monaco: any) {
    stdinRef.current = stdin;
  }

  function handleEditorDidMount(editor: any, monaco: any) {
    editorRef.current = editor;
  }

  return (
    <Context.Provider value={context}>
      {pwdmod && <PasswordModal setpwdmod={setpwdmod} pwdflag={pwdflag} />}
      {mod && (
        <Modal
          setmod={setmod}
          gitcontrols={gitcontrols}
          setgitcontrols={setgitcontrols}
          context={context}
        />
      )}
      {filemod && (
        <FileModal
          setfilemod={setfilemod}
          context={context}
          setfileindex={setFileIndex}
        />
      )}

      <ResizablePanelGroup
        direction={!isTabBigger ? "vertical" : "horizontal"}
        className="min-h-screen bg-gray-900"
      >
        <ResizablePanel
          defaultSize={isTabBigger ? 15 : 20}
          className="bg-gray-800"
        >
          <div className="p-4 space-y-4">
            <h1
              className="text-3xl font-bold text-center text-white cursor-pointer"
              onClick={context.goHome}
            >
              CodeBrim
            </h1>
            <p className="text-sm text-center text-gray-400">
              Compiler on the Go!
            </p>
            <div
              className={`flex ${isTabBigger ? "flex-col" : "flex-row"} justify-center items-center gap-2`}
            >
              <Button
                onClick={context.goHome}
                variant="outline"
                className="w-full"
              >
                <Home className="mr-2 h-4 w-4" /> Home
              </Button>
              {context.editable && (
                <Button
                  onClick={() => setfilemod(true)}
                  variant="outline"
                  className="w-full"
                >
                  <FilePlus className="mr-2 h-4 w-4" /> Add File
                </Button>
              )}
            </div>
          </div>
          <div className="mt-4 space-y-2 h-[calc(100vh-200px)] overflow-y-auto px-4">
            {context.files.map((file: any, index: number) => (
              <Button
                key={file.id}
                variant={
                  file.id === context.files[fileIndex].id
                    ? "ghost"
                    : "secondary"
                }
                className="w-full justify-start"
                onClick={() => {
                  setFileIndex(index);
                  setFileId(context.files[index].id);
                }}
              >
                <h1
                  className={`${file.id === context.files[fileIndex].id ? "text-white" : "text-black"}`}
                >
                  {file.filename}
                </h1>
              </Button>
            ))}
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={85} className="bg-gray-900">
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel defaultSize={75}>
              <div className="h-8 flex justify-between items-center px-4 bg-gray-800 text-white">
                <h2 className="font-semibold text-xs">
                  Language: {context.files[fileIndex]?.lang?.toUpperCase()}
                </h2>
                <div className="flex items-center space-x-2">
                  <span className="text-xs">
                    {context.saving ? "Saving..." : "Code Saved!"}
                  </span>
                  <Save
                    className={`h-3 w-3 ${context.saving ? "animate-pulse" : ""}`}
                  />
                </div>
                {!isTabBigger ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Menu className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => context.coderunner(fileIndex)}
                      >
                        Run
                      </DropdownMenuItem>
                      {!context.editable && (
                        <DropdownMenuItem
                          onClick={() => {
                            setpwdflag(false);
                            setpwdmod(true);
                          }}
                        >
                          Unlock
                        </DropdownMenuItem>
                      )}
                      {context.newproject && (
                        <DropdownMenuItem
                          onClick={() => {
                            setpwdflag(true);
                            setpwdmod(true);
                          }}
                        >
                          Lock
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={context.snipclone}>
                        Copy Files
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setmod(true)}>
                        Git Controls
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={context.saver}>
                        Save
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <div className="flex space-x-2">
                    {!context.editable && (
                      <Button
                        variant="default"
                        size="xs"
                        onClick={() => {
                          setpwdflag(false);
                          setpwdmod(true);
                        }}
                      >
                        <Unlock className="mr-2 h-4 w-4" /> Unlock
                      </Button>
                    )}
                    {context.newproject && (
                      <Button
                        variant="default"
                        size="xs"
                        onClick={() => {
                          setpwdflag(true);
                          setpwdmod(true);
                        }}
                      >
                        <Lock className="mr-2 h-4 w-4" /> Lock
                      </Button>
                    )}
                    <Button
                      variant="default"
                      size="xs"
                      onClick={context.snipclone}
                    >
                      <Copy className="mr-2 h-4 w-4" /> Copy Files
                    </Button>
                    <Button
                      variant="default"
                      size="xs"
                      onClick={() => setmod(true)}
                    >
                      <GitBranch className="mr-2 h-4 w-4" /> Git Controls
                    </Button>
                    <Button variant="default" size="xs" onClick={context.saver}>
                      <Save className="mr-2 h-4 w-4" /> Save
                    </Button>
                    <Button
                      variant="default"
                      size="xs"
                      onClick={() => context.coderunner(fileIndex)}
                    >
                      <Play className="mr-1 h-4 w-4" /> Run
                    </Button>
                  </div>
                )}
              </div>
              <Editor
                theme="vs-dark"
                value={context.files[fileIndex].content}
                language={context.files[fileIndex].lang}
                onMount={handleEditorDidMount}
                onChange={handleCodeChange}
                options={{ readOnly: !context.editable }}
                className="border-t border-gray-700"
              />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={25}>
              <ResizablePanelGroup direction="horizontal">
                <ResizablePanel>
                  <div className="h-8 flex items-center justify-center bg-gray-800 text-blue-400">
                    <FolderInput className="mr-2 h-4 w-4" /> INPUT
                  </div>
                  <Editor
                    theme="vs-dark"
                    onMount={handlestdDidMount}
                    value={context.files[fileIndex].stdin}
                    onChange={handlestdinChange}
                    className="border-t border-gray-700"
                  />
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel>
                  <div className="h-8 flex items-center justify-center bg-gray-800 text-green-400">
                    <FolderOutput className="mr-2 h-4 w-4" /> OUTPUT
                  </div>
                  <Editor
                    theme="vs-dark"
                    onMount={handlestdDidMount}
                    value={context.files[fileIndex].stdout}
                    options={{ readOnly: true }}
                    className="border-t border-gray-700"
                  />
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </Context.Provider>
  );
}
