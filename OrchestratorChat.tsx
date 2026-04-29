import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { trpc } from "@/lib/trpc";
import { Loader2, Send, Zap } from "lucide-react";
import { Streamdown } from "streamdown";
import { useDynamicComponent } from "@/contexts/DynamicComponentContext";
import { useUIMorph } from "@/contexts/UIMorphContext";
import { ComponentRequest } from "@/lib/componentRegistry";
import { VoiceOutput } from "@/components/VoiceOutput";
import { ttsManager } from "@/lib/textToSpeech";

interface Message {
  id?: number;
  role: "user" | "assistant";
  content: string;
  createdAt?: Date;
}

type OrchestratorState = "calm" | "chaos" | "listening";

export function OrchestratorChat({ conversationId }: { conversationId: number }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [state, setState] = useState<OrchestratorState>("calm");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { requestComponent } = useDynamicComponent();
  const { setState: setUIState } = useUIMorph();

  // Fetch existing messages
  const { data: existingMessages, isLoading: messagesLoading } = trpc.message.list.useQuery(
    { conversationId },
    { enabled: !!conversationId }
  );

  // Analyze request for UI morphing
  const analyzeRequestMutation = trpc.uiMorph.analyzeRequest.useMutation({
    onSuccess: (data) => {
      if (data.shouldShow && data.componentId) {
        const componentRequest: ComponentRequest = {
          componentId: data.componentId,
          title: data.title,
          description: data.description,
          context: data.contextData,
        };
        requestComponent(componentRequest);
      }
    },
  });

  // Send message mutation
  const sendMessageMutation = trpc.message.send.useMutation({
    onSuccess: (data) => {
      const newMessage = { role: "assistant" as const, content: data.message };
      setMessages((prev) => [...prev, newMessage]);
      setState("calm");
      setUIState("calm");
      setInput("");
      setIsLoading(false);
      
      // Speak the response
      ttsManager.speak(data.message).catch(err => console.error("TTS Error:", err));
      
      // Re-focus input after response
      setTimeout(() => inputRef.current?.focus(), 100);
    },
    onError: (error) => {
      console.error("Failed to send message:", error);
      setState("chaos");
      setUIState("chaos");
      setIsLoading(false);
    },
  });

  useEffect(() => {
    if (existingMessages) {
      setMessages(existingMessages);
    }
  }, [existingMessages]);

  useEffect(() => {
    // Auto-scroll to bottom
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const detectState = (text: string): OrchestratorState => {
    const lower = text.toLowerCase();
    const chaosKeywords = ["error", "bug", "broken", "fail", "crash", "wtf", "shit", "help", "stuck"];
    const listeningKeywords = ["listen", "check", "review", "examine", "?", "tell", "show", "explain"];

    const hasChaos = chaosKeywords.some((k) => lower.includes(k));
    const hasListening = listeningKeywords.some((k) => lower.includes(k));

    if (hasChaos) return "chaos";
    if (hasListening) return "listening";
    return "calm";
  };

  const handleSendMessage = () => {
    if (!input.trim() || isLoading) return;

    setMessages((prev) => [
      ...prev,
      { role: "user", content: input },
    ]);

    const detectedState = detectState(input);
    setState(detectedState);
    setUIState(detectedState);
    setIsLoading(true);

    // Analyze if UI morphing is needed
    const contextStr = messages.slice(-3).map(m => `${m.role}: ${m.content}`).join("\n");
    analyzeRequestMutation.mutate({
      userMessage: input,
      conversationContext: contextStr,
    });

    sendMessageMutation.mutate({
      conversationId,
      content: input,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      handleSendMessage();
    }
    if (e.key === "Escape") {
      setInput("");
    }
  };

  const getStateColor = (): string => {
    switch (state) {
      case "chaos":
        return "text-neon-magenta";
      case "listening":
        return "text-neon-cyan";
      case "calm":
      default:
        return "text-green-500";
    }
  };

  const getStateBgClass = (): string => {
    switch (state) {
      case "chaos":
        return "bg-neon-magenta/5 border-neon-magenta/50 backdrop-blur";
      case "listening":
        return "bg-neon-cyan/5 border-neon-cyan/50 backdrop-blur";
      case "calm":
      default:
        return "bg-card/50 border-neon-cyan/30 backdrop-blur";
    }
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* Status */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-neon-cyan/30 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${getStateColor()}`} />
          <span className={`text-xs font-mono ${getStateColor()}`}>{state.toUpperCase()}</span>
        </div>
        <span className="text-xs text-muted-foreground">{messages.length}</span>
      </div>

      {/* Messages - scrollable area */}
      <ScrollArea className="flex-1 overflow-hidden">
        <div className="px-3 py-2 space-y-3">
          {messagesLoading ? (
            <Card className="p-4 border-neon-cyan bg-card/50 text-center">
              <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-neon-cyan" />
              <p className="text-xs text-muted-foreground">Loading...</p>
            </Card>
          ) : messages.length === 0 ? (
            <Card className="p-4 border-neon-cyan bg-card/50 text-center">
              <Zap className="w-6 h-6 mx-auto mb-2 text-neon-cyan" />
              <p className="text-xs text-muted-foreground">Begin transmission.</p>
            </Card>
          ) : (
            messages.map((msg, idx) => (
              <div key={idx} className={`p-3 rounded border text-sm ${getStateBgClass()}`}>
                <div className="flex items-start gap-2 mb-2">
                  <Zap className={`w-3 h-3 flex-shrink-0 mt-0.5 ${msg.role === "user" ? "text-neon-magenta" : "text-neon-cyan"}`} />
                  <span className={`text-xs font-mono font-bold ${msg.role === "user" ? "text-neon-magenta" : "text-neon-cyan"}`}>
                    {msg.role === "user" ? "YOU" : "AI"}
                  </span>
                </div>
                <div className="text-xs text-foreground mb-1">
                  <Streamdown>{msg.content}</Streamdown>
                </div>
                {msg.role === "assistant" && (
                  <div className="mt-2 flex gap-2">
                    <VoiceOutput text={msg.content} />
                  </div>
                )}
              </div>
            ))
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Input - fixed at bottom */}
      <div className="flex gap-2 px-3 py-2 border-t border-neon-cyan/30 flex-shrink-0 bg-background/50">
        <Input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message..."
          className="border-neon-cyan bg-input text-foreground placeholder:text-muted-foreground text-sm"
          disabled={isLoading}
          autoFocus
        />
        <Button
          onClick={handleSendMessage}
          disabled={isLoading || !input.trim()}
          className="bg-neon-cyan hover:bg-neon-magenta text-background font-mono font-bold flex-shrink-0 px-3"
          size="sm"
        >
          {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
        </Button>
      </div>
    </div>
  );
}
