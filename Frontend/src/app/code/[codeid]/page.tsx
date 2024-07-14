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
  FaRunning,
  FaSave,
  FaClone,
  FaLock,
  FaLockOpen,
  FaHome,
  FaAlignJustify,
} from "react-icons/fa";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { IoMdGitBranch } from "react-icons/io";
import { MdOutlineOutput, MdOutlineInput } from "react-icons/md";
import { AiFillFileAdd } from "react-icons/ai";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

const Form = () => {
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
  const [fileindex, setfileindex] = useState(0); //used to tell which file is highlighted and active
  function handleCodeChange(value: string | undefined, event: any) {
    if (value) {
      context.setFiles((prevFiles: any) => {
        const updatedFiles = [...prevFiles];
        updatedFiles[fileindex].content = value;
        return updatedFiles;
      });
    }
  }
  function handlestdinChange(value: string | undefined, event: any) {
    if (value) {
      context.setFiles((prevFiles: any) => {
        const updatedFiles = [...prevFiles];
        updatedFiles[fileindex].stdin = value;
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
          {
            if (response.user.password !== null) {
              context.seteditable(false);
              setpwdmod(true);
            }
          }
        }
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          setfileindex={setfileindex}
        />
      )}

      <ResizablePanelGroup
        direction={!isTabBigger ? "vertical" : "horizontal"}
        className="min-h-screen overflow-hidden"
      >
        <ResizablePanel defaultSize={isTabBigger ? 10 : 20}>
          <h1 className="text-3xl font-semibold text-center font-serif text-white mt-4">
            CodeBrim
          </h1>
          <h6 className="text-sm font-semibold text-center font-mono text-white mb-2">
            Compiler on the Go!
          </h6>
          <div
            className={`flex ${isTabBigger ? "flex-col" : "flex-row"} justify-center items-center text-sm w-full`}
          >
            <Button
              onClick={context.goHome}
              className="w-24 space-x-1 font-bold mb-2"
            >
              <FaHome />
              <div className="pt-1">Home</div>
            </Button>

            {context.editable && (
              <Button
                className={`${isTabBigger ? "bg-white text-black rounded-lg font-bold h-7 space-x-1 mt-2 md:w-32 sm:w-full" : "w-24 space-x-1 font-bold mb-2 ml-4"}`}
                onClick={async () => {
                  setfilemod(true);
                }}
              >
                <div>Add File</div>
                {isTabBigger && <AiFillFileAdd />}
              </Button>
            )}
          </div>
          <div className="flex-row mt-4 space-y-4 h-96 overflow-y-auto">
            {context.files.length !== 0 &&
              context.files.map((file: any) => {
                return (
                  <div className="flex p-1 text-white w-full" key={file.id}>
                    <Button
                      className={`${file.id === context.files[fileindex].id ? "border-2 border-white" : ""} flex-1 truncate px-1 rounded-md h-8 w-full`}
                      onClick={() => {
                        for (let i = 0; i < context.files.length; i++) {
                          if (file.id === context.files[i].id) {
                            setfileindex(i);
                            break;
                          }
                        }
                      }}
                    >
                      {file.filename}
                    </Button>
                  </div>
                );
              })}
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={50} className="border-l-2 z-10">
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel defaultSize={75} className="border-b-2">
              <div className="h-8 w-full flex justify-between items-center ">
                <div className="font-bold font-mono text-sm text-white pl-4 ">
                  Language:{" "}
                  {context.files[fileindex]?.lang
                    ? context.files[fileindex].lang.toUpperCase()
                    : ""}
                </div>
                <div className="pr-8">
                  {!isTabBigger ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger className="text-center px-1 text-white font-bold h-6 space-x-1">
                        <FaAlignJustify />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuLabel
                          onClick={async () => {
                            await context.coderunner(fileindex);
                          }}
                        >
                          Run
                        </DropdownMenuLabel>
                        {!context.editable && (
                          <DropdownMenuItem
                            onClick={(): void => {
                              setpwdflag(false);
                              setpwdmod(true);
                            }}
                          >
                            Unlock
                          </DropdownMenuItem>
                        )}
                        {context.newproject && (
                          <DropdownMenuItem
                            onClick={(): void => {
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
                        <DropdownMenuItem
                          onClick={(): void => {
                            setmod(true);
                          }}
                        >
                          Git Controls
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={context.saver}>
                          Save
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <div className="space-x-4 pr-8 flex">
                      {!context.editable && (
                        <Button
                          className="bg-blue-800 text-center px-1 text-white font-bold h-6 space-x-1"
                          onClick={() => {
                            setpwdflag(false);
                            setpwdmod(true);
                          }}
                        >
                          <div>Unlock</div>
                          <FaLockOpen />
                        </Button>
                      )}
                      {context.newproject && (
                        <Button
                          className="bg-blue-800 text-center px-1 text-white font-bold h-6 space-x-1"
                          onClick={() => {
                            setpwdflag(true);
                            setpwdmod(true);
                          }}
                        >
                          <div>Lock</div>
                          <FaLock />
                        </Button>
                      )}
                      <Button
                        className="bg-blue-800 text-center px-1 text-white font-bold h-6 space-x-1"
                        onClick={context.snipclone}
                      >
                        <div>Copy Files</div>
                        <FaClone />
                      </Button>
                      <Button
                        className="bg-blue-800 text-center px-1 text-white font-bold h-6 space-x-1"
                        onClick={() => {
                          setmod(true);
                        }}
                      >
                        <div>Git Controls</div>
                        <IoMdGitBranch />
                      </Button>
                      <Button
                        className="bg-blue-800 text-center px-1 text-white font-bold h-6 space-x-1"
                        onClick={context.saver}
                      >
                        <div>Save</div>
                        <FaSave />
                      </Button>
                      <Button
                        className="bg-blue-800 text-center px-1 text-white font-bold h-6 w-16 space-x-1"
                        onClick={async () => {
                          await context.coderunner(fileindex);
                        }}
                      >
                        <div>Run</div> <FaRunning />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <Editor
                theme="vs-dark"
                value={context.files[fileindex].content}
                language={context.files[fileindex].lang}
                onMount={handleEditorDidMount}
                onChange={handleCodeChange}
                options={{ readOnly: !context.editable }}
              />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={25}>
              <ResizablePanelGroup direction="horizontal">
                <ResizablePanel>
                  <div className="space-x-2 flex flex-row justify-center px-8">
                    <div className="py-1 rounded-sm p-2 space-x-1 flex flex-row items-center">
                      <div className="text-blue-500 font-bold">INPUT</div>
                      <MdOutlineInput className="text-blue-500" />
                    </div>
                  </div>
                  <Editor
                    theme="vs-dark"
                    onMount={handlestdDidMount}
                    value={context.files[fileindex].stdin}
                    onChange={handlestdinChange}
                  />
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel>
                  <div className="space-x-2 flex flex-row justify-center px-8">
                    <div className="py-1 rounded-sm p-2 space-x-1 flex flex-row items-center">
                      <div className="text-green-500 font-bold">OUTPUT</div>
                      <MdOutlineOutput className="text-green-500" />
                    </div>
                  </div>
                  <Editor
                    theme="vs-dark"
                    onMount={handlestdDidMount}
                    value={context.files[fileindex].stdout}
                    options={{
                      readOnly: true,
                    }}
                  />
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </Context.Provider>
  );
};

export default Form;
