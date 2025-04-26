"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

type LogItem = {
  id: number;
  message: string;
  type: "info" | "warning" | "error";
};

const LogStatusComponent = () => {
  const [logs, setLogs] = useState<LogItem[]>([]);
  const endOfLogsRef = useRef<HTMLDivElement>(null); // Tạo ref cho phần cuối của log


  useEffect(() => {
    let counter = 0;
    backend.onLogUpdate((log: string) => {
      const type: LogItem["type"] = log.toLowerCase().includes("error")
        ? "error"
        : log.toLowerCase().includes("warning")
        ? "warning"
        : "info";

      setLogs((prev) => [
        ...prev,
        { id: counter++, message: log, type }
      ]);
    });
  }, []);
  useEffect(() => {
    // Cuộn xuống cuối mỗi khi logs thay đổi
    if (endOfLogsRef.current) {
      endOfLogsRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  return (
    <Card className="h-[300px]">
      <CardHeader>
        <CardTitle>Trạng thái seeding livestream</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[230px] px-4 py-2">
          <div className="flex flex-col gap-2">
            {logs.map((log) => (
              <div key={log.id} className="text-sm flex items-center gap-2">
                <Badge variant={
                  log.type === "error" ? "destructive" :
                  log.type === "warning" ? "secondary" : "outline"
                }>
                  {log.type.toUpperCase()}
                </Badge>
                <span>{log.message}</span>
              </div>
            ))}
               {/* Đặt phần tử cuối cùng để tự động cuộn xuống */}
               <div ref={endOfLogsRef} />
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default LogStatusComponent;
