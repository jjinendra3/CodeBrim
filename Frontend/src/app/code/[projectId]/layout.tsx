"use client";
import { useEffect } from "react";
import { useSocket } from "../../../../lib/socket";
import { Menu } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import LayoutContent from "./LayoutContent";
import { useIsMobile } from "@/hooks/use-mobile";
import { useCodeStore } from "@/lib/codeStore";
export default function CodePageLayoyut({
  children,
}: {
  children: React.ReactNode;
}) {
  const { getCode, setPayload, setQueued, setFiles } = useCodeStore();
  const isBiggerThanTab = !useIsMobile();
  const socket = useSocket();
  useEffect(() => {
    if (socket) {
      socket.on("codeResult", (payload: any) => {
        setPayload(payload);
        setQueued({
          loading: false,
          fileId: payload.fileId,
        });
      });
    }
  }, [setPayload, setQueued, socket]);

  const router = useRouter();
  const projectId = usePathname().split("/")[2];
  useEffect(() => {
    const fetchData = async () => {
      const response = await getCode(projectId);
      if (response.success === 1) {
        setFiles(response.user.items);
        router.push(`/code/${projectId}/${response.user.items[0].id}`);
      }
    };
    fetchData();
    //eslint-disable-next-line
  }, []);
  return (
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
              <LayoutContent />
            </SheetContent>
          </Sheet>
        ) : (
          <LayoutContent />
        )}
      </div>
      {children}
    </div>
  );
}
