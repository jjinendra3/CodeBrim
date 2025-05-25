import { Smile, Frown, Send, Bug, X } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useCodeStore } from "@/lib/codeStore";

interface FeedbackData {
  content: string;
  happy: boolean | null;
}

export default function FeedbackModal() {
  const addFeedback = useCodeStore(state => state.addFeedback);
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackData>({
    content: "",
    happy: null,
  });

  const handleHappyToggle = (isHappy: boolean) => {
    setFeedback(prev => ({
      ...prev,
      happy: isHappy,
    }));
  };

  const resetForm = () => {
    setFeedback({ content: "", happy: null });
    setIsSubmitting(false);
  };

  const handleCancel = () => {
    resetForm();
    setIsOpen(false);
  };

  const handleSubmit = async () => {
    if (!feedback.content.trim()) {
      toast.error("Please provide feedback before submitting.");
      return;
    }

    if (feedback.happy === null) {
      toast.error("Please indicate whether you are happy or not.");
      return;
    }

    setIsSubmitting(true);

    try {
      await addFeedback({
        content: feedback.content.trim(),
        happy: feedback.happy,
      });

      toast.success("Feedback submitted successfully!");
      resetForm();
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to submit feedback:", error);
      toast.error("Failed to submit feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      resetForm();
    }
  };

  const isFormValid = feedback.content.trim() && feedback.happy !== null;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="default" size="xs" className="gap-2">
          <Bug size={14} className="sm:w-4 sm:h-4" />
          <span className="hidden md:block">Report</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="bg-slate-900 border border-slate-700 rounded-2xl p-0 w-[95vw] max-w-md mx-auto shadow-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4 border-b border-slate-700">
          <DialogTitle className="text-lg sm:text-xl font-semibold text-white text-center">
            Send Feedback
          </DialogTitle>
          <p className="text-xs sm:text-sm text-slate-400 text-center mt-1">
            Help us improve by sharing your thoughts
          </p>
        </DialogHeader>

        <div className="px-4 sm:px-6 py-4 sm:py-6 space-y-5 sm:space-y-6">
          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-300">
              How was your experience?
            </label>
            <div className="flex justify-center gap-6 sm:gap-4 mt-4">
              <button
                onClick={() => handleHappyToggle(true)}
                disabled={isSubmitting}
                className={`
                  group relative p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 
                  hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
                  touch-manipulation min-w-[60px] sm:min-w-[70px]
                  ${
                    feedback.happy === true
                      ? "border-green-500 bg-green-500/20 shadow-lg shadow-green-500/20"
                      : "border-slate-600 bg-slate-800 hover:border-green-500/60"
                  }
                `}
              >
                <Smile
                  size={20}
                  className={`
                    sm:w-6 sm:h-6 transition-colors duration-200 mx-auto
                    ${
                      feedback.happy === true
                        ? "text-green-400"
                        : "text-slate-400 group-hover:text-green-400"
                    }
                  `}
                />
                <span
                  className={`
                  absolute -bottom-7 sm:-bottom-8 left-1/2 transform -translate-x-1/2 text-xs font-medium whitespace-nowrap
                  ${
                    feedback.happy === true
                      ? "text-green-400"
                      : "text-slate-400"
                  }
                `}
                >
                  Good
                </span>
              </button>

              <button
                onClick={() => handleHappyToggle(false)}
                disabled={isSubmitting}
                className={`
                  group relative p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 
                  hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
                  touch-manipulation min-w-[60px] sm:min-w-[70px]
                  ${
                    feedback.happy === false
                      ? "border-red-500 bg-red-500/20 shadow-lg shadow-red-500/20"
                      : "border-slate-600 bg-slate-800 hover:border-red-500/60"
                  }
                `}
              >
                <Frown
                  size={20}
                  className={`
                    sm:w-6 sm:h-6 transition-colors duration-200 mx-auto
                    ${
                      feedback.happy === false
                        ? "text-red-400"
                        : "text-slate-400 group-hover:text-red-400"
                    }
                  `}
                />
                <span
                  className={`
                  absolute -bottom-7 sm:-bottom-8 left-1/2 transform -translate-x-1/2 text-xs font-medium whitespace-nowrap
                  ${
                    feedback.happy === false ? "text-red-400" : "text-slate-400"
                  }
                `}
                >
                  Bad
                </span>
              </button>
            </div>
          </div>

          <div className="space-y-3 mt-8 sm:mt-8">
            <label className="block text-sm font-medium text-slate-300">
              Tell us more
            </label>
            <div className="relative">
              <textarea
                value={feedback.content}
                onChange={e =>
                  setFeedback(prev => ({ ...prev, content: e.target.value }))
                }
                placeholder="Share your thoughts, report bugs, or suggest improvements..."
                disabled={isSubmitting}
                rows={4}
                maxLength={500}
                className="
                  w-full px-3 sm:px-4 py-3 rounded-xl border border-slate-600
                  bg-slate-800 text-white text-sm sm:text-base
                  placeholder:text-slate-400
                  focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  disabled:opacity-50 disabled:cursor-not-allowed
                  resize-none transition-all duration-200
                  leading-relaxed min-h-[100px] sm:min-h-[120px]
                "
              />
              <div className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3 text-xs text-slate-500">
                {feedback.content.length}/500
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-6 py-3 sm:py-4 bg-slate-800 rounded-b-2xl border-t border-slate-700">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button
              onClick={handleCancel}
              variant="outline"
              disabled={isSubmitting}
              className="flex-1 bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600 hover:text-white transition-colors duration-200 h-10 sm:h-9 text-sm touch-manipulation"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !isFormValid}
              className={`
                flex-1 font-medium transition-all duration-200 h-10 sm:h-9 text-sm touch-manipulation
                ${
                  isFormValid && !isSubmitting
                    ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
                    : "bg-slate-600 text-slate-400 cursor-not-allowed"
                }
              `}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Sending...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Send size={14} className="sm:w-4 sm:h-4" />
                  <span>Send Feedback</span>
                </div>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
