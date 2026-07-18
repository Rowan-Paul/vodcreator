"use client";

import { useVodStore } from "@/app/_stores/vod-store";
import { Spinner } from "@/components/ui/spinner";

export function HydrationGate({ children }: { children: React.ReactNode }) {
  const hydrated = useVodStore((state) => state.hydrated);

  if (!hydrated) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center gap-4 text-[#adadb8]">
        <Spinner className="h-8 w-8" />
        <p>Restoring your workspace...</p>
      </div>
    );
  }

  return children;
}
