export const CHAT_RENDER_PROFILE_IDS = ["1080p", "1440p", "custom"] as const;

export type ChatRenderProfileId = (typeof CHAT_RENDER_PROFILE_IDS)[number];

export interface ChatRenderSettings {
  chatRenderProfile: ChatRenderProfileId;
  customChatWidth: number;
  customChatHeight: number;
  chatFont: string;
}

export interface ChatRenderSpec {
  chatWidth: number;
  chatHeight: number;
  fontSize: number;
  framerate: number;
}

export const CHAT_RENDER_PROFILES = {
  "1080p": {
    label: "1080p chat panel",
    description: "400 × 350, 18px type, 30 fps",
    chatWidth: 400,
    chatHeight: 350,
    fontSize: 18,
    framerate: 30,
  },
  "1440p": {
    label: "1440p chat panel",
    description: "534 × 466, 24px type, 60 fps",
    chatWidth: 534,
    chatHeight: 466,
    fontSize: 24,
    framerate: 60,
  },
} as const;

export const defaultChatRenderSettings: ChatRenderSettings = {
  chatRenderProfile: "1080p",
  customChatWidth: 400,
  customChatHeight: 350,
  chatFont: "Arial",
};

export function isChatRenderProfileId(
  value: unknown,
): value is ChatRenderProfileId {
  return CHAT_RENDER_PROFILE_IDS.some((profileId) => profileId === value);
}

export function resolveChatRenderSpec(
  settings: ChatRenderSettings,
): ChatRenderSpec {
  if (settings.chatRenderProfile !== "custom") {
    return CHAT_RENDER_PROFILES[settings.chatRenderProfile];
  }

  const heightScale = settings.customChatHeight / 1080;

  return {
    chatWidth: settings.customChatWidth,
    chatHeight: settings.customChatHeight,
    fontSize: Math.min(48, Math.max(12, Math.round(18 * heightScale))),
    framerate: 30,
  };
}
