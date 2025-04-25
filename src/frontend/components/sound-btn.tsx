// components/SoundButton.tsx
import { Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AlertModal } from "./modals/alert-modal";
import useSoundBoardStore from "@/hooks/use-sound-board";

interface SoundButtonProps {
  name: string;
  path: string;
}

export default function SoundButton({ name, path }: SoundButtonProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const holdTimerRef = useRef<number | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const soundBoardStore = useSoundBoardStore();
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      if (holdTimerRef.current !== null) {
        clearTimeout(holdTimerRef.current);
      }
    };
  }, []);
  const togglePlay = async () => {
    if (!audioRef.current) {
      const audioSrc: string = await backend.loadAudio(path);
      audioRef.current = new Audio(audioSrc);
    }

    if (playing) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setPlaying(true))
        .catch(console.error);
    }
  };

  const handleMouseDown = () => {
    holdTimerRef.current = window.setTimeout(() => {
      setShowDeleteDialog(true);
    }, 800);
  };

  const handleMouseUp = () => {
    if (holdTimerRef.current !== null) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  };
  const onDelete = () => {
    soundBoardStore.deleteItem(name);
  };

  return (
    <>
      <AlertModal
        loading={false}
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={() => {
          onDelete();
          setShowDeleteDialog(false);
          //   onDelete();
          //   setOpen(false);
        }}
      />

      <button
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={togglePlay}
        className="flex items-center h-[100px] gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all"
      >
        {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        <span className="text-sm truncate max-w-[120px]">{name}</span>
      </button>
    </>
  );
}
