"use client";

import { Check, Copy, Download, MessageSquare, Play } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

interface VODCommandsProps {
  thumbnail: string;
  title: string;
  publishedAt: Date;
  duration: number;
  videoCommand: string;
  chatDownloadCommand: string;
  chatRenderCommand: string;
}

export function VODCommands({
  thumbnail,
  title,
  publishedAt,
  duration,
  videoCommand,
  chatDownloadCommand,
  chatRenderCommand,
}: VODCommandsProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const copiedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (copiedTimer.current) clearTimeout(copiedTimer.current);
    },
    [],
  );

  const copyToClipboard = async (command: string, label: string) => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(label);
      toast.success(`${label} copied to clipboard`);
      if (copiedTimer.current) clearTimeout(copiedTimer.current);
      copiedTimer.current = setTimeout(() => setCopied(null), 2000);
    } catch {
      toast.error("Failed to copy command");
    }
  };

  const handleVideoCopy = () => copyToClipboard(videoCommand, "video");
  const handleChatCopy = () => copyToClipboard(chatDownloadCommand, "chat");
  const handleRenderCopy = () => copyToClipboard(chatRenderCommand, "render");

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    return `${minutes}m ${secs}s`;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  return (
    <Card className="border-[#1f1f23] bg-[#0e0e10]">
      <CardContent className="p-6">
        <div className="flex flex-col gap-6 xl:flex-row">
          <div className="relative flex-shrink-0">
            <Image
              src={thumbnail}
              alt={title}
              width={640}
              height={360}
              sizes="(min-width: 1280px) 256px, 100vw"
              className="aspect-video w-full rounded-lg object-cover shadow-md xl:w-64"
            />
            <div className="absolute right-2 bottom-2 rounded bg-black/80 px-2 py-1 text-xs font-medium">
              {formatDuration(duration)}
            </div>
          </div>
          <div className="flex min-w-0 flex-1 flex-col justify-between">
            <div className="space-y-2">
              <h4 className="leading-tight font-semibold">{title}</h4>
              <p className="text-sm text-[#adadb8]">
                {formatDate(publishedAt)}
              </p>
            </div>

            <div className="grid gap-2 sm:grid-cols-3">
              <Button
                variant="outline"
                size="sm"
                className="justify-start gap-2 border-[#3f3f46] bg-[#18181b] text-white hover:bg-[#1f1f23]"
                onClick={handleVideoCopy}
              >
                <Play className="h-4 w-4 shrink-0 text-[#9146ff]" />
                <div className="flex min-w-0 flex-1 flex-col items-start gap-0.5 overflow-hidden">
                  <span className="truncate text-xs font-medium">
                    Video Download
                  </span>
                  <span className="truncate text-[10px] text-[#adadb8]">
                    {copied === "video" ? "Copied!" : "Click to copy"}
                  </span>
                </div>
                {copied === "video" ? (
                  <Check className="ml-1 h-3 w-3 shrink-0 text-green-500" />
                ) : (
                  <Copy className="ml-1 h-3 w-3 shrink-0 opacity-50" />
                )}
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="justify-start gap-2 border-[#3f3f46] bg-[#18181b] text-white hover:bg-[#1f1f23]"
                onClick={handleChatCopy}
              >
                <Download className="h-4 w-4 shrink-0 text-[#9146ff]" />
                <div className="flex min-w-0 flex-1 flex-col items-start gap-0.5 overflow-hidden">
                  <span className="truncate text-xs font-medium">
                    Chat Download
                  </span>
                  <span className="truncate text-[10px] text-[#adadb8]">
                    {copied === "chat" ? "Copied!" : "Click to copy"}
                  </span>
                </div>
                {copied === "chat" ? (
                  <Check className="ml-1 h-3 w-3 shrink-0 text-green-500" />
                ) : (
                  <Copy className="ml-1 h-3 w-3 shrink-0 opacity-50" />
                )}
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="justify-start gap-2 border-[#3f3f46] bg-[#18181b] text-white hover:bg-[#1f1f23]"
                onClick={handleRenderCopy}
              >
                <MessageSquare className="h-4 w-4 shrink-0 text-[#9146ff]" />
                <div className="flex min-w-0 flex-1 flex-col items-start gap-0.5 overflow-hidden">
                  <span className="truncate text-xs font-medium">
                    Chat Render
                  </span>
                  <span className="truncate text-[10px] text-[#adadb8]">
                    {copied === "render" ? "Copied!" : "Click to copy"}
                  </span>
                </div>
                {copied === "render" ? (
                  <Check className="ml-1 h-3 w-3 shrink-0 text-green-500" />
                ) : (
                  <Copy className="ml-1 h-3 w-3 shrink-0 opacity-50" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
