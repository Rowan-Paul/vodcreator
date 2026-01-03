"use client";

import { api } from "@/trpc/react";
import { VODList } from "@/app/_components/vod-list";

export function ChannelsList() {
  const { data: channels, isLoading } = api.twitch.listChannels.useQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-white border-t-transparent" />
          <p className="mt-4 text-white/80">Loading channels...</p>
        </div>
      </div>
    );
  }

  if (!channels || channels.length === 0) {
    return (
      <div className="rounded-xl bg-white/10 p-12 text-center">
        <p className="text-xl text-white/80">
          No channels added yet. Add a channel above to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {channels.map((channel) => (
        <VODList
          key={channel.id}
          channelId={channel.id}
          channelName={channel.name}
          avatarUrl={channel.avatarUrl}
          initialVodCount={channel.vodCount}
        />
      ))}
    </div>
  );
}
