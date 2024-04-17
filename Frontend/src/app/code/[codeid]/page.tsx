"use client";
import React, { useState, useRef, useContext, useEffect } from "react";
import Editor from "@monaco-editor/react";
import Context from "@/ContextAPI";
import { usePathname } from "next/navigation";
import Modal from "@/components/Modal";
import FileModal from "@/components/FileModal";
const Form = () => {
  const context = useContext(Context);
  const editorRef = useRef<any>(null);
  const stdinRef = useRef<any>(null);
  const [std, setstd] = useState<{
    id: string;
    std: boolean;
  }>({ id: "", std: true });

  const [mod, setmod] = useState<boolean>(false);
  const [filemod, setfilemod] = useState<boolean>(false);
  const [gitcontrols, setgitcontrols] = useState<any>({
    repolink: "",
    commitmsg: "commit",
    branch: "main",
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
  async function ok(pathname: string) {
    const response = await context.code_getter(pathname);
  }

  useEffect(() => {
    const fetchData = async () => {
      if (!context.newproject) {
        await ok(pathname.slice(-5));
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
      {mod && (
        <Modal
          setmod={setmod}
          gitcontrols={gitcontrols}
          setgitcontrols={setgitcontrols}
          context={context}
        />
      )}
      {filemod && <FileModal setfilemod={setfilemod} context={context} setfileindex={setfileindex}/>}
      <div className="flex-row ">
        <div className="flex">
          <div className="w-1/8 overflow-y-auto" style={{ overflowY: "auto" }}>
            <div className="w-48 border-2 border-gray-300 text-white mt-8 p-1 text-sm">
              File Language: {context.files[fileindex].lang}
            </div>
            <div className="flex justify-evenly text-sm mt-2">
              <button
                className="bg-orange-400 text-black rounded-lg p-1 font-bold"
                onClick={async () => {
                  setfilemod(true);
                }}
              >
                Add File +
              </button>
            </div>
            <div className="flex-row mt-4 space-y-4">
              {context.files.length !== 0 &&
                context.files.map((file: any) => {
                  return (
                    <div className="flex p-1 text-white" key={file.id}>
                      <button
                        className={`${file.id === context.files[fileindex].id ? "bg-blue-400 border-2 border-white" : "bg-green-400"} flex-1 px-1 rounded-md`}
                        onClick={() => {
                          setstd({
                            id: context.files[fileindex].id,
                            std: false,
                          });
                          for (let i = 0; i < context.files.length; i++) {
                            if (file.id === context.files[i].id) {
                              setfileindex(i);
                              break;
                            }
                          }
                        }}
                      >
                        {file.filename}
                      </button>
                      <button className="bg-red-700 flex-2 px-1 rounded-md">
                        Delete
                      </button>
                    </div>
                  );
                })}
            </div>
          </div>
          <div className="flex-1 bg-gray-900 text-white w-7/8 coding">
            <div className="h-6 w-full flex justify-end ">
              <div className="space-x-4 pr-8 flex">
                <button
                  className="bg-blue-800 text-center px-1 text-white font-bold"
                  onClick={context.snipclone}
                >
                  Clone Project
                </button>
                <button
                  className="bg-blue-800 text-center px-1 text-white font-bold"
                  onClick={() => {
                    setmod(true);
                  }}
                >
                  Git Controls
                </button>
                <button
                  className="bg-blue-800 text-center px-1 text-white font-bold"
                  onClick={context.saver}
                >
                  Save/Share
                </button>
              </div>
            </div>
            <div className="">
              <Editor
                height="70vh"
                width="100%"
                theme="vs-dark"
                value={context.files[fileindex].content}
                language={context.files[fileindex].lang}
                onMount={handleEditorDidMount}
                onChange={handleCodeChange}
              />
            </div>
            <div className="space-x-2">
              <button
                className={`text-gray-700 text-sm font-bold bg-green-500 rounded-sm p-2`}
                onClick={async () => {
                  try {
                    const index: number = fileindex;
                    const saver = await context.saver();
                    if (saver.data.success === 0) {
                      throw saver.data.error;
                    }
                    setstd({ std: false, id: context.files[fileindex].id });
                    if (saver.success === 0) {
                      throw saver.success;
                    }
                    const response = await context.coderunner(index);
                    context.setFiles((prevFiles: any[]) => {
                      const updatedFiles = [...prevFiles];
                      updatedFiles[index] = {
                        ...updatedFiles[index],
                        stdout: response.stdout,
                      };
                      return updatedFiles;
                    });
                  } catch (error) {
                    console.error(error);
                  }
                }}
              >
                Run
              </button>
              <button
                className={`text-gray-700 text-sm font-bold ${std.std === true ? "bg-blue-400 underline" : "bg-red-400"} rounded-sm p-2`}
                onClick={() => {
                  setstd({
                    id: context.files[fileindex].id,
                    std: true,
                  });
                }}
              >
                Stdin
              </button>
              <button
                className={`text-gray-700 text-sm font-bold ${std.std === false && std.id === context.files[fileindex].id ? "bg-blue-400 underline" : "bg-red-400"} rounded-sm p-2`}
                onClick={() => {
                  setstd({
                    id: context.files[fileindex].id,
                    std: false,
                  });
                }}
              >
                Stdout
              </button>
            </div>
            <div className="">
              <Editor
                height="40vh"
                theme="vs-dark"
                width="100%"
                onMount={handlestdDidMount}
                value={
                  std.std === true && std.id === context.files[fileindex].id
                    ? context.files[fileindex].stdin
                    : context.files[fileindex].stdout
                }
                onChange={
                  std.std === true && std.id === context.files[fileindex].id
                    ? handlestdinChange
                    : undefined
                }
                options={{ readOnly: !std }}
              />
            </div>
          </div>
        </div>
      </div>
    </Context.Provider>
  );
};

export default Form;
