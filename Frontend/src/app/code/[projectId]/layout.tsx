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
export default function CodePageLayoyut({
  children,
}: {
  children: React.ReactNode;
}) {
  const socket = useSocket();
  useEffect(() => {
    if (socket) {
      socket.on("codeResult", (payload: any) => {
        console.log(payload);
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
  const context = useContext(Context);

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
          <div className="mt-4 space-y-2 h-[calc(100vh-200px)] overflow-y-auto px-4">
            {context.files.map((file: any, index: number) => (
              <Button
                key={file.id}
                variant={file.id === fileId ? "default" : "secondary"}
                className="w-full justify-start hover:bg-none"
                onClick={() => {
                  router.push(`/code/${projectId}/${file.id}`);
                }}
              >
                <h1
                  className={`${file.id === fileId ? "text-white" : "text-black"}`}
                >
                  {file.filename}
                </h1>
              </Button>
            ))}
          </div>
        </div>
        {children}
      </div>
    </Context.Provider>
  );
}
