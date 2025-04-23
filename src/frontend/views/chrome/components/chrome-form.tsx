/** @format */

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useSettings from "@/hooks/use-settings";
import { v4 as uuidv4 } from "uuid";
import { useNavigate, useParams } from "react-router-dom";

import useChromeStore, { ChromeProfile } from "@/hooks/use-chromes";
import { useState } from "react";
import { AlertModal } from "@/components/modals/alert-modal";
import HeadingComponent from "@/components/ui/heading";
import { Trash } from "lucide-react";
import toast from "react-hot-toast";
import { Separator } from "@/components/ui/separator";

interface ChromeFormProps {
  initialData: ChromeProfile | null;
}
const formSchema = z.object({
  id: z.string(),
  username: z.string().min(2),
  proxy: z.string(),
  pathProfile: z.string(),
});

export const ChromeProfileForm: React.FC<ChromeFormProps> = ({
  initialData,
}) => {
  const settingStore = useSettings();
  const chromeStore = useChromeStore();
  const title = initialData ? "Chỉnh sửa profile" : "Tạo mới Profile";
  const action = initialData ? "Lưu thay đổi" : "Tạo mới profile";
  const navigate = useNavigate(); // ✅ React Router navigate
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),

    defaultValues: initialData
      ? {
          ...initialData,
        }
      : {
          id: uuidv4(),
          username: "",
          proxy: "",
          pathProfile: settingStore.profilePath ?? "",
        },
  });

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    try {
      setLoading(true);
      const profile: ChromeProfile = {
        id: values.id,
        username: values.username,
        proxy: values.proxy ?? "",
        pathProfile: values.pathProfile,
      };

      if (profile) {
        if (initialData) {
          chromeStore.updateItem(profile);
          //EDIT
        } else {
          await chromeStore.addItem(profile);
        }
      }
    } catch (err) {
      toast.error("Có lỗi  !!!!");
    } finally {
      setLoading(false);
      navigate("/chrome");
    }
  }
  const onDelete = async () => {
    try {
      setLoading(true);
      chromeStore.removeItem(initialData.id);

      navigate("/chrome");
    } catch (err) {
      toast.error(
        "Make sure you removed all categories using this billboard first !!"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lg:w-1/2 mx-auto w-full flex flex-col gap-4">
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        loading={loading}
        onConfirm={async () => {
          await onDelete();
          setOpen(false);
        }}
      />
      <div className="flex items-center justify-between my-4">
        <HeadingComponent title={title} />
        {/* BUTTON DELETE JUST WORKING ON EDIT MODE  */}
        {initialData && (
          <Button
            variant="destructive"
            size="icon"
            disabled={loading}
            onClick={async () => {
              setOpen(true);
            }}>
            <Trash className="w-4 h-4 "></Trash>
          </Button>
        )}
      </div>

      <Separator />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 ">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tên nick tiktok (chrome) </FormLabel>
                <FormControl>
                  <Input placeholder="Nhập tên của nick tiktok" {...field} />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="proxy"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Proxy</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Nếu có thì nhập không thì thôi !!! "
                    {...field}
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="pathProfile"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Đường dẫn của profile</FormLabel>
                <FormControl>
                  <div className="flex items-center">
                    {/* Hiển thị đường dẫn đã chọn */}
                    <Input
                      {...field}
                      disabled
                      value={field.value}
                      placeholder="Đường dẫn profile ..."
                      readOnly // Để không cho phép người dùng chỉnh sửa trực tiếp
                      className="mr-2"
                    />
                  </div>
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {action}
          </Button>
        </form>
      </Form>
    </div>
  );
};
