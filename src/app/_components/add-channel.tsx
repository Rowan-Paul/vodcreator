"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { Plus } from "lucide-react";

export function AddChannel() {
  const [username, setUsername] = useState("");
  const addChannel = api.twitch.addChannel.useMutation();
  const utils = api.useUtils();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    addChannel.mutate(
      { username: username.trim() },
      {
        onSuccess: () => {
          setUsername("");
          toast.success(`Channel "${username}" added successfully`);
          void utils.twitch.listChannels.invalidate();
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
        disabled={addChannel.isPending}
        className="flex-1 border-[#3f3f46] bg-[#0e0e10] text-white placeholder:text-[#71717a] focus:border-[#9146ff] focus:ring-[#9146ff]/20"
      />
      <Button
        type="submit"
        disabled={addChannel.isPending}
        className="bg-[#9146ff] text-white hover:bg-[#772ce8]"
      >
        {addChannel.isPending ? (
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
