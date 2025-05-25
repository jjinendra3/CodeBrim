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
import { File } from "@/type";
import ProtectedOverlay from "@/components/CodePage/ProtectedOverlay";

export default function CodePageLayoyut({
  children,
}: {
  children: React.ReactNode;
}) {
  const { getCode, setPayload, setQueued, setFiles, user, setUser, canLock } =
    useCodeStore();
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
        setUser(response.user);
        setFiles(response.user.items);
        const fileItem = response.user.items.find(
          (item: File) => item.type === "file",
        );
        const fileId = fileItem ? fileItem.id : undefined;
        if (!fileId) {
          router.push(`/code/${projectId}`);
        }
        router.push(`/code/${projectId}/${fileId}`);
      }
    };
    fetchData();
  }, [getCode, projectId, router, setFiles, setUser]);

  return user.password && !canLock ? (
    <ProtectedOverlay />
  ) : (
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
