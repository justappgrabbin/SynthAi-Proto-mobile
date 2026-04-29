import { useState } from "react";
import { ThumbsUp, ThumbsDown, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface MessageFeedbackProps {
  messageId: number;
  conversationId: number;
  onFeedbackSubmitted?: () => void;
}

export default function MessageFeedback({ messageId, conversationId, onFeedbackSubmitted }: MessageFeedbackProps) {
  const [rating, setRating] = useState<"good" | "meh" | "bad" | null>(null);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const submitFeedback = trpc.learning.recordFeedback.useMutation({
    onSuccess: () => {
      toast.success("Feedback recorded! Thank you for helping me improve.");
      setSubmitted(true);
      setRating(null);
      setNotes("");
      setShowNotes(false);
      onFeedbackSubmitted?.();
    },
    onError: () => {
      toast.error("Failed to record feedback");
    },
  });

  const handleSubmit = () => {
    if (!rating) return;

    submitFeedback.mutate({
      messageId,
      conversationId,
      rating,
      notes: notes || undefined,
    });
  };

  if (submitted) {
    return (
      <div className="text-xs text-cyan-400 mt-2 opacity-70">
        ✓ Feedback recorded
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 mt-3 p-2 border border-cyan-900 rounded bg-black/50">
      <div className="text-xs text-cyan-400 mb-1">Rate this response:</div>
      
      <div className="flex gap-2">
        <Button
          size="sm"
          variant={rating === "good" ? "default" : "outline"}
          onClick={() => setRating("good")}
          className={rating === "good" ? "bg-green-600 border-green-400" : ""}
        >
          <ThumbsUp className="w-4 h-4" />
          <span className="ml-1 hidden sm:inline">Good</span>
        </Button>

        <Button
          size="sm"
          variant={rating === "meh" ? "default" : "outline"}
          onClick={() => setRating("meh")}
          className={rating === "meh" ? "bg-yellow-600 border-yellow-400" : ""}
        >
          <Minus className="w-4 h-4" />
          <span className="ml-1 hidden sm:inline">Meh</span>
        </Button>

        <Button
          size="sm"
          variant={rating === "bad" ? "default" : "outline"}
          onClick={() => setRating("bad")}
          className={rating === "bad" ? "bg-red-600 border-red-400" : ""}
        >
          <ThumbsDown className="w-4 h-4" />
          <span className="ml-1 hidden sm:inline">Bad</span>
        </Button>
      </div>

      {rating && (
        <>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowNotes(!showNotes)}
            className="text-xs text-cyan-400 justify-start"
          >
            {showNotes ? "Hide notes" : "Add notes (optional)"}
          </Button>

          {showNotes && (
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What could improve? (optional)"
              className="text-xs p-2 bg-black border border-cyan-700 rounded text-cyan-100 placeholder-cyan-900 focus:outline-none focus:border-cyan-500 resize-none h-16"
            />
          )}

          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={submitFeedback.isPending}
            className="bg-cyan-600 hover:bg-cyan-700 text-black font-bold"
          >
            {submitFeedback.isPending ? "Submitting..." : "Submit Feedback"}
          </Button>
        </>
      )}
    </div>
  );
}
