"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface AppSettings {
  chatWidth: number;
  chatHeight: number;
  chatFont: string;
  vodsPerLoad: number;
}

export interface StoredVod {
  vodId: string;
  title: string;
  publishedAt: string;
  url: string;
  thumbnail: string;
  duration: number;
}

export interface StoredChannel {
  id: string;
  twitchId: string;
  name: string;
  avatarUrl: string | null;
  vods: StoredVod[];
  hasMore: boolean;
}

const defaultSettings: AppSettings = {
  chatWidth: 400,
  chatHeight: 350,
  chatFont: "Arial",
  vodsPerLoad: 5,
};

interface VodStoreState {
  channels: StoredChannel[];
  settings: AppSettings;
  hydrated: boolean;
  setHydrated: (hydrated: boolean) => void;
  addChannel: (channel: Omit<StoredChannel, "id" | "vods" | "hasMore">) => void;
  removeChannel: (channelId: string) => void;
  replaceChannelVods: (
    channelId: string,
    vods: StoredVod[],
    hasMore: boolean,
  ) => void;
  appendChannelVods: (
    channelId: string,
    vods: StoredVod[],
    hasMore: boolean,
  ) => void;
  updateSettings: (settings: AppSettings) => void;
}

export const useVodStore = create<VodStoreState>()(
  persist(
    (set) => ({
      channels: [],
      settings: defaultSettings,
      hydrated: false,
      setHydrated: (hydrated) => set({ hydrated }),
      addChannel: (channel) =>
        set((state) => {
          if (state.channels.some((entry) => entry.twitchId === channel.twitchId)) {
            return state;
          }

          return {
            channels: [
              {
                id: crypto.randomUUID(),
                ...channel,
                vods: [],
                hasMore: false,
              },
              ...state.channels,
            ],
          };
        }),
      removeChannel: (channelId) =>
        set((state) => ({
          channels: state.channels.filter((channel) => channel.id !== channelId),
        })),
      replaceChannelVods: (channelId, vods, hasMore) =>
        set((state) => ({
          channels: state.channels.map((channel) =>
            channel.id === channelId ? { ...channel, vods, hasMore } : channel,
          ),
        })),
      appendChannelVods: (channelId, vods, hasMore) =>
        set((state) => ({
          channels: state.channels.map((channel) => {
            if (channel.id !== channelId) return channel;

            const existingIds = new Set(channel.vods.map((vod) => vod.vodId));
            const merged = [...channel.vods];
            for (const vod of vods) {
              if (!existingIds.has(vod.vodId)) {
                merged.push(vod);
              }
            }
            return { ...channel, vods: merged, hasMore };
          }),
        })),
      updateSettings: (settings) => set({ settings }),
    }),
    {
      name: "vodcreator-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        channels: state.channels,
        settings: state.settings,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);
