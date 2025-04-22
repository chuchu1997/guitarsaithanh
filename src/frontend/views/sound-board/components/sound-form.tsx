/** @format */

import { useState } from "react";
import { Button } from "@/components/ui/button"; // Giả sử bạn đã có Button từ ShadcnUI
import { Input } from "@/components/ui/input"; // Giả sử bạn đã có Input từ ShadcnUI
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"; // Đảm bảo import đầy đủ các phần của Select
import { useForm, Controller } from "react-hook-form"; // Import Controller để sử dụng với Select
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Schema của Zod
const formSchema = z.object({
  category: z.string().nonempty("Vui lòng chọn thể loại."),
  audio: z.instanceof(File, { message: "Vui lòng chọn một file âm thanh." }),
  name: z.string().min(1, "Tên âm thanh không được để trống."),
  image: z.instanceof(File, { message: "Vui lòng chọn hình ảnh." }),
});

const AudioForm = () => {
  const [fileName, setFileName] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = (data: any) => {
    console.log("Form Data:", data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Chọn thể loại */}
      <div>
        <label
          htmlFor="category"
          className="block text-sm font-medium text-gray-700">
          Thể loại
        </label>
        <Controller
          name="category"
          control={control}
          render={({ field }) => (
            <Select {...field}>
              <SelectTrigger className="mt-1 w-full">
                <SelectValue placeholder="Chọn thể loại" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="music">Nhạc</SelectItem>
                <SelectItem value="podcast">Podcast</SelectItem>
                <SelectItem value="audiobook">Sách nói</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        {errors.category && (
          <span className="text-red-500 text-sm">
            {errors.category.message}
          </span>
        )}
      </div>

      {/* Chọn file âm thanh */}
      <div>
        <label
          htmlFor="audio"
          className="block text-sm font-medium text-gray-700">
          File âm thanh
        </label>
        <Input
          id="audio"
          accept="audio/*"
          {...register("audio")}
          onChange={(e) => setFileName(e.target.files[0]?.name || "")}
          className="mt-1 w-full"
        />
        {errors.audio && (
          <span className="text-red-500 text-sm">{errors.audio.message}</span>
        )}
        {fileName && <p className="text-sm text-gray-600 mt-1">{fileName}</p>}
      </div>

      {/* Nhập tên âm thanh */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700">
          Tên âm thanh
        </label>
        <Input
          id="name"
          {...register("name")}
          placeholder="Nhập tên âm thanh"
          className="mt-1 w-full"
        />
        {errors.name && (
          <span className="text-red-500 text-sm">{errors.name.message}</span>
        )}
      </div>

      {/* Chọn hình ảnh cho âm thanh */}
      <div>
        <label
          htmlFor="image"
          className="block text-sm font-medium text-gray-700">
          Hình ảnh
        </label>
        <Input
          id="image"
          accept="image/*"
          {...register("image")}
          className="mt-1 w-full"
        />
        {errors.image && (
          <span className="text-red-500 text-sm">{errors.image.message}</span>
        )}
      </div>

      {/* Nút submit */}
      <Button type="submit" className="w-full">
        Tạo âm thanh mới
      </Button>
    </form>
  );
};

export default AudioForm;
