/** @format */

import {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogContent,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import useExcuteStore from "@/hooks/use-excute";
import meoGif from "../images/meo.gif";
import { DialogTitle } from "@radix-ui/react-dialog";

export const LoadingOverlay = () => {
  const isLoading = useExcuteStore((state) => state.isLoading);
  const message = useExcuteStore((state) => state.messageExcute);
  console.log("Loading state:", isLoading); // Thêm log để kiểm tra

  return (
    <Dialog open={isLoading}>
      <DialogPortal>
        <DialogTitle></DialogTitle>
        <DialogOverlay className="bg-black/50 fixed inset-0 z-50" />
        <DialogContent className="border-0 shadow-none bg-transparent p-0 flex flex-col items-center justify-center gap-4 [&>button]:hidden">
          <div className="flex flex-col items-center justify-center">
            {/* GIF animation */}
            <img
              src={meoGif}
              alt="Seeding Loading"
              className="w-24 h-24 object-contain mb-4 rounded-lg"
            />

            <Loader2 className="h-20 w-20 animate-spin text-white" />
            <div className="text-white text-xl font-bold tracking-wide mt-2 text-center drop-shadow-lg animate-pulse">
              {message}
              <br /> vui lòng đợi giây lát...
            </div>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
};
