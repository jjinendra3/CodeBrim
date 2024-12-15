import { Smile, Frown, Send,MessageCircleCode } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
export default function FeedbackModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="link" size={"xs"} className="py-1 px-1">
          <MessageCircleCode size={'20px'} color="white"/>
        </Button>
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
          <Smile size="20px" color="white" />
        </button>
        <button className="fill-slate-300 col-span-1 flex justify-center items-center rounded-lg p-2 duration-300 bg-slate-700 hover:border-slate-300 focus:fill-blue-200 focus:bg-blue-600 border border-slate-600">
          <Frown size="20px" color="white" />
        </button>
        <span className="col-span-2"></span>
        <button className="col-span-2 stroke-slate-300 bg-slate-700 focus:stroke-blue-200 focus:bg-blue-600 border border-slate-600 hover:border-slate-300 rounded-lg p-2 duration-300 flex justify-center items-center">
          <Send size="20px" color="white" />
        </button>
      </DialogContent>
    </Dialog>
  );
}
