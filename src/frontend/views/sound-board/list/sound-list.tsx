/** @format */
import SoundButton from "@/components/sound-btn";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useSoundBoardStore, { CategorySoundData } from "@/hooks/use-sound-board";
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
  const soundBoardStore = useSoundBoardStore();
  return (
    <Tabs defaultValue={CategorySoundData[0].value} className="w-full">
      <TabsList className="flex space-x-4">
        {CategorySoundData.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className="text-base px-4"
          >
            {tab.name}
          </TabsTrigger>
        ))}
      </TabsList>

      {CategorySoundData.map((tab) => {
        const filteredSounds = soundBoardStore.items.filter(
          (sound) => sound.category === tab.value
        );

        return (
          <TabsContent key={tab.value} value={tab.value}>
            <div className="grid grid-cols-4 gap-4">
              {filteredSounds.map((sound) => (
                <SoundButton
                  key={sound.id}
                  name={sound.name}
                  path={sound.pathSound}
                />
              ))}
            </div>
          </TabsContent>
        );
      })}
    </Tabs>
  );
};

export default SoundListView;
