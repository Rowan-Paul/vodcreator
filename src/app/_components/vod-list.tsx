"use client";

import { useEffect, useState } from "react";
import { RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { VODCommands } from "./vod-commands";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import * as commands from "@/server/utils/commands";

interface VODListProps {
  channelId: string;
  channelName: string;
  avatarUrl: string | null;
  initialVodCount: number;
  latestVod: {
    id: string;
    thumbnail: string;
    title: string;
    publishedAt: Date;
    duration: number;
    vodId: string;
    url: string;
  } | null;
}

interface VODData {
  id: string;
  thumbnail: string;
  title: string;
  publishedAt: Date;
  duration: number;
  videoCommand: string;
  chatDownloadCommand: string;
  chatRenderCommand: string;
}

export function VODList({
  channelId,
  channelName,
  avatarUrl,
  initialVodCount,
  latestVod,
}: VODListProps) {
  const [offset, setOffset] = useState(0);
  const [vods, setVods] = useState<VODData[]>([]);
  const [hasMore, setHasMore] = useState(initialVodCount > 1);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [displayCount, setDisplayCount] = useState(1);

  const { data: settings } = api.twitch.getSettings.useQuery();
  const loadMoreVods = api.twitch.loadMoreVods.useMutation();
  const refreshChannelVods = api.twitch.refreshChannelVods.useMutation();
  const removeChannel = api.twitch.removeChannel.useMutation();

  const utils = api.useUtils();

  useEffect(() => {
    if (latestVod && vods.length === 0) {
      const vodData: VODData = {
        id: latestVod.id,
        thumbnail: latestVod.thumbnail,
        title: latestVod.title,
        publishedAt: latestVod.publishedAt,
        duration: latestVod.duration,
        videoCommand: commands.generateVideoCommand({
          vodId: latestVod.vodId,
          title: latestVod.title,
          publishedAt: latestVod.publishedAt,
        }),
        chatDownloadCommand: commands.generateChatDownloadCommand({
          vodId: latestVod.vodId,
        }),
        chatRenderCommand: commands.generateChatRenderCommand(
          {
            vodId: latestVod.vodId,
            title: latestVod.title,
            publishedAt: latestVod.publishedAt,
          },
          {
            chatWidth: settings?.chatWidth ?? 400,
            chatHeight: settings?.chatHeight ?? 350,
            chatFont: settings?.chatFont ?? "Arial",
          },
        ),
      };
      setVods([vodData]);
    }
  }, [latestVod, settings, vods.length]);

  const handleLoadMore = () => {
    const newOffset = offset + (settings?.vodsPerLoad ?? 5);
    const newDisplayCount = displayCount + (settings?.vodsPerLoad ?? 5);
    setOffset(newOffset);
    setDisplayCount(newDisplayCount);

    void loadMoreVods.mutate(
      { channelId, limit: settings?.vodsPerLoad ?? 5, offset: newOffset },
      {
        onSuccess: (newVods) => {
          setVods([...vods, ...newVods]);
          setHasMore(newVods.length === (settings?.vodsPerLoad ?? 5));
        },
      },
    );
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    void refreshChannelVods.mutate(
      { channelId, limit: settings?.vodsPerLoad ?? 5 },
      {
        onSuccess: ({ vods: newVods, hasMore: more }) => {
          setVods(newVods);
          setOffset(newVods.length);
          setHasMore(more);
          setDisplayCount(1);
          setIsRefreshing(false);
          toast.success(`Refreshed ${newVods.length} VODs`);
          void utils.twitch.listChannels.invalidate();
        },
        onError: (error) => {
          setIsRefreshing(false);
          toast.error(error.message);
        },
      },
    );
  };

  const handleRemove = () => {
    if (confirm(`Are you sure you want to remove channel "${channelName}"?`)) {
      void removeChannel.mutate(
        { channelId },
        {
          onSuccess: () => {
            toast.success(`Channel "${channelName}" removed`);
            void utils.twitch.listChannels.invalidate();
          },
        },
      );
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (isRefreshing || (vods.length === 0 && !latestVod)) {
    return (
      <Card className="border-[#1f1f23] bg-[#18181b]">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14 border-2 border-[#9146ff]">
                <AvatarImage src={avatarUrl ?? undefined} alt={channelName} />
                <AvatarFallback className="bg-[#9146ff]">
                  {getInitials(channelName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">{channelName}</h3>
                <p className="text-sm text-[#adadb8]">
                  {initialVodCount} {initialVodCount === 1 ? "VOD" : "VODs"} in
                  database
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="border-[#3f3f46] bg-[#0e0e10] text-white hover:bg-[#1f1f23]"
              >
                {isRefreshing ? (
                  <Spinner className="h-4 w-4" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleRemove}
                className="border-[#3f3f46] bg-[#0e0e10] text-white hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-[#1f1f23] bg-[#18181b]">
      <CardContent className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14 border-2 border-[#9146ff]">
              <AvatarImage src={avatarUrl ?? undefined} alt={channelName} />
              <AvatarFallback className="bg-[#9146ff]">
                {getInitials(channelName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{channelName}</h3>
              <p className="text-sm text-[#adadb8]">
                {initialVodCount} {initialVodCount === 1 ? "VOD" : "VODs"} in
                database
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="border-[#3f3f46] bg-[#0e0e10] text-white hover:bg-[#1f1f23]"
            >
              {isRefreshing ? (
                <Spinner className="h-4 w-4" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleRemove}
              className="border-[#3f3f46] bg-[#0e0e10] text-white hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {vods.slice(0, displayCount).map((vod, index) => (
            <div key={vod.id}>
              <VODCommands
                thumbnail={vod.thumbnail}
                title={vod.title}
                publishedAt={vod.publishedAt}
                duration={vod.duration}
                videoCommand={vod.videoCommand}
                chatDownloadCommand={vod.chatDownloadCommand}
                chatRenderCommand={vod.chatRenderCommand}
              />
              {index < displayCount - 1 && (
                <Separator className="my-6 bg-[#1f1f23]" />
              )}
            </div>
          ))}
        </div>

        {hasMore && displayCount < vods.length && (
          <div className="mt-6 text-center">
            <Button
              variant="outline"
              onClick={handleLoadMore}
              disabled={loadMoreVods.isPending}
              className="border-[#3f3f46] bg-[#0e0e10] text-white hover:bg-[#1f1f23]"
            >
              {loadMoreVods.isPending ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Loading...
                </>
              ) : (
                "Load More VODs"
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
