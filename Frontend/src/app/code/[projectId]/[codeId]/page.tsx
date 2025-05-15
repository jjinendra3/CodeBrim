"use client";
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Editor from "@monaco-editor/react";
import Modal from "@/components/Modal";
import FileModal from "@/components/FileModal";
import PasswordModal from "@/components/PasswordModal";
import { type File } from "@/type";
import { useRouter, usePathname } from "next/navigation";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import FeedbackModal from "@/components/FeedbackModal";
import { Play, Lock, Unlock, Copy, GitBranch, Save } from "lucide-react";
import Loader from "@/components/Loader";
import { useIsMobile } from "@/hooks/use-mobile";
import { useCodeStore } from "@/lib/codeStore";
export default function Form() {
  const {
    codeRunner,
    getFileData,
    saver,
    snipClone,
    payload,
    setPayload,
    saving,
    editable,
    queued,
  } = useCodeStore();
  const router = useRouter();
  const pathname = usePathname();
  const projectId = pathname.split("/")[2];
  const fileId = pathname.split("/")[3];
  const [presentFile, setPresentFile] = useState<File | null>(null);
  const presentFileRef = useRef<File | null>(presentFile);
  const isTabBigger = !useIsMobile();
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
      const response = await getFileData(fileId);
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
    presentFileRef.current = presentFile;
  }, [presentFile]);
  useEffect(() => {
    const handleKeyDown = async (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "s") {
        event.preventDefault();
        if (presentFileRef.current !== null) {
          await saver(presentFileRef.current);
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
      if (payload && payload.fileId === fileId) {
        setPresentFile((prev: File | null) => {
          if (prev) {
            return { ...prev, stdout: payload.stdout };
          }
          return prev;
        });
        setPayload(null);
      }
    };
    handleStdOutChange();
    //eslint-disable-next-line
  }, [payload]);
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
    <div className={"overflow-hidden w-full"}>
      {pwdmod && <PasswordModal setpwdmod={setpwdmod} pwdflag={pwdflag} />}
      {mod && (
        <Modal
          setmod={setmod}
          gitcontrols={gitcontrols}
          setgitcontrols={setgitcontrols}
        />
      )}
      <ResizablePanelGroup direction="vertical">
        <ResizablePanel defaultSize={75}>
          <div className="h-8 flex justify-between items-center px-4 bg-gray-800 text-white">
            <div className="flex flex-row gap-2 items-center ">
              <FeedbackModal />
              <h2 className="font-semibold text-xs">
                Language: {presentFile?.lang.toUpperCase()}
              </h2>
            </div>
            {isTabBigger && (
              <div className="flex items-center space-x-2">
                <span className="text-xs">
                  {saving ? "Saving..." : "Code Saved!"}
                </span>
                <Save className={`h-3 w-3 ${saving ? "animate-pulse" : ""}`} />
              </div>
            )}
            <div className="flex space-x-2">
              <Button
                variant="default"
                size="xs"
                onClick={async () => {
                  const response = await snipClone();
                  if (!response) return;
                  router.push(`/code/${response.id}`);
                }}
              >
                <Copy className="h-4 w-4" />
                {isTabBigger && <span className="ml-2">Copy Files</span>}
              </Button>
              <Button variant="default" size="xs" onClick={() => setmod(true)}>
                <GitBranch className="h-4 w-4" />
                {isTabBigger && <span className="ml-2">Git Controls</span>}
              </Button>
              <Button
                variant="default"
                size="xs"
                onClick={() => {
                  if (!presentFile) return;
                  saver(presentFile);
                }}
              >
                <Save className="h-4 w-4" />
                {isTabBigger && <span className="ml-2">Save</span>}
              </Button>
              <Button
                variant="default"
                size="xs"
                onClick={async () => {
                  if (!presentFile) return;
                  await codeRunner(presentFile);
                }}
              >
                <Play className="h-4 w-4" />
                {isTabBigger && <span className="ml-1">Run</span>}
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
            options={{ readOnly: !editable }}
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
              {!(queued.fileId === fileId && queued.loading) ? (
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
