/** @format */
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Laugh,
  Flame,
  Volume2,
  HandPlatter,
  Star,
  Heart,
  Bell,
  Zap,
  Megaphone,
  Trophy,
} from "lucide-react";
import { useState } from "react";

type Sound = {
  id: number;
  label: string;
  file: string;
  icon: React.ReactNode;
};

const SoundListView = () => {
  const funSounds: Sound[] = [
    {
      id: 1,
      label: "Vỗ tay",
      file: "/sounds/clap.mp3",
      icon: <HandPlatter className="w-10 h-10" />,
    },
    {
      id: 2,
      label: "Cười lớn",
      file: "/sounds/laugh.mp3",
      icon: <Laugh className="w-10 h-10" />,
    },
    {
      id: 3,
      label: "Quá đỉnh",
      file: "/sounds/fire.mp3",
      icon: <Flame className="w-10 h-10" />,
    },
    {
      id: 4,
      label: "Thả tim",
      file: "/sounds/heart.mp3",
      icon: <Heart className="w-10 h-10" />,
    },
    {
      id: 5,
      label: "Sấm sét",
      file: "/sounds/zap.mp3",
      icon: <Zap className="w-10 h-10" />,
    },
  ];

  const actionSounds: Sound[] = [
    {
      id: 6,
      label: "Chốt đơn",
      file: "/sounds/chot-don.mp3",
      icon: <Volume2 className="w-10 h-10" />,
    },
    {
      id: 7,
      label: "Thông báo",
      file: "/sounds/bell.mp3",
      icon: <Bell className="w-10 h-10" />,
    },
    {
      id: 8,
      label: "Quảng bá",
      file: "/sounds/megaphone.mp3",
      icon: <Megaphone className="w-10 h-10" />,
    },
    {
      id: 9,
      label: "Thành tích",
      file: "/sounds/trophy.mp3",
      icon: <Trophy className="w-10 h-10" />,
    },
    {
      id: 10,
      label: "5 sao",
      file: "/sounds/star.mp3",
      icon: <Star className="w-10 h-10" />,
    },
  ];

  const SoundGrid = ({ sounds }: { sounds: Sound[] }) => {
    const [currentSound, setCurrentSound] = useState<HTMLAudioElement | null>(
      null
    );

    const playSound = (file: string) => {
      if (currentSound) {
        currentSound.pause();
        currentSound.currentTime = 0;
      }
      const audio = new Audio(file);
      setCurrentSound(audio);
      audio.play();
    };

    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
        {sounds.map((sound) => (
          <button
            key={sound.id}
            onClick={() => playSound(sound.file)}
            className="aspect-square w-full flex flex-col items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 hover:scale-105 transition-all shadow-md text-white p-4">
            {sound.icon}
            <span className="text-sm font-semibold">{sound.label}</span>
          </button>
        ))}
      </div>
    );
  };
  return (
    <Tabs defaultValue="fun" className="w-full">
      <TabsList className="flex justify-center gap-2 mb-4">
        <TabsTrigger value="fun" className="text-base px-4">
          Vui nhộn
        </TabsTrigger>
        <TabsTrigger value="action" className="text-base px-4">
          Hành động
        </TabsTrigger>
      </TabsList>

      <TabsContent value="fun">
        <SoundGrid sounds={funSounds} />
      </TabsContent>

      <TabsContent value="action">
        <SoundGrid sounds={actionSounds} />
      </TabsContent>
    </Tabs>
  );
};

export default SoundListView;
