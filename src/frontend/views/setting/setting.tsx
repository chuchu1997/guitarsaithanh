/** @format */

import { useEffect } from "react";
import { Button } from "@/components/ui/button"; // Giả sử bạn đã có Button từ ShadcnUI
import { Input } from "@/components/ui/input"; // Giả sử bạn đã có Input từ ShadcnUI
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import useSettings from "@/hooks/use-settings";
import toast from "react-hot-toast";

// Schema của Zod
const formSchema = z.object({
  profilePath: z.string().min(1, "Vui lòng nhập đường dẫn lưu profile."),
  soundPath: z.string().min(1, "Vui lòng nhập đường dẫn lưu âm thanh."),
  imagePath: z.string().min(1, "Vui lòng nhập đường dẫn lưu hình ảnh ."),
});

const SettingsView = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue, // Dùng để set giá trị mặc định cho form
  } = useForm({
    resolver: zodResolver(formSchema),
  });
  const {
    profilePath,
    soundPath,
    imagePath,
    updateProfilePath,
    updateSoundPath,
    updateImagePath,
  } = useSettings();

  useEffect(() => {
    setValue("profilePath", profilePath ?? "");
    setValue("soundPath", soundPath ?? "");
    setValue("imagePath", imagePath ?? "");
  }, [profilePath, soundPath, setValue, imagePath]);

  const onSubmit = (data: any) => {
    // Lưu lại đường dẫn, có thể lưu vào LocalStorage, API, hoặc Redux state

    updateProfilePath(data.profilePath);
    updateSoundPath(data.soundPath);
    updateImagePath(data.imagePath);
    toast.success("Đã cập nhật đường dẫn thành công !!");
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Cài Đặt</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Đường dẫn Profile */}
        <div>
          <label
            htmlFor="profilePath"
            className="block text-sm font-medium text-gray-700">
            Đường dẫn lưu Profile
          </label>
          <Input
            id="profilePath"
            {...register("profilePath")}
            placeholder="Nhập đường dẫn lưu profile"
            className="mt-1 w-full"
          />
          {errors.profilePath && (
            <span className="text-red-500 text-sm">
              {errors.profilePath.message}
            </span>
          )}
        </div>

        {/* Đường dẫn Sound */}
        <div>
          <label
            htmlFor="soundPath"
            className="block text-sm font-medium text-gray-700">
            Đường dẫn lưu Âm Thanh
          </label>
          <Input
            id="soundPath"
            {...register("soundPath")}
            placeholder="Nhập đường dẫn lưu âm thanh"
            className="mt-1 w-full"
          />
          {errors.soundPath && (
            <span className="text-red-500 text-sm">
              {errors.soundPath.message}
            </span>
          )}
        </div>

        <div>
          <label
            htmlFor="imagePath"
            className="block text-sm font-medium text-gray-700">
            Đường dẫn lưu hình ảnh
          </label>
          <Input
            id="imagePath"
            {...register("imagePath")}
            placeholder="Nhập đường dẫn lưu hình ảnh "
            className="mt-1 w-full"
          />
          {errors.imagePath && (
            <span className="text-red-500 text-sm">
              {errors.imagePath.message}
            </span>
          )}
        </div>

        {/* Nút Submit */}
        <Button type="submit" className="w-full">
          Lưu Cài Đặt
        </Button>
      </form>
    </div>
  );
};

export default SettingsView;
