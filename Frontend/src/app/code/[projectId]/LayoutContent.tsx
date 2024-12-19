import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import FileModal from "@/components/FileModal";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { File } from "@/Data";
export default function LayoutContent({
  context,
  fileModal,
  fileModalFunc,
}: {
  context: any;
  fileModal: any;
  fileModalFunc: any;
}) {
  const router = useRouter();
  const fileId = usePathname().split("/")[3];
  const projectId = usePathname().split("/")[2];
  return (
    <>
      <div className="p-4 space-y-4">
        <h1
          className="text-3xl font-bold text-center text-white cursor-pointer"
          onClick={context.goHome}
        >
          CodeBrim
        </h1>
        <p className="text-sm text-center text-gray-400">Compiler on the Go!</p>
        <div className={`flex flex-col justify-center items-center gap-2`}>
          <Button onClick={context.goHome} variant="ghost" className="w-full">
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

      <div className="mt-4 space-y-2   pb-12">
        <div className="h-full w-full px-4 flex flex-col gap-2 overflow-y-auto scrollbar-hide">
          {context.files.map((file: File) => (
            <Button
              key={file.id}
              variant="default"
              className={cn(
                file.id === fileId
                  ? "shadow-none border-2 border-white"
                  : "shadow-xl",
                "flex flex-row justify-between px-2",
              )}
              onClick={() => router.push(`/code/${projectId}/${file.id}`)}
            >
              <Image
                src={"/languageIcon/" + file.filename.split(".")[1] + ".svg"}
                width={100}
                height={100}
                className="w-5 h-5"
                alt="Language Icon"
              />
              <span className="truncate">{file.filename}</span>
            </Button>
          ))}
        </div>
      </div>
    </>
  );
}
