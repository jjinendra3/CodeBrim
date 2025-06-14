"use client";
import React, { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Editor from "@monaco-editor/react";
import { type File } from "@/type";
import { useRouter, usePathname } from "next/navigation";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import FeedbackModal from "@/components/Modals/FeedbackModal";
import { Play, Copy, Save, FileTextIcon, Download } from "lucide-react";
import Loader from "@/components/Loader";
import { useIsMobile } from "@/hooks/use-mobile";
import { useCodeStore } from "@/lib/codeStore";
import { ClipLoader } from "react-spinners";
import GitPushDialog from "@/components/Modals/GitModal";
export default function Form() {
  const {
    codeRunner,
    getFileData,
    snipClone,
    payload,
    setPayload,
    saving,
    editable,
    queued,
    presentFile,
    setPresentFile,
    downloadZip,
    updateFile,
  } = useCodeStore();
  const router = useRouter();
  const pathname = usePathname();
  const fileId = pathname.split("/")[3];
  const presentFileRef = useRef<File | null>(presentFile);
  const isTabBigger = !useIsMobile();
  const editorRef = useRef<any>(null);
  const stdinRef = useRef<any>(null);
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
  }, [getFileData, fileId, router, setPresentFile]);

  useEffect(() => {
    presentFileRef.current = presentFile;
  }, [presentFile]);

  useEffect(() => {
    const handleKeyDown = async (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "s") {
        event.preventDefault();
        if (presentFileRef.current !== null) {
          await updateFile(presentFileRef.current);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [updateFile]);

  useEffect(() => {
    const handleStdOutChange = () => {
      if (payload && payload.fileId === fileId) {
        if (presentFile) {
          setPresentFile({ ...presentFile, stdout: payload.stdout });
        }
        setPayload(null);
      }
    };
    handleStdOutChange();
  }, [fileId, payload, presentFile, setPayload, setPresentFile]);

  function handleCodeChange(value: string | undefined, event: any) {
    if (value) {
      if (presentFile) {
        setPresentFile({ ...presentFile, content: value });
      }
    }
  }

  function handlestdinChange(value: string | undefined, event: any) {
    if (value && presentFile) {
      setPresentFile({ ...presentFile, stdin: value });
    }
  }
  function handlestdDidMount(stdin: any, monaco: any) {
    stdinRef.current = stdin;
  }

  function handleEditorDidMount(editor: any, monaco: any) {
    editorRef.current = editor;
  }

  return (
    <div className={"flex h-screen overflow-hidden w-full"}>
      <ResizablePanelGroup direction="vertical">
        <ResizablePanel defaultSize={75}>
          <div className="h-8 flex justify-between items-center px-2 bg-gray-800 text-white">
            <div className="flex flex-row gap-2 items-center ">
              <div className={!isTabBigger ? "pl-8" : "pl-0"}>
                <FeedbackModal />
              </div>
              <h2 className="font-semibold text-xs">
                {presentFile?.lang?.toUpperCase() ?? "TXT"}
              </h2>
            </div>
            <div className="flex gap-2">
              <Button
                variant="default"
                size="xs"
                onClick={async () => {
                  const response = await snipClone();
                  if (!response) return;
                  window.open(
                    `/code/${response.id}`,
                    "_blank",
                    "noopener,noreferrer",
                  );
                }}
              >
                <Copy className="h-4 w-4" />
                {isTabBigger && <span className="ml-2">Clone Workspace</span>}
              </Button>
              <GitPushDialog />
              <Button variant="default" size="xs" onClick={downloadZip}>
                <Download className="h-4 w-4" />
                {isTabBigger && <span className="ml-2"> Download Project</span>}
              </Button>
              <Button
                variant="default"
                size="xs"
                onClick={async () => {
                  if (!presentFile) return;
                  await updateFile(presentFile);
                }}
              >
                {!saving ? (
                  <Save className="h-4 w-4" />
                ) : (
                  <ClipLoader
                    color="#ffffff"
                    loading={saving}
                    size={16}
                    className="h-4 w-4"
                  />
                )}
                {isTabBigger && (
                  <span className="ml-2"> {saving ? "Saving..." : "Save"}</span>
                )}
              </Button>
              <Button
                variant="default"
                size="xs"
                disabled={
                  (queued.fileId === fileId && queued.loading) ||
                  presentFile?.lang === "txt"
                }
                onClick={async () => {
                  if (!presentFile) return;
                  await codeRunner(presentFile);
                }}
              >
                <Play className="h-4 w-4" />
                {isTabBigger && <span className="ml-1">Run</span>}
              </Button>
            </div>
          </div>
          {presentFile?.type === "file" ? (
            <Editor
              theme="vs-dark"
              value={presentFile?.content ?? undefined}
              language={presentFile?.lang ?? undefined}
              onMount={handleEditorDidMount}
              onChange={handleCodeChange}
              options={{ readOnly: !editable }}
              className="border-t border-gray-700"
            />
          ) : (
            <div className="flex-1 bg-gray-900 border-t border-gray-700 flex items-center justify-center h-full">
              <div className="text-center space-y-4 p-8">
                <div className="w-16 h-16 mx-auto bg-gray-800 rounded-full flex items-center justify-center border border-gray-600">
                  <FileTextIcon className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-medium text-gray-300">
                    No File Selected
                  </h3>
                  <p className="text-sm text-gray-500 max-w-sm">
                    Select a file from the explorer to start editing your code
                  </p>
                </div>
              </div>
            </div>
          )}
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
                value={presentFile?.stdin ?? ""}
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
                    value={presentFile?.stdout ?? ""}
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
