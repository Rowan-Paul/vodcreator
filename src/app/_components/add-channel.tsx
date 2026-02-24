"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/trpc/react";
import { useVodStore } from "@/app/_stores/vod-store";
import { toast } from "sonner";
import { Plus } from "lucide-react";

export function AddChannel() {
  const [username, setUsername] = useState("");
  const lookupChannel = api.twitch.lookupChannelByUsername.useMutation();
  const addChannel = useVodStore((state) => state.addChannel);
  const channels = useVodStore((state) => state.channels);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    lookupChannel.mutate(
      { username: username.trim() },
      {
        onSuccess: (channel) => {
          if (channels.some((entry) => entry.twitchId === channel.twitchId)) {
            toast.error(`Channel "${channel.name}" is already added`);
            return;
          }

          addChannel({
            name: channel.name,
            twitchId: channel.twitchId,
            avatarUrl: channel.avatarUrl,
          });
          setUsername("");
          toast.success(`Channel "${channel.name}" added successfully`);
        },
        onError: (error) => {
          toast.error(error.message);
        },
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        type="text"
        placeholder="Twitch username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        disabled={lookupChannel.isPending}
        className="flex-1 border-[#3f3f46] bg-[#0e0e10] text-white placeholder:text-[#71717a] focus:border-[#9146ff] focus:ring-[#9146ff]/20"
      />
      <Button
        type="submit"
        disabled={lookupChannel.isPending}
        className="bg-[#9146ff] text-white hover:bg-[#772ce8]"
      >
        {lookupChannel.isPending ? (
          <>
            <Spinner className="mr-2 h-4 w-4" />
            Adding...
          </>
        ) : (
          <>
            <Plus className="mr-2 h-4 w-4" />
            Add
          </>
        )}
      </Button>
    </form>
  );
}
