import { Smile, Frown, Send, Bug } from "lucide-react";
import { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
interface Feedback {
  content: string;
  happy: boolean;
}
export default function FeedbackModal({ context }: { context: any }) {
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (feedback === null) {
      setFeedback({
        content: e.target.value,
        happy: true,
      });
    } else {
      setFeedback({
        ...feedback,
        content: e.target.value,
      });
    }
  };
  return (
    <Dialog>
      <DialogTrigger asChild>
        {/* <Button variant="link" size={"xs"} className="py-1 px-1">
          <MessageCircleCode size={"20px"} color="white" />
        </Button> */}
        <div className="flex justify-center items-center">
          <div className="relative flex items-center justify-center">
            <button
              className="BugButton w-10 h-10 flex flex-col items-center justify-center gap-1 bg-transparent border-none rounded-md cursor-pointer transition-all duration-200 relative overflow-hidden hover:bg-purple-900 active:scale-95"
              aria-label="Bug Report"
            >
              <Bug color="white" />
              <span className="tooltip absolute top-[-40px] min-w-[100px] px-3 py-2 text-[12px] font-semibold text-white bg-gray-800 rounded shadow-lg opacity-0 transition-opacity duration-500 pointer-events-none before:absolute before:bottom-[-5px] before:left-1/2 before:w-2.5 before:h-2.5 before:bg-gray-800 before:rotate-45 group-hover:opacity-100">
                Bug Report
              </span>
            </button>
          </div>{" "}
        </div>
      </DialogTrigger>
      <DialogContent className="bg-slate-800 border border-slate-700 grid grid-cols-6 gap-2 rounded-xl p-2 text-sm">
        <h1 className="text-center text-white text-xl font-bold col-span-6">
          Send Feedback
        </h1>
        <Input
          className="bg-slate-700 text-slate-300 h-28 placeholder:text-slate-300 placeholder:opacity-50 border border-slate-600 col-span-6 resize-none outline-none rounded-lg p-2 duration-300 focus:border-slate-300 w-full"
          placeholder="Your feedback..."
        />
        <button className="fill-slate-300 col-span-1 flex justify-center items-center rounded-lg p-2 duration-300 bg-slate-700 hover:border-slate-300 focus:fill-blue-200 focus:bg-blue-600 border border-slate-600">
          <Smile
            size="20px"
            color="white"
            onClick={() => {
              if (feedback) {
                setFeedback({
                  ...feedback,
                  happy: true,
                });
              } else {
                setFeedback({
                  content: "",
                  happy: true,
                });
              }
            }}
          />
        </button>
        <button className="fill-slate-300 col-span-1 flex justify-center items-center rounded-lg p-2 duration-300 bg-slate-700 hover:border-slate-300 focus:fill-blue-200 focus:bg-blue-600 border border-slate-600">
          <Frown
            size="20px"
            color="white"
            onClick={() => {
              if (feedback) {
                setFeedback({
                  ...feedback,
                  happy: false,
                });
              } else {
                setFeedback({
                  content: "",
                  happy: false,
                });
              }
            }}
          />
        </button>
        <span className="col-span-2"></span>
        <button className="col-span-2 stroke-slate-300 bg-slate-700 focus:stroke-blue-200 focus:bg-blue-600 border border-slate-600 hover:border-slate-300 rounded-lg p-2 duration-300 flex justify-center items-center">
          <Send
            size="20px"
            color="white"
            onClick={async () => {
              if (!feedback) {
                toast.warning("Please provide feedback");
              }
              await context.addFeedback(feedback);
            }}
          />
        </button>
      </DialogContent>
    </Dialog>
  );
}
