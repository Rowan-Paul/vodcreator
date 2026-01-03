"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/trpc/react";
import { toast } from "sonner";

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
        className="flex-1"
      />
      <Button type="submit" disabled={addChannel.isPending}>
        {addChannel.isPending ? (
          <>
            <Spinner className="mr-2 h-4 w-4" />
            Adding...
          </>
        ) : (
          "Add Channel"
        )}
      </Button>
    </form>
  );
}
