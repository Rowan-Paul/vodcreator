"use client";

import { VODList } from "@/app/_components/vod-list";
import { useVodStore } from "@/app/_stores/vod-store";

export function ChannelsList() {
  const channels = useVodStore((state) => state.channels);

  if (channels.length === 0) {
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
        <VODList key={channel.id} channelId={channel.id} />
      ))}
    </div>
  );
}
