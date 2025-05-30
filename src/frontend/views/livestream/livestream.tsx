/** @format */

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import useLiveStreamStore from "@/hooks/use-livestream";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import LiveStreamForm from "./components/livestream-form";

const LivestreamSeedingView = () => {
  const items = useLiveStreamStore((state) => state.items);
  const addItem = useLiveStreamStore((state) => state.addItem);

  // const addLiveStream = useLiveStreamStore((state) => state.addLiveStream); // Cần có trong store
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");

  const handleCreate = () => {
    if (newName.trim() !== "") {
      // addLiveStream({ id: crypto.randomUUID(), name: newName });
      addItem({
        id: uuidv4(),
        linkLive: "",
        name: newName,
        comments: "",
        delay: 1,
        acceptDupplicateComment: false,
      });

      setNewName("");
      setDialogOpen(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow space-y-6">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-2xl font-bold text-gray-800">
          Cấu hình Seeding Livestream
        </h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">+ Tạo Livestream mới</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Nhập tên livestream</DialogTitle>
            </DialogHeader>
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Nhập tên livestream..."
            />
            <DialogFooter>
              <Button type="button" onClick={handleCreate}>
                Tạo
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="content-tabs">
        {items.length > 0 ? (
          <Tabs defaultValue={items[0].id} className="w-full">
            <TabsList>
              {items.map((item) => (
                <TabsTrigger key={item.id} value={item.id}>
                  {item.name}
                </TabsTrigger>
              ))}
            </TabsList>
            {items.map((item) => (
              <TabsContent key={item.id} value={item.id}>
                <LiveStreamForm id={item.id} />
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <div className="mt-4 p-4 border border-yellow-300 bg-yellow-100 text-yellow-700 rounded-xl text-sm">
            🚫 Hiện tại không có livestream nào được tạo. Vui lòng tạo mới một
            phiên livestream để bắt đầu.
          </div>
        )}
      </div>
    </div>
  );
};

export default LivestreamSeedingView;
