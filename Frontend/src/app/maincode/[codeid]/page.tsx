"use client";
import React, { useState, useRef, useContext, useEffect } from "react";
import Editor from "@monaco-editor/react";
import Context from "@/ContextAPI";
import { usePathname } from 'next/navigation';
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Modal from "@/components/Modal";

const Form = () => {
  const context = useContext(Context);
  const editorRef = useRef<any>(null);
  const stdinRef = useRef<any>(null);
  const [std, setstd] = useState(true);
  const [stdin, setstdin] = useState("");
  const [stdout, setstdout] = useState("");
  const [code, setcode] = useState("");
  const [stderr, setstderr] = useState("");
  const [mod, setmod] = useState(false);
  const [repolink,setrepolink]=useState("");
  const [commitmsg, setcommitmsg] = useState("commit");
  const [branch, setbranch] = useState("main");
  const pathname = usePathname();
  const router=useRouter();
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
  async function ok(pathname: string){
      const response=await context.code_getter(pathname);
     
  }
  useEffect(() => {
    try {
    setcode(context.files[fileindex].content);
    setstdin(context.files[fileindex].stdin);
    setstdout(context.files[fileindex].stdout); 
    setstderr(context.files[fileindex].sdterr); 
    } catch (error) {
      toast.error("Error in fetching this code snippet, please try again later!")
      router.push('/');
    }
  }, [fileindex, setfileindex,context.files]);

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
      {mod && <Modal setmod={setmod} setrepolink={setrepolink} setcommitmsg={setcommitmsg} setbranch={setbranch}/>}
      <div className="flex-row">
        <div className="flex">
          <div className="w-1/8">
            <div className="w-48 border-2 border-gray-300 text-white mt-8 p-1 text-sm">
              Language: {context.language}
            </div>
            <div className="flex justify-evenly text-sm mt-2">
              <button
                className="bg-orange-400 text-black rounded-lg p-1 font-bold"
                onClick={async () => {
                  await context.newFile();
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
                      <div
                        className={`${file.id === context.files[fileindex].id ? "bg-blue-400" : "bg-green-400"} flex-1 px-1 rounded-md`}
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
                      </div>
                      <button className="bg-red-700 flex-2 px-1 rounded-md">Delete</button>
                    </div>
                  );
                })}
            </div>
          </div>
          <div className="flex-1 bg-gray-900 text-white w-7/8">
            <div className="h-6 w-full flex justify-end ">
              <div className="space-x-4 pr-8 flex">
                <button className="bg-blue-800 text-center px-1 text-white font-bold" onClick={()=>{
                  setmod(true);
                  context.gitpush("<valid git link here>",commitmsg,branch);
                }}>
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
                value={code}
                language={context.language}
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
                    setstd(false);
                    if (saver.success === 0) {
                      throw saver.success;
                    }
                    const response = await context.coderunner(index);
                    context.setFiles((prevFiles: any[]) => {
                      const updatedFiles = [...prevFiles];
                      updatedFiles[index] = { ...updatedFiles[index], stdout: response.stdout, stderr: response.stderr }; 
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
                className={`text-gray-700 text-sm font-bold ${std === true ? "bg-blue-400 underline" : "bg-red-400"} rounded-sm p-2`}
                onClick={() => {
                  setstd(true);
                }}
              >
                Stdin
              </button>
              <button
                className={`text-gray-700 text-sm font-bold ${std === false ? "bg-blue-400 underline" : "bg-red-400"} rounded-sm p-2`}
                onClick={() => {
                  setstd(false);
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
                value={std === true ? stdin : (stdout !== "" ? stdout : stderr)}
                onChange={std === true ? handlestdinChange : undefined}
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
