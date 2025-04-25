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
import { Label } from "@/components/ui/label";
import {
  Form,
  FormField,
  FormDescription,
  FormMessage,
  FormItem,
  FormControl,
  FormLabel,
} from "@/components/ui/form";
import useSettings from "@/hooks/use-settings";
import useSoundBoardStore, { CategorySoundData } from "@/hooks/use-sound-board";
import { v4 as uuidv4 } from "uuid";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const formSchema = z.object({
  nameSound: z.string().min(1),
  pathSound: z.string().min(1),
  category: z.string().min(1),
});

// Schema của Zod

const AudioForm = () => {
  const settingStore = useSettings();
  const soundBoardStore = useSoundBoardStore();
  const navigate = useNavigate(); // ✅ React Router navigate
  const [loading, setLoading] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nameSound: "",
      pathSound: "",
      category: "",
    },
  });
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.

    try {
      setLoading(true);

      const fileName = values.pathSound.split("\\").pop(); // Lấy phần cuối cùng của chuỗi
      const fullPath = `${settingStore.soundPath}\\${fileName}`;
      values.pathSound = fullPath;
      soundBoardStore.addItem({
        id: uuidv4(),
        name: values.nameSound,
        pathSound: values.pathSound,
        category: values.category,
      });
    } catch (err) {
      toast.error("Có lỗi  !!!!");
    } finally {
      setLoading(false);
      navigate("/sound");
    }
  }
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 max-w-md mx-auto">
        <FormField
          disabled={loading}
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Thể loại âm thanh </FormLabel>
              <FormControl>
                <Select
                  {...field}
                  onValueChange={field.onChange}
                  value={field.value}
                  defaultValue={field.value}>
                  <SelectTrigger className="mt-1 w-full">
                    <SelectValue placeholder="Chọn thể loại" />
                  </SelectTrigger>
                  <SelectContent>
                    {CategorySoundData.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          disabled={loading}
          control={form.control}
          name="nameSound"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tên âm thanh </FormLabel>
              <FormControl>
                <Input placeholder="tên âm thanh " {...field} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          disabled={loading}
          control={form.control}
          name="pathSound"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Đường dẫn âm thanh </FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="audio/*"
                  placeholder="Đường dẫn âm thanh "
                  {...field}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={loading}>
          Tạo mới âm thanh{" "}
        </Button>
      </form>
    </Form>
    // <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
    //   {/* Chọn thể loại */}
    //   <div className="grid w-full  items-center gap-1.5">
    //   <FormField
    //       control={form.control}
    //       name="username"
    //       render={({ field }) => (
    //         <FormItem>
    //           <FormLabel>Username</FormLabel>
    //           <FormControl>
    //             <Input placeholder="shadcn" {...field} />
    //           </FormControl>
    //           <FormDescription>
    //             This is your public display name.
    //           </FormDescription>
    //           <FormMessage />
    //         </FormItem>
    //       )}
    //     />
    //     <Label>Thể loại</Label>
    //     <Controller
    //       name="category"
    //       control={control}
    //       render={({ field }) => (
    //         <Select {...field}>
    //           <SelectTrigger className="mt-1 w-full">
    //             <SelectValue placeholder="Chọn thể loại" />
    //           </SelectTrigger>
    //           <SelectContent>
    //             <SelectItem value="tuongtac">Tương tác</SelectItem>
    //             <SelectItem value="thanhly">Thanh lý</SelectItem>
    //             <SelectItem value="diy">X7 Pro</SelectItem>
    //             <SelectItem value="st-x1">ST X1 Pro</SelectItem>
    //             <SelectItem value="x1-pro">X1 Pro</SelectItem>
    //             <SelectItem value="x2">X2</SelectItem>
    //             <SelectItem value="x4">X4 Pro</SelectItem>
    //             <SelectItem value="x7">X7 Pro</SelectItem>
    //           </SelectContent>
    //         </Select>
    //       )}
    //     />
    //   </div>

    //   <div className="flex flex-col gap-y-4">
    //     <div className="grid w-full  items-center gap-1.5">
    //       <Label>Tên âm thanh</Label>
    //       <Input />
    //     </div>
    //   </div>

    //   {/* Chọn file âm thanh */}
    //   <div className="grid w-full max-w-sm items-center gap-1.5">
    //     <Label htmlFor="picture">Chọn file âm thanh</Label>
    //     <Input id="picture" type="file" />
    //   </div>

    //   {/* Nút submit */}
    //   <Button type="submit" className="w-full">
    //     Tạo âm thanh mới
    //   </Button>
    // </form>
  );
};

export default AudioForm;
