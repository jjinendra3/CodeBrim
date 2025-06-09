"use client";
import { useEffect } from "react";
import { useSocket } from "../../../../lib/socket";
import { Menu } from "lucide-react";
import { redirect, usePathname, useRouter } from "next/navigation";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import LayoutContent from "./LayoutContent";
import { useIsMobile } from "@/hooks/use-mobile";
import { useCodeStore } from "@/lib/codeStore";
import { File } from "@/type";
import ProtectedOverlay from "@/components/CodePage/ProtectedOverlay";
import { toast } from "sonner";

export default function CodePageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  redirect("/maintenance");

  const { getCode, setPayload, setQueued, setFiles, user, setUser, canLock } =
    useCodeStore();
  const isMobile = useIsMobile();
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
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);

  const router = useRouter();
  const projectId = usePathname().split("/")[2];
  const existingFileId = usePathname().split("/")[3];
  useEffect(() => {
    const fetchData = async () => {
      const response = await getCode(projectId);
      if (response.success === 1) {
        setUser(response.user);
        setFiles(response.user.items);
        const fileItem = existingFileId
          ? {
              id: existingFileId,
            }
          : response.user.items.find((item: File) => item.type === "file");
        const fileId = fileItem ? fileItem.id : undefined;
        if (!fileId) {
          toast.error("No file found in the project.");
          return router.push(`/`);
        } else {
          return router.push(`/code/${projectId}/${fileId}`);
        }
      }
      return router.push("/not-found");
    };
    fetchData();
  }, [existingFileId, getCode, projectId, router, setFiles, setUser]);

  if (user.password && !canLock) {
    return <ProtectedOverlay />;
  }

  return (
    <div className="flex h-screen">
      {isMobile ? (
        <>
          <div className="fixed top-0.5 left-1 z-50">
            <Sheet>
              <SheetTrigger className="p-2 bg-gray-900 hover:bg-gray-700 rounded-md shadow-lg border border-gray-600 transition-colors">
                <Menu className="h-2 w-2 text-white" />
              </SheetTrigger>
              <SheetContent
                side="left"
                className="bg-gray-800 border-r border-gray-200 h-full w-80 p-0"
              >
                <LayoutContent />
              </SheetContent>
            </Sheet>
          </div>
          <div className="w-full">{children}</div>
        </>
      ) : (
        <>
          <div className="w-1/6 bg-gray-800 border-r border-gray-200 h-screen">
            <LayoutContent />
          </div>
          <div className="flex-1">{children}</div>
        </>
      )}
    </div>
  );
}
