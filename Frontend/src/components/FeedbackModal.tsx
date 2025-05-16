import { Smile, Frown, Send, Bug } from "lucide-react";
import { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useCodeStore } from "@/lib/codeStore";

export default function FeedbackModal() {
  const addFeedback = useCodeStore(state => state.addFeedback);
  const [feedback, setFeedback] = useState({
    content: "",
    happy: true,
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
      await addFeedback(feedback);
      toast.success("Feedback submitted successfully!");
      setFeedback({ content: "", happy: true });
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit feedback. Please try again.");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="flex gap-2 items-center border-slate-600 text-white bg-slate-800 hover:bg-slate-700"
        >
          <Bug size={18} />
          Report a Bug
        </Button>
      </DialogTrigger>

      <DialogContent className="bg-slate-800 border border-slate-700 rounded-xl p-6 text-sm max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white text-lg text-center">
            Send Feedback
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3 mt-4">
          <Input
            value={feedback.content}
            onChange={handleContentChange}
            placeholder="Describe the issue or your feedback..."
            className="bg-slate-700 text-white h-24 placeholder:text-slate-400 resize-none rounded-lg p-2 border border-slate-600"
          />

          <div className="flex justify-center gap-4">
            <Button
              onClick={() => handleHappyToggle(true)}
              variant="ghost"
              className={`bg-slate-700 p-2 rounded-lg border ${
                feedback.happy === true ? "border-blue-500" : "border-slate-600"
              }`}
            >
              <Smile size={20} color="white" />
            </Button>
            <Button
              onClick={() => handleHappyToggle(false)}
              variant="ghost"
              className={`bg-slate-700 p-2 rounded-lg border ${
                feedback.happy === false
                  ? "border-blue-500"
                  : "border-slate-600"
              }`}
            >
              <Frown size={20} color="white" />
            </Button>
          </div>

          <Button
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg"
          >
            <Send size={18} className="mr-2" />
            Submit
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
