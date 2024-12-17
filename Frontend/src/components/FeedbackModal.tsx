import { Smile, Frown, Send, Bug } from "lucide-react";
import { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

interface Feedback {
  content: string;
  happy: boolean | null;
}

export default function FeedbackModal({
  context,
}: {
  context: { addFeedback: (feedback: Feedback) => Promise<void> };
}) {
  const [feedback, setFeedback] = useState<Feedback>({
    content: "",
    happy: null,
  });

  const handleContentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFeedback(prev => ({
      ...prev,
      content: e.target.value,
    }));
  };

  const handleHappyToggle = (isHappy: boolean) => {
    setFeedback(prev => ({
      ...prev,
      happy: isHappy,
    }));
  };

  const handleSubmit = async () => {
    if (!feedback.content.trim()) {
      toast.warning("Please provide feedback before submitting.");
      return;
    }

    if (feedback.happy === null) {
      toast.warning("Please indicate whether you are happy or not.");
      return;
    }

    try {
      await context.addFeedback(feedback);
      toast.success("Feedback submitted successfully!");
      setFeedback({ content: "", happy: null });
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit feedback. Please try again.");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="flex justify-center items-center">
          <Button
            className="flex items-center bg-transparent justify-center rounded-md transition-all duration-200 hover:bg-purple-900 active:scale-95"
            aria-label="Bug Report"
          >
            <Bug color="white" size={'20px'}/>
            <span className="tooltip absolute top-[-40px] min-w-[100px] px-3 py-2 text-xs font-semibold text-white bg-gray-800 rounded shadow-lg opacity-0 transition-opacity duration-500 pointer-events-none group-hover:opacity-100">
              Bug Report
            </span>
          </Button>
        </div>
      </DialogTrigger>

      <DialogContent className="bg-slate-800 border border-slate-700 grid grid-cols-6 gap-2 rounded-xl p-2 text-sm">
        <h1 className="text-center text-white text-xl font-bold col-span-6">
          Send Feedback
        </h1>

        <Input
          value={feedback.content}
          onChange={handleContentChange}
          placeholder="Your feedback..."
          className="bg-slate-700 text-slate-300 h-28 placeholder:text-slate-300 placeholder:opacity-50 border border-slate-600 col-span-6 resize-none outline-none rounded-lg p-2 focus:border-slate-300 w-full"
        />

        <Button
          onClick={() => handleHappyToggle(true)}
          className={`col-span-1 flex justify-center items-center rounded-lg p-2 duration-300 bg-slate-700 border ${
            feedback.happy === true ? "border-blue-500" : "border-slate-600"
          }`}
          aria-label="Happy Feedback"
        >
          <Smile size="20px" color="white" />
        </Button>

        <Button
          onClick={() => handleHappyToggle(false)}
          className={`col-span-1 flex justify-center items-center rounded-lg p-2 duration-300 bg-slate-700 border ${
            feedback.happy === false ? "border-blue-500" : "border-slate-600"
          }`}
          aria-label="Unhappy Feedback"
        >
          <Frown size="20px" color="white" />
        </Button>

        <span className="col-span-2"></span>

        <Button
          onClick={handleSubmit}
          className="col-span-2 flex justify-center items-center bg-slate-700 hover:bg-blue-600 text-white rounded-lg p-2 duration-300 border border-slate-600 hover:border-blue-400"
          aria-label="Submit Feedback"
        >
          <Send size="20px" color="white" />
        </Button>
      </DialogContent>
    </Dialog>
  );
}
