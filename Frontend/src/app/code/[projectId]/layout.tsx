"use client";
import { useContext, useState } from "react";
import Context from "@/ContextAPI";
import { useEffect } from "react";
import { useSocket } from "../../../../lib/socket";
import { Menu } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import LayoutContent from "./LayoutContent";
import { useIsMobile } from "@/hooks/use-mobile";
export default function CodePageLayoyut({
  children,
}: {
  children: React.ReactNode;
}) {
  const isBiggerThanTab = !useIsMobile();
  const socket = useSocket();
  const context = useContext(Context);
  useEffect(() => {
    if (socket) {
      //gotta add the condition where socket doesnt get connected
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
  return (
    <Context.Provider value={context}>
      <div className="flex h-screen">
        <div
          className={cn(
            isBiggerThanTab ? "w-1/6" : "w-1/8",
            "bg-gray-800 border-r border-gray-50 h-screen",
          )}
        >
          {!isBiggerThanTab ? (
            <Sheet>
              <SheetTrigger className="w-full text-center flex items-center justify-center">
                <Menu />
              </SheetTrigger>
              <SheetContent
                side={"left"}
                className="bg-gray-800 border-r border-gray-50 h-full"
              >
                <LayoutContent
                  context={context}
                  fileModal={fileModal}
                  fileModalFunc={fileModalFunc}
                />
              </SheetContent>
            </Sheet>
          ) : (
            <LayoutContent
              context={context}
              fileModal={fileModal}
              fileModalFunc={fileModalFunc}
            />
          )}
        </div>
        {children}
      </div>
    </Context.Provider>
  );
}
