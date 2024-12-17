"use client";
import { useContext, useState } from "react";
import Context from "@/ContextAPI";
import { useEffect } from "react";
import { useSocket } from "../../../../lib/socket";
import PasswordModal from "@/components/PasswordModal";
import { useBreakpoint } from "@/use-breakpoint";
import { Home, FilePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";
import FileModal from "@/components/FileModal";
import type { File } from "@/Data";
import { cn } from "@/lib/utils";

export default function CodePageLayoyut({
  children,
}: {
  children: React.ReactNode;
}) {
  const socket = useSocket();
  const context = useContext(Context);
  useEffect(() => {
    if (socket) {
      socket.on("codeResult", (payload: any) => {
        context.setPayload(payload);
        context.setQueued({
          loading: false,
          fileId: payload.fileId,
        });
      });
    }
    //eslint-disable-next-line
  }, [socket]);

  const router = useRouter();
  const projectId = usePathname().split("/")[2];
  const fileId = usePathname().split("/")[3];
  const [fileModal, setFileModal] = useState<boolean>(false);
  const fileModalFunc = (value: boolean) => {
    setFileModal(value);
  };

  useEffect(() => {
    const fetchData = async () => {
      const response = await context.code_getter(projectId);
      if (response.success === 1) {
        context.setFiles(response.user.files);
        router.push(`/code/${projectId}/${response.user.files[0].id}`);
        // if (response.user.password !== null) {
        //   context.setEditable(false);
        //   setpwdmod(true);
        // }
      }
    };
    fetchData();
    //eslint-disable-next-line
  }, []);
  console.log(context.files);
  return (
    <Context.Provider value={context}>
      <div className="flex md:flex-row flex-col">
        <div className="w-1/6 bg-gray-800 border-r border-gray-50">
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
            <div className={`flex flex-col justify-center items-center gap-2`}>
              <Button
                onClick={context.goHome}
                variant="outline"
                className="w-full"
              >
                <Home className="mr-2 h-4 w-4" /> Home
              </Button>
              {context.editable && (
                <FileModal
                  context={context}
                  modal={fileModal}
                  setModal={fileModalFunc}
                />
              )}
            </div>
          </div>

          <div className="mt-4 space-y-2 h-[calc(100vh-200px)]  pb-12">
            <div className="h-full w-full px-4 flex flex-col gap-2 overflow-y-auto scrollbar-hide">
              {context.files.map((file: File) => (
                <Button
                  key={file.id}
                  variant="default"
                  className={cn(
                    file.id === fileId
                      ? "shadow-none border-2 border-white"
                      : "shadow-xl",
                    "flex flex-row justify-between",
                  )}
                  onClick={() => router.push(`/code/${projectId}/${file.id}`)}
                >
                  <FilePlus className="mr-2 h-4 w-4" />
                  <span className="truncate">{file.filename}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>
        {children}
      </div>
    </Context.Provider>
  );
}
