"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

export function VODCommands({ thumbnail, title, publishedAt, duration, videoCommand, chatDownloadCommand, chatRenderCommand }: VODCommandsProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = async (command: string, label: string) => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(label);
      toast.success(`${label} copied to clipboard`);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      toast.error("Failed to copy command");
    }
  };

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
    <Card>
      <CardHeader>
        <div className="flex gap-4">
          <img
            src={thumbnail}
            alt={title}
            className="aspect-video w-48 rounded-lg object-cover"
          />
          <div className="flex-1">
            <CardTitle className="line-clamp-2">{title}</CardTitle>
            <CardDescription className="mt-1">
              {formatDate(publishedAt)} • {formatDuration(duration)}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 justify-start font-mono text-xs"
            onClick={() => copyToClipboard(videoCommand, "Video download command")}
          >
            {copied === "video" ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
            Video Download
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 justify-start font-mono text-xs"
            onClick={() => copyToClipboard(chatDownloadCommand, "Chat download command")}
          >
            {copied === "chat" ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
            Chat Download
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 justify-start font-mono text-xs"
            onClick={() => copyToClipboard(chatRenderCommand, "Chat render command")}
          >
            {copied === "render" ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
            Chat Render
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
