"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { VODCommands } from "./vod-commands";
import { api } from "@/trpc/react";
import { useVodStore } from "@/app/_stores/vod-store";
import { toast } from "sonner";
import * as commands from "@/server/utils/commands";

interface VODListProps {
  channelId: string;
}

export function VODList({ channelId }: VODListProps) {
  const channel = useVodStore((state) =>
    state.channels.find((entry) => entry.id === channelId),
  );
  const settings = useVodStore((state) => state.settings);
  const replaceChannelVods = useVodStore((state) => state.replaceChannelVods);
  const appendChannelVods = useVodStore((state) => state.appendChannelVods);
  const removeChannel = useVodStore((state) => state.removeChannel);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [displayCount, setDisplayCount] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const hasCheckedRefresh = useRef(false);
  const hasAttemptedInitialLoad = useRef(false);

  const getChannelVods = api.twitch.getChannelVods.useMutation();

  const visibleVods = useMemo(() => {
    if (!channel) return [];
    return channel.vods.slice(0, displayCount).map((vod) => ({
      ...vod,
      publishedAt: new Date(vod.publishedAt),
      videoCommand: commands.generateVideoCommand({
        vodId: vod.vodId,
        title: vod.title,
        publishedAt: new Date(vod.publishedAt),
      }),
      chatDownloadCommand: commands.generateChatDownloadCommand({
        vodId: vod.vodId,
      }),
      chatRenderCommand: commands.generateChatRenderCommand(
        {
          vodId: vod.vodId,
          title: vod.title,
          publishedAt: new Date(vod.publishedAt),
        },
        settings,
      ),
    }));
  }, [channel, displayCount, settings]);

  const handleRefresh = useCallback(
    async (showLoading = true) => {
      if (!channel) return;
      if (showLoading) {
        setIsRefreshing(true);
      }

      try {
        const result = await getChannelVods.mutateAsync({
          twitchId: channel.twitchId,
          limit: settings.vodsPerLoad,
          offset: 0,
        });

        replaceChannelVods(
          channel.id,
          result.vods.map((vod) => ({
            ...vod,
            publishedAt: vod.publishedAt.toISOString(),
          })),
          result.hasMore,
        );
        setDisplayCount(1);
        toast.success(`Refreshed ${result.vods.length} VODs`);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Refresh failed");
      } finally {
        if (showLoading) {
          setIsRefreshing(false);
        }
      }
    },
    [channel, getChannelVods, replaceChannelVods, settings.vodsPerLoad],
  );

  useEffect(() => {
    if (!channel) return;
    if (channel.vods.length === 0 && !hasAttemptedInitialLoad.current) {
      hasAttemptedInitialLoad.current = true;
      void handleRefresh(false);
    }
  }, [channel, handleRefresh]);

  useEffect(() => {
    if (!channel || channel.vods.length === 0 || hasCheckedRefresh.current) return;
    hasCheckedRefresh.current = true;
    const latest = channel.vods[0];
    if (!latest) return;

    const hoursSincePublished =
      (Date.now() - new Date(latest.publishedAt).getTime()) / (1000 * 60 * 60);
    if (hoursSincePublished > 12) {
      void handleRefresh(false);
    }
  }, [channel, handleRefresh]);

  if (!channel) return null;

  const canLoadMore = displayCount < channel.vods.length || channel.hasMore;

  const handleLoadMore = async () => {
    const desired = displayCount + settings.vodsPerLoad;
    if (desired <= channel.vods.length) {
      setDisplayCount(desired);
      return;
    }
    if (!channel.hasMore) {
      setDisplayCount(channel.vods.length);
      return;
    }

    setIsLoadingMore(true);
    try {
      const result = await getChannelVods.mutateAsync({
        twitchId: channel.twitchId,
        limit: settings.vodsPerLoad,
        offset: channel.vods.length,
      });

      appendChannelVods(
        channel.id,
        result.vods.map((vod) => ({
          ...vod,
          publishedAt: vod.publishedAt.toISOString(),
        })),
        result.hasMore,
      );
      setDisplayCount(desired);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load VODs");
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleRemove = () => {
    if (confirm(`Are you sure you want to remove channel "${channel.name}"?`)) {
      removeChannel(channel.id);
      toast.success(`Channel "${channel.name}" removed`);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((entry) => entry[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (isRefreshing || channel.vods.length === 0) {
    return (
      <Card className="border-[#1f1f23] bg-[#18181b]">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14 border-2 border-[#9146ff]">
                <AvatarImage src={channel.avatarUrl ?? undefined} alt={channel.name} />
                <AvatarFallback className="bg-[#9146ff]">
                  {getInitials(channel.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">{channel.name}</h3>
                <p className="text-sm text-[#adadb8]">
                  {channel.vods.length} {channel.vods.length === 1 ? "VOD" : "VODs"}{" "}
                  saved
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => void handleRefresh(true)}
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
              <AvatarImage src={channel.avatarUrl ?? undefined} alt={channel.name} />
              <AvatarFallback className="bg-[#9146ff]">
                {getInitials(channel.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{channel.name}</h3>
              <p className="text-sm text-[#adadb8]">
                {channel.vods.length} {channel.vods.length === 1 ? "VOD" : "VODs"} saved
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => void handleRefresh(true)}
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
          {visibleVods.map((vod, index) => (
            <div key={vod.vodId}>
              <VODCommands
                thumbnail={vod.thumbnail}
                title={vod.title}
                publishedAt={vod.publishedAt}
                duration={vod.duration}
                videoCommand={vod.videoCommand}
                chatDownloadCommand={vod.chatDownloadCommand}
                chatRenderCommand={vod.chatRenderCommand}
              />
              {index < visibleVods.length - 1 && (
                <Separator className="my-6 bg-[#1f1f23]" />
              )}
            </div>
          ))}
        </div>

        {canLoadMore && (
          <div className="mt-6 text-center">
            <Button
              variant="outline"
              onClick={() => void handleLoadMore()}
              disabled={isLoadingMore}
              className="border-[#3f3f46] bg-[#0e0e10] text-white hover:bg-[#1f1f23]"
            >
              {isLoadingMore ? (
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
