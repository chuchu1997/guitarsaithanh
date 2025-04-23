/** @format */

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import useChromeStore from "@/hooks/use-chromes";
const LivestreamSeedingView = () => {
  const [comments, setComments] = useState("");
  const [delay, setDelay] = useState("3");
  const [fileName, setFileName] = useState("");
  const chromeStore = useChromeStore();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      setFileName(e.target.files[0].name);
      // Xử lý file đọc nội dung ở đây nếu cần
    }
  };

  const handleStart = async () => {
    // const commentList = comments
    //   .split("\n")
    //   .map((c) => c.trim())
    //   .filter((c) => c.length > 0);
    // if (commentList.length === 0) {
    //   alert("Vui lòng nhập ít nhất một nội dung seeding.");
    //   return;
    // }
    // TODO: Trigger Chrome tabs + seeding logic
    // console.log("Seeding với các bình luận:", commentList);
    // console.log("Delay mỗi bình luận:", delay, "giây");
    // await backend.openChromeWithProfile(chromeStore.items[0].username,)
    const profile = chromeStore.items[0];
    console.log("PROFILE", profile);

    const driverID = await backend.openChromeWithProfile(
      profile.pathProfile,
      profile.proxy,
      "https://happyfurniture.logtech.vn"
    );
    console.log("DR ID", driverID);
    // console.log("ITYEM", ); profilePath: string, proxyPath?: string, linkOpenChrome?
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        Cấu hình Seeding Livestream
      </h2>

      {/* Nhập nội dung bình luận */}
      <div>
        <div className="space-y-2">
          <label className="font-medium">Tệp nội dung seeding (.txt)</label>
          <Input
            type="file"
            accept=".txt"
            onChange={handleFileChange}
            placeholder="ss"
          />
          {fileName && (
            <p className="text-sm text-gray-500">Đã chọn: {fileName}</p>
          )}
        </div>

        <Label
          htmlFor="comments"
          className="mb-1 block text-sm font-medium mt-4">
          Nội dung bình luận (mỗi dòng là một bình luận)
        </Label>
        <Textarea
          id="comments"
          rows={6}
          placeholder={`Ví dụ:\nSản phẩm này tuyệt vời quá!\nShop giao hàng nhanh ghê\nĐang xem livestream nè\nChốt đơn đi mọi người`}
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          className="resize-none"
        />
        <p className="text-sm text-gray-500 mt-1">
          Mỗi dòng sẽ được chọn ngẫu nhiên để bình luận.
        </p>
      </div>

      {/* Delay giữa các bình luận */}
      <div>
        <Label htmlFor="delay" className="mb-1 block text-sm font-medium">
          Thời gian delay (giây)
        </Label>
        <Input
          type="number"
          min={1}
          value={delay}
          onChange={(e) => setDelay(e.target.value)}
          className="w-32"
        />
        <p className="text-sm text-gray-500 mt-1">
          Khoảng thời gian ngẫu nhiên giữa các comment của từng tài khoản.
        </p>
      </div>

      <div className="space-y-2">
        <label className="font-medium">Link livestream</label>
        <Input type="text" placeholder="Nhập link livestream" />
      </div>

      {/* Bắt đầu seeding */}
      <div className="text-right">
        <Button onClick={handleStart}>Hoàn tất và bắt đầu seeding</Button>
      </div>
    </div>
  );
};

export default LivestreamSeedingView;
