"use client";

import { useMemo } from "react";
import { RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { VODCommands } from "@/app/_components/vod-commands";
import { useChannelVods } from "@/app/_hooks/use-channel-vods";
import { useVodStore } from "@/app/_stores/vod-store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { createVodCommandBundle } from "@/lib/vod-command-bundle";

interface VODListProps {
  channelId: string;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((entry) => entry[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function VODList({ channelId }: VODListProps) {
  const settings = useVodStore((state) => state.settings);
  const removeChannel = useVodStore((state) => state.removeChannel);
  const {
    channel,
    vods,
    error,
    hasNextPage,
    initialLoading,
    refreshing,
    fetchingNextPage,
    refresh,
    loadNext,
  } = useChannelVods(channelId);

  const renderedVods = useMemo(
    () =>
      vods.map((vod) => {
        const commandBundle = createVodCommandBundle(vod, settings);

        return {
          ...vod,
          videoCommand: commandBundle.videoDownload,
          chatDownloadCommand: commandBundle.chatDownload,
          chatRenderCommand: commandBundle.chatRender,
        };
      }),
    [settings, vods],
  );

  if (!channel) return null;

  const handleRefresh = async () => {
    const result = await refresh();
    if (result.error) {
      toast.error(result.error.message);
      return;
    }
    toast.success(`Refreshed ${result.data?.pages[0]?.vods.length ?? 0} VODs`);
  };

  const handleLoadNext = async () => {
    const result = await loadNext();
    if (result.error) {
      toast.error(result.error.message);
    }
  };

  const handleRemove = () => {
    if (confirm(`Are you sure you want to remove channel "${channel.name}"?`)) {
      removeChannel(channel.id);
      toast.success(`Channel "${channel.name}" removed`);
    }
  };

  return (
    <Card className="border-[#1f1f23] bg-[#18181b]">
      <CardContent className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14 border-2 border-[#9146ff]">
              <AvatarImage
                src={channel.avatarUrl ?? undefined}
                alt={channel.name}
              />
              <AvatarFallback className="bg-[#9146ff]">
                {getInitials(channel.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{channel.name}</h3>
              <p className="text-sm text-[#adadb8]">
                {vods.length} {vods.length === 1 ? "VOD" : "VODs"} loaded
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              disabled={initialLoading || refreshing}
              aria-label={`Refresh ${channel.name} VODs`}
              className="border-[#3f3f46] bg-[#0e0e10] text-white hover:bg-[#1f1f23]"
            >
              {initialLoading || refreshing ? (
                <Spinner className="h-4 w-4" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleRemove}
              aria-label={`Remove ${channel.name}`}
              className="border-[#3f3f46] bg-[#0e0e10] text-white hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {initialLoading && (
          <div className="flex min-h-48 flex-col items-center justify-center gap-3 text-[#adadb8]">
            <Spinner className="h-6 w-6" />
            <p>Loading VODs...</p>
          </div>
        )}

        {!initialLoading && error && renderedVods.length === 0 && (
          <div className="flex min-h-48 flex-col items-center justify-center gap-3 text-center">
            <p className="font-medium">
              Could not load this channel&apos;s VODs.
            </p>
            <p className="max-w-md text-sm text-[#adadb8]">{error.message}</p>
            <Button variant="outline" onClick={handleRefresh}>
              Try again
            </Button>
          </div>
        )}

        {!initialLoading && !error && renderedVods.length === 0 && (
          <div className="flex min-h-48 flex-col items-center justify-center gap-3 text-center">
            <p className="font-medium">No archived VODs found.</p>
            <p className="text-sm text-[#adadb8]">
              This channel may not have any currently available broadcasts.
            </p>
          </div>
        )}

        {renderedVods.length > 0 && (
          <>
            {error && (
              <div className="mb-4 rounded-md border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                Refresh failed. Showing the last loaded VODs.
              </div>
            )}

            <div className="space-y-6">
              {renderedVods.map((vod, index) => (
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
                  {index < renderedVods.length - 1 && (
                    <Separator className="my-6 bg-[#1f1f23]" />
                  )}
                </div>
              ))}
            </div>

            {hasNextPage && (
              <div className="mt-6 text-center">
                <Button
                  variant="outline"
                  onClick={handleLoadNext}
                  disabled={fetchingNextPage || refreshing}
                  className="border-[#3f3f46] bg-[#0e0e10] text-white hover:bg-[#1f1f23]"
                >
                  {fetchingNextPage ? (
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
          </>
        )}
      </CardContent>
    </Card>
  );
}
