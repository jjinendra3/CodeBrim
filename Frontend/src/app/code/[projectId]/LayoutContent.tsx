import { Button } from "@/components/ui/button";
import { Home, Lock, LockKeyholeOpen } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCodeStore } from "@/lib/codeStore";
import { FileExplorer } from "@/components/CodePage/FileExlorer";
import PasswordDialog from "@/components/Modals/PasswordModal";

export default function LayoutContent() {
  const { files, canLock, user, userPrivacy } = useCodeStore();
  const router = useRouter();

  const handleHomeClick = () => {
    router.push("/");
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-shrink-0 p-4 space-y-4">
        <div className="text-center">
          <h1
            className="text-2xl font-bold text-white cursor-pointer hover:text-gray-200 transition-colors"
            onClick={handleHomeClick}
          >
            CodeBrim
          </h1>
          <p className="text-sm text-gray-400 mt-1">Compiler on the Go!</p>
        </div>

        <div className="flex justify-center gap-2">
          <Button
            onClick={handleHomeClick}
            className=" text-white hover:bg-gray-700"
          >
            <Home className="h-4 w-4" />
          </Button>
          {canLock ? <PasswordDialog /> : null}
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {files && files.length > 0 && <FileExplorer />}
      </div>
    </div>
  );
}
