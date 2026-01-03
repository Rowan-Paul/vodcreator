"use client";

import { api } from "@/trpc/react";
import { VODList } from "@/app/_components/vod-list";

export function ChannelsList() {
  const { data: channels, isLoading } = api.twitch.listChannels.useQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#9146ff] border-t-transparent" />
          <p className="mt-4 text-[#adadb8]">Loading channels...</p>
        </div>
      </div>
    );
  }

  if (!channels || channels.length === 0) {
    return (
      <div className="rounded-xl border border-[#1f1f23] bg-[#18181b] p-12 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#1f1f23]">
          <svg
            className="h-8 w-8 text-[#71717a]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        </div>
        <p className="text-[#adadb8]">
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
          latestVod={channel.latestVod}
        />
      ))}
    </div>
  );
}
