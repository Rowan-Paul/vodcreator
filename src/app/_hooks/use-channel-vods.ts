"use client";

import { useEffect, useMemo } from "react";

import {
  MAX_CACHED_VODS_PER_CHANNEL,
  type StoredVod,
  useVodStore,
} from "@/app/_stores/vod-store";
import { api } from "@/trpc/react";

const VOD_STALE_TIME_MS = 15 * 60 * 1000;

function toStoredVod(vod: {
  vodId: string;
  title: string;
  publishedAt: Date;
  url: string;
  thumbnail: string;
  duration: number;
}): StoredVod {
  return {
    ...vod,
    publishedAt: vod.publishedAt.toISOString(),
  };
}

export function useChannelVods(channelId: string) {
  const channel = useVodStore((state) =>
    state.channels.find((entry) => entry.id === channelId),
  );
  const limit = useVodStore((state) => state.settings.vodsPerLoad);
  const cacheChannelVods = useVodStore((state) => state.cacheChannelVods);

  const initialData = useMemo(() => {
    if (!channel || channel.vods.length === 0) return undefined;

    return {
      pages: [
        {
          vods: channel.vods.map((vod) => ({
            ...vod,
            publishedAt: new Date(vod.publishedAt),
          })),
          nextCursor: channel.nextCursor ?? undefined,
          fetchedAt: new Date(channel.fetchedAt ?? 0),
        },
      ],
      pageParams: [undefined],
    };
  }, [channel]);

  const query = api.twitch.getChannelVods.useInfiniteQuery(
    {
      twitchId: channel?.twitchId ?? "",
      limit,
    },
    {
      enabled: Boolean(channel),
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      initialData,
      initialDataUpdatedAt: channel?.fetchedAt
        ? new Date(channel.fetchedAt).getTime()
        : 0,
      retry: 2,
      staleTime: VOD_STALE_TIME_MS,
      refetchOnWindowFocus: false,
    },
  );

  const vods = useMemo(() => {
    const seen = new Set<string>();

    return (query.data?.pages ?? []).flatMap((page) =>
      page.vods.filter((vod) => {
        if (seen.has(vod.vodId)) return false;
        seen.add(vod.vodId);
        return true;
      }),
    );
  }, [query.data]);

  useEffect(() => {
    if (!channel || !query.data || query.dataUpdatedAt === 0) return;

    const cachedVods: StoredVod[] = [];
    let cachedNextCursor: string | null = null;
    let cachedFetchedAt: string | null = null;

    for (const page of query.data.pages) {
      if (cachedVods.length + page.vods.length > MAX_CACHED_VODS_PER_CHANNEL) {
        break;
      }

      cachedVods.push(...page.vods.map(toStoredVod));
      cachedNextCursor = page.nextCursor ?? null;
      cachedFetchedAt = page.fetchedAt.toISOString();
    }

    if (!cachedFetchedAt) return;

    cacheChannelVods(channel.id, cachedVods, cachedNextCursor, cachedFetchedAt);
  }, [cacheChannelVods, channel, query.data, query.dataUpdatedAt, vods]);

  return {
    channel,
    vods,
    error: query.error,
    hasNextPage: query.hasNextPage,
    initialLoading: query.isPending && vods.length === 0,
    refreshing:
      query.isFetching && !query.isFetchingNextPage && vods.length > 0,
    fetchingNextPage: query.isFetchingNextPage,
    refresh: query.refetch,
    loadNext: query.fetchNextPage,
  };
}
