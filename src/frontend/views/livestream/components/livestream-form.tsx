/** @format */

import { useState } from "react";
import useChromeStore from "@/hooks/use-chromes";
import useLiveStreamStore from "@/hooks/use-livestream";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { DataTable } from "@/components/ui/data-table";
import { columns, LiveStreamColumn } from "./column";
import toast from "react-hot-toast";
interface LiveStreamPageProps {
  id: string;
}

const formSchema = z.object({
  comments: z.string().min(1, { message: "Không được để trống nội dung." }),
  delay: z.coerce.number().min(1, { message: "Delay tối thiểu là 1 giây" }),
  link: z.string().url({ message: "Link không hợp lệ" }),
});
const LivestreamSeedingView = (props: LiveStreamPageProps) => {
  const { id } = props;

  const [fileName, setFileName] = useState("");
  const chromeStore = useChromeStore();
  const [loading, setLoading] = useState(false);
  const liveStreamStore = useLiveStreamStore();
  const liveTarget = useLiveStreamStore((state) => state.getItemWithID(id));

  const [selected, setSelected] = useState<LiveStreamColumn[]>([]);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      comments: liveTarget.comments,
      delay: liveTarget.delay,
      link: liveTarget.linkLive,
    },
  });

  //   const chromeProfileAvailable = chromeStore.items.filter(
  //     (item) => item.injectLiveStream === "" || item.injectLiveStream === null
  //   );
  const chromeProfileAvailable = chromeStore.items.filter(
    (item) =>
      item.isOpen &&
      (!item.injectLiveStreamID || item.injectLiveStreamID === id)
  );

  const formatColumn: LiveStreamColumn[] = chromeProfileAvailable.map(
    (item) => ({
      id: item.id,
      name: item.username,
      proxy: item.proxy,
      pathProfile: item.pathProfile,
      injectLive: item.injectLiveStreamID,
      isOpen: item.isOpen,
      isCheckChooseChrome: item.injectLiveStreamID === id ? true : false,
    })
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file && file.name.endsWith(".txt")) {
      const reader = new FileReader();

      reader.onload = () => {
        const content = reader.result as string;

        // Lấy nội dung hiện tại trong field `comments`
        const currentComments = form.getValues("comments") || "";

        // Nối thêm nội dung mới, cách nhau bởi một dòng trống
        const updatedComments = [currentComments.trim(), content.trim()]
          .filter(Boolean)
          .join("\n");

        // Gán lại giá trị đã nối
        form.setValue("comments", updatedComments);

        setFileName(file.name);
      };

      reader.onerror = () => {
        console.error("Lỗi khi đọc file.");
      };

      reader.readAsText(file);
    } else {
      alert("Chỉ chấp nhận file .txt");
    }

    // Cho phép chọn lại cùng file nếu cần
    e.target.value = "";
  };

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    console.log("✅ Dữ liệu gửi:", data);

    if (!selected || selected.length === 0) {
      toast.error("Vui lòng chọn profile");
      return;
    }

    try {
      setLoading(true);

      // Cập nhật profile với livestream ID
      for (const select of selected) {
        const profile = chromeStore.getChromeProfileWithID(select.id);
        if (profile) {
          profile.injectLiveStreamID = id;
          chromeStore.updateItem(profile);
        }
      }

      // Cập nhật thông tin livestream
      liveStreamStore.update({
        id: liveTarget.id,
        linkLive: data.link,
        name: liveTarget.name,
        comments: data.comments,
        delay: data.delay,
      });
      // Gửi danh sách chrome profile để seeding livestream
      const profileIds = selected.map((select) => select.id);
      await backend.seedingLiveStream(
        profileIds,
        data.comments,
        data.delay,
        data.link
      );
      toast.success("✅Đã seeding livestream");
    } catch (error) {
      console.error("❌ Lỗi khi gửi dữ liệu:", error);
      toast.error("Đã xảy ra lỗi khi bắt đầu seeding");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        Seeding Livestream ({liveTarget.name})
      </h2>
      <DataTable
        onSelectionChange={(selected) => {
          setSelected(selected);
        }}
        searchKey="name"
        columns={columns}
        data={formatColumn}></DataTable>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <label className="font-medium">Tệp nội dung seeding (.txt)</label>
            <Input
              type="file"
              accept=".txt"
              onChange={handleFileChange}
              placeholder="ss"
            />
          </div>

          <FormField
            control={form.control}
            name="comments"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Nội dung bình luận (mỗi dòng là một bình luận)
                </FormLabel>
                <FormControl>
                  <Textarea
                    rows={6}
                    placeholder={`Ví dụ:\nSản phẩm này tuyệt vời quá!\nShop giao hàng nhanh ghê`}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
                <p className="text-sm text-gray-500">
                  Mỗi dòng sẽ được chọn ngẫu nhiên để bình luận.
                </p>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="delay"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Thời gian delay (giây)</FormLabel>
                <FormControl>
                  <Input type="number" min={1} className="w-32" {...field} />
                </FormControl>
                <FormMessage />
                <p className="text-sm text-gray-500">
                  Khoảng thời gian ngẫu nhiên giữa các comment của từng tài
                  khoản.
                </p>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="link"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Link livestream</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="Nhập link livestream"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="text-right">
            <Button type="submit" disabled={loading}>
              Bắt Đầu Seeding
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default LivestreamSeedingView;
