"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
  type ChatRenderSettings,
  defaultChatRenderSettings,
  isChatRenderProfileId,
} from "@/lib/chat-render-profiles";

export const MAX_CACHED_VODS_PER_CHANNEL = 50;
const STORE_VERSION = 2;

export interface AppSettings extends ChatRenderSettings {
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
  nextCursor: string | null;
  fetchedAt: string | null;
}

const defaultSettings: AppSettings = {
  ...defaultChatRenderSettings,
  vodsPerLoad: 5,
};

interface VodStoreState {
  channels: StoredChannel[];
  settings: AppSettings;
  hydrated: boolean;
  setHydrated: (hydrated: boolean) => void;
  addChannel: (
    channel: Omit<StoredChannel, "id" | "vods" | "nextCursor" | "fetchedAt">,
  ) => void;
  removeChannel: (channelId: string) => void;
  cacheChannelVods: (
    channelId: string,
    vods: StoredVod[],
    nextCursor: string | null,
    fetchedAt: string,
  ) => void;
  updateSettings: (settings: AppSettings) => void;
}

interface PersistedVodStoreState {
  channels: StoredChannel[];
  settings: AppSettings;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function boundedNumber(
  value: unknown,
  fallback: number,
  minimum: number,
  maximum: number,
): number {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.min(maximum, Math.max(minimum, value))
    : fallback;
}

function normalizeSettings(value: unknown): AppSettings {
  if (!isRecord(value)) return defaultSettings;

  const legacyWidth = boundedNumber(value.chatWidth, 400, 100, 3840);
  const legacyHeight = boundedNumber(value.chatHeight, 350, 100, 2160);
  const profile = isChatRenderProfileId(value.chatRenderProfile)
    ? value.chatRenderProfile
    : legacyWidth === 400 && legacyHeight === 350
      ? "1080p"
      : legacyWidth === 534 && legacyHeight === 466
        ? "1440p"
        : "custom";

  return {
    chatRenderProfile: profile,
    customChatWidth: boundedNumber(
      value.customChatWidth,
      legacyWidth,
      100,
      3840,
    ),
    customChatHeight: boundedNumber(
      value.customChatHeight,
      legacyHeight,
      100,
      2160,
    ),
    chatFont:
      typeof value.chatFont === "string" && value.chatFont.trim()
        ? value.chatFont
        : defaultSettings.chatFont,
    vodsPerLoad: boundedNumber(value.vodsPerLoad, 5, 1, 50),
  };
}

function isStoredVod(value: unknown): value is StoredVod {
  return (
    isRecord(value) &&
    typeof value.vodId === "string" &&
    typeof value.title === "string" &&
    typeof value.publishedAt === "string" &&
    typeof value.url === "string" &&
    typeof value.thumbnail === "string" &&
    typeof value.duration === "number"
  );
}

function normalizeChannels(value: unknown): StoredChannel[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((candidate) => {
    if (
      !isRecord(candidate) ||
      typeof candidate.id !== "string" ||
      typeof candidate.twitchId !== "string" ||
      typeof candidate.name !== "string"
    ) {
      return [];
    }

    const vods = Array.isArray(candidate.vods)
      ? candidate.vods.filter(isStoredVod).slice(0, MAX_CACHED_VODS_PER_CHANNEL)
      : [];

    return [
      {
        id: candidate.id,
        twitchId: candidate.twitchId,
        name: candidate.name,
        avatarUrl:
          typeof candidate.avatarUrl === "string" ? candidate.avatarUrl : null,
        vods,
        nextCursor:
          typeof candidate.nextCursor === "string"
            ? candidate.nextCursor
            : null,
        fetchedAt:
          typeof candidate.fetchedAt === "string" ? candidate.fetchedAt : null,
      },
    ];
  });
}

function normalizePersistedState(value: unknown): PersistedVodStoreState {
  const persistedState = isRecord(value) ? value : {};

  return {
    channels: normalizeChannels(persistedState.channels),
    settings: normalizeSettings(persistedState.settings),
  };
}

function storedVodsEqual(left: StoredVod[], right: StoredVod[]): boolean {
  return (
    left.length === right.length &&
    left.every((vod, index) => {
      const other = right[index];
      return (
        vod.vodId === other?.vodId &&
        vod.title === other.title &&
        vod.publishedAt === other.publishedAt &&
        vod.url === other.url &&
        vod.thumbnail === other.thumbnail &&
        vod.duration === other.duration
      );
    })
  );
}

export const useVodStore = create<VodStoreState>()(
  persist<VodStoreState, [], [], PersistedVodStoreState>(
    (set) => ({
      channels: [],
      settings: defaultSettings,
      hydrated: false,
      setHydrated: (hydrated) => set({ hydrated }),
      addChannel: (channel) =>
        set((state) => {
          if (
            state.channels.some((entry) => entry.twitchId === channel.twitchId)
          ) {
            return state;
          }

          return {
            channels: [
              {
                id: crypto.randomUUID(),
                ...channel,
                vods: [],
                nextCursor: null,
                fetchedAt: null,
              },
              ...state.channels,
            ],
          };
        }),
      removeChannel: (channelId) =>
        set((state) => ({
          channels: state.channels.filter(
            (channel) => channel.id !== channelId,
          ),
        })),
      cacheChannelVods: (channelId, vods, nextCursor, fetchedAt) =>
        set((state) => {
          const boundedVods = vods.slice(0, MAX_CACHED_VODS_PER_CHANNEL);
          const current = state.channels.find(
            (channel) => channel.id === channelId,
          );
          if (
            current?.nextCursor === nextCursor &&
            current.fetchedAt === fetchedAt &&
            storedVodsEqual(current.vods, boundedVods)
          ) {
            return state;
          }

          return {
            channels: state.channels.map((channel) =>
              channel.id === channelId
                ? { ...channel, vods: boundedVods, nextCursor, fetchedAt }
                : channel,
            ),
          };
        }),
      updateSettings: (settings) => set({ settings }),
    }),
    {
      name: "vodcreator-store",
      version: STORE_VERSION,
      storage: createJSONStorage<PersistedVodStoreState>(() => localStorage),
      partialize: (state) => ({
        channels: state.channels,
        settings: state.settings,
      }),
      migrate: (persistedState) => normalizePersistedState(persistedState),
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...normalizePersistedState(persistedState),
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error("Failed to restore the VOD Creator workspace", error);
        }
        if (state) {
          state.setHydrated(true);
          return;
        }
        queueMicrotask(() => useVodStore.setState({ hydrated: true }));
      },
    },
  ),
);
