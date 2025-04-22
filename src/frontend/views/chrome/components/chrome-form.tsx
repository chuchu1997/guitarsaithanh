"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
  } from "@/components/ui/form"
  import { Button } from "@/components/ui/button"
  import { Input } from "@/components/ui/input"
import { useState } from "react"

const formSchema = z.object({

  username:z.string().min(2),
  proxy:z.string().optional(),
  path:z.string().min(2)
})

export function ChromeProfileForm() {
 
  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
    },
  })

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 lg:w-1/2 mx-auto w-full">
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
                <Input placeholder="Nếu có thì nhập không thì thôi !!! " {...field} />
              </FormControl>
          
              <FormMessage />
            </FormItem>
          )}
        />
            <FormField
          control={form.control}
          name="path"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Đường dẫn của profile</FormLabel>
              <FormControl>
              <div className="flex items-center">
              {/* Hiển thị đường dẫn đã chọn */}
              <Input
                {...field}
                value={ field.value}
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
        <Button type="submit" className = "w-full">Hoàn tất </Button>
      </form>
    </Form>
  )
}
