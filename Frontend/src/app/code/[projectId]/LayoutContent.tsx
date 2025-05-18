import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useCodeStore } from "@/lib/codeStore";
import { FileExplorer } from "@/components/CodePage/FileExlorer";
export default function LayoutContent() {
  const { files } = useCodeStore();
  const router = useRouter();
  return (
    <>
      <div className="gap-4 p-2">
        <h1
          className="text-3xl font-bold text-center text-white cursor-pointer"
          onClick={() => router.push("/")}
        >
          CodeBrim
        </h1>
        <p className="text-sm text-center text-gray-400">Compiler on the Go!</p>
        <div className={`flex flex-col justify-center items-center gap-2`}>
          <Button
            onClick={() => router.push("/")}
            variant="ghost"
            className="w-full"
          >
            <Home className="mr-2 h-4 w-4" /> Home
          </Button>
        </div>
      </div>

      {files && <FileExplorer />}
    </>
  );
}
