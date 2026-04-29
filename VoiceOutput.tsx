import { useEffect, useState } from "react";
import { Volume2, VolumeX, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ttsManager } from "@/lib/textToSpeech";

interface VoiceOutputProps {
  text: string;
  autoPlay?: boolean;
  onStart?: () => void;
  onEnd?: () => void;
}

export function VoiceOutput({ text, autoPlay = false, onStart, onEnd }: VoiceOutputProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    if (autoPlay && text) {
      handleSpeak();
    }
  }, [text, autoPlay]);

  const handleSpeak = async () => {
    try {
      setIsSpeaking(true);
      onStart?.();
      await ttsManager.speak(text, { rate: 1, pitch: 1, volume: 1 });
      setIsSpeaking(false);
      setIsPaused(false);
      onEnd?.();
    } catch (error) {
      console.error("TTS Error:", error);
      setIsSupported(false);
      setIsSpeaking(false);
    }
  };

  const handlePause = () => {
    if (isSpeaking && !isPaused) {
      ttsManager.pause();
      setIsPaused(true);
    }
  };

  const handleResume = () => {
    if (isPaused) {
      ttsManager.resume();
      setIsPaused(false);
    }
  };

  const handleStop = () => {
    ttsManager.stop();
    setIsSpeaking(false);
    setIsPaused(false);
    onEnd?.();
  };

  if (!isSupported) {
    return null;
  }

  return (
    <div className="flex gap-2 items-center">
      {!isSpeaking ? (
        <Button
          size="sm"
          variant="outline"
          onClick={handleSpeak}
          className="border-neon-cyan text-neon-cyan hover:bg-neon-cyan/10"
        >
          <Volume2 className="w-4 h-4 mr-1" />
          Speak
        </Button>
      ) : (
        <>
          {!isPaused ? (
            <Button
              size="sm"
              variant="outline"
              onClick={handlePause}
              className="border-neon-cyan text-neon-cyan hover:bg-neon-cyan/10"
            >
              <Pause className="w-4 h-4 mr-1" />
              Pause
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={handleResume}
              className="border-neon-cyan text-neon-cyan hover:bg-neon-cyan/10"
            >
              <Play className="w-4 h-4 mr-1" />
              Resume
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={handleStop}
            className="border-neon-magenta text-neon-magenta hover:bg-neon-magenta/10"
          >
            <VolumeX className="w-4 h-4 mr-1" />
            Stop
          </Button>
        </>
      )}
    </div>
  );
}
