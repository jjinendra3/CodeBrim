"use client";
import React, { useState, useRef, useContext, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Editor from "@monaco-editor/react";
import Context from "@/ContextAPI";
import Modal from "@/components/Modal";
import FileModal from "@/components/FileModal";
import PasswordModal from "@/components/PasswordModal";
import { useBreakpoint } from "@/use-breakpoint";
import { type File } from "@/Data";
import { useRouter, usePathname } from "next/navigation";
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
import FeedbackModal from "@/components/FeedbackModal";
import {
  Play,
  Lock,
  Unlock,
  Copy,
  GitBranch,
  Save,
  Menu,
} from "lucide-react";
import Loader from "@/components/Loader";
export default function Form() {
  const router = useRouter();
  const pathname = usePathname();
  const projectId = pathname.split("/")[2];
  const fileId = pathname.split("/")[3];
  const [presentFile, setPresentFile] = useState<File | null>(null);
  // const isTabBigger = useBreakpoint("md");
  const context = useContext(Context);
  const editorRef = useRef<any>(null);
  const stdinRef = useRef<any>(null);
  const [pwdmod, setpwdmod] = useState(false);
  const [pwdflag, setpwdflag] = useState(false);
  const [mod, setmod] = useState<boolean>(false);
  const [gitcontrols, setgitcontrols] = useState<any>({
    repolink: "",
    commitmsg: "commit",
    branch: "master",
    pan: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      const response = await context.getFileData(fileId);
      if (response.success === 1) {
        setPresentFile(response.file);
      } else {
        router.push("/not-found");
      }
    };
    fetchData();
    //eslint-disable-next-line
  }, []);

  useEffect(() => {
    const handleKeyDown = async (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "s") {
        event.preventDefault();
        if (presentFile) {
          await context.saver(presentFile);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
    //eslint-disable-next-line
  }, []);

  useEffect(() => {
    const handleStdOutChange = () => {
      if (context.payload && context.payload.fileId === fileId) {
        setPresentFile((prev: File | null) => {
          if (prev) {
            return { ...prev, stdout: context.payload.stdout };
          }
          return prev;
        });
        context.setPayload(null);
      }
    };
    handleStdOutChange();
    //eslint-disable-next-line
  }, [context.payload]);
  
  function handleCodeChange(value: string | undefined, event: any) {
    if (value) {
      setPresentFile((prev: File | null) => {
        if (prev) {
          return { ...prev, content: value };
        }
        return prev;
      });
    }
  }

  function handlestdinChange(value: string | undefined, event: any) {
    if (value) {
      setPresentFile((prev: File | null) => {
        if (prev) {
          return { ...prev, stdin: value };
        }
        return prev;
      });
    }
  }
  function handlestdDidMount(stdin: any, monaco: any) {
    stdinRef.current = stdin;
  }

  function handleEditorDidMount(editor: any, monaco: any) {
    editorRef.current = editor;
  }

  return (
    <div className="w-5/6 overflow-hidden">
      {pwdmod && <PasswordModal setpwdmod={setpwdmod} pwdflag={pwdflag} />}
      {mod && (
        <Modal
          setmod={setmod}
          gitcontrols={gitcontrols}
          setgitcontrols={setgitcontrols}
          context={context}
        />
      )}
      <ResizablePanelGroup direction="vertical">
        <ResizablePanel defaultSize={75}>
          <div className="h-8 flex justify-between items-center px-4 bg-gray-800 text-white">
            <div className="flex flex-row gap-2 items-center ">
             
              <FeedbackModal context={context} />
              <h2 className="font-semibold text-xs">
                Language: {presentFile?.lang.toUpperCase()}
              </h2>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs">
                {context.saving ? "Saving..." : "Code Saved!"}
              </span>
              <Save
                className={`h-3 w-3 ${context.saving ? "animate-pulse" : ""}`}
              />
            </div>
            {/* {!isTabBigger ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => context.coderunner(presentFile)}
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
                  {context.newProjectBool && (
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
            ) : ( */}
              <div className="flex space-x-2">
                {/* {!context.editable && (
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
                {context.newProjectBool && (
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
                )} */}
                <Button variant="default" size="xs" onClick={context.snipclone}>
                  <Copy className="mr-2 h-4 w-4" /> Copy Files
                </Button>
                <Button
                  variant="default"
                  size="xs"
                  onClick={() => setmod(true)}
                >
                  <GitBranch className="mr-2 h-4 w-4" /> Git Controls
                </Button>
                <Button
                  variant="default"
                  size="xs"
                  onClick={() => context.saver(presentFile)}
                >
                  <Save className="mr-2 h-4 w-4" /> Save
                </Button>
                <Button
                  variant="default"
                  size="xs"
                  onClick={() => context.coderunner(presentFile)}
                >
                  <Play className="mr-1 h-4 w-4" /> Run
                </Button>
              </div>
            {/* )} */}
          </div>
          <Editor
            theme="vs-dark"
            value={presentFile?.content}
            language={presentFile?.lang}
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
              <div className="h-6 flex px-2 bg-gray-800">
                <div className="float-left text-gray-300 font-mono">Input</div>
              </div>
              <Editor
                theme="vs-dark"
                onMount={handlestdDidMount}
                value={presentFile?.stdin}
                onChange={handlestdinChange}
                className="border-t border-gray-700"
              />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel>
              {!(context.queued.fileId === fileId && context.queued.loading) ? (
                <>
                  <div className="h-6 flex px-2 bg-gray-800">
                    <div className="float-left text-gray-300 font-mono">
                      Output
                    </div>
                  </div>
                  <Editor
                    theme="vs-dark"
                    onMount={handlestdDidMount}
                    value={presentFile?.stdout}
                    options={{ readOnly: true }}
                    className="border-t border-gray-700"
                  />
                </>
              ) : (
                <Loader />
              )}
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
