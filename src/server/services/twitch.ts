import { env } from "@/env";

interface TwitchTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

interface TwitchUserResponse {
  data: Array<{
    id: string;
    login: string;
    display_name: string;
    profile_image_url: string;
  }>;
}

interface TwitchVideosResponse {
  data: Array<{
    id: string;
    stream_id: string | null;
    user_id: string;
    user_login: string;
    user_name: string;
    title: string;
    description: string;
    created_at: string;
    published_at: string;
    url: string;
    thumbnail_url: string;
    viewable: string;
    view_count: number;
    language: string;
    type: string;
    duration: string;
  }>;
  pagination: {
    cursor?: string;
  };
}

let cachedAccessToken: { token: string; expiresAt: number } | null = null;

export async function getAppAccessToken() {
  const now = Date.now();

  if (cachedAccessToken && cachedAccessToken.expiresAt > now + 60000) {
    return cachedAccessToken.token;
  }

  if (!env.TWITCH_CLIENT_ID || !env.TWITCH_CLIENT_SECRET) {
    throw new Error("TWITCH_CLIENT_ID and TWITCH_CLIENT_SECRET must be set");
  }

  const response = await fetch(
    `https://id.twitch.tv/oauth2/token?client_id=${env.TWITCH_CLIENT_ID}&client_secret=${env.TWITCH_CLIENT_SECRET}&grant_type=client_credentials`,
    { method: "POST" },
  );

  if (!response.ok) {
    throw new Error(`Failed to get Twitch access token: ${response.statusText}`);
  }

  const data = (await response.json()) as TwitchTokenResponse;
  const expiresAt = now + data.expires_in * 1000;

  cachedAccessToken = {
    token: data.access_token,
    expiresAt,
  };

  return data.access_token;
}

export async function getUserByUsername(username: string) {
  const token = await getAppAccessToken();

  if (!env.TWITCH_CLIENT_ID) {
    throw new Error("TWITCH_CLIENT_ID must be set");
  }

  const response = await fetch(
    `https://api.twitch.tv/helix/users?login=${username}`,
    {
      headers: {
        "Client-Id": env.TWITCH_CLIENT_ID,
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to get Twitch user: ${response.statusText}`);
  }

  const data = (await response.json()) as TwitchUserResponse;

  if (!data.data.length) {
    throw new Error(`User "${username}" not found`);
  }

  return {
    twitchId: data.data[0]!.id,
    name: data.data[0]!.login,
    displayName: data.data[0]!.display_name,
    avatarUrl: data.data[0]!.profile_image_url,
  };
}

export async function getVideosByUserId(userId: string, limit = 20, after?: string) {
  const token = await getAppAccessToken();

  if (!env.TWITCH_CLIENT_ID) {
    throw new Error("TWITCH_CLIENT_ID must be set");
  }

  const url = new URL("https://api.twitch.tv/helix/videos");
  url.searchParams.set("user_id", userId);
  url.searchParams.set("first", limit.toString());
  url.searchParams.set("type", "archive");
  if (after) {
    url.searchParams.set("after", after);
  }

  const response = await fetch(url.toString(), {
    headers: {
      "Client-Id": env.TWITCH_CLIENT_ID,
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to get Twitch videos: ${response.statusText}`);
  }

  const data = (await response.json()) as TwitchVideosResponse;

  return {
    videos: data.data.map((video) => ({
      vodId: video.id,
      title: video.title,
      publishedAt: new Date(video.published_at),
      url: video.url,
      thumbnail: video.thumbnail_url
        .replace("%{width}", "640")
        .replace("%{height}", "360"),
      duration: parseDuration(video.duration),
    })),
    cursor: data.pagination.cursor,
  };
}

function parseDuration(duration: string): number {
  const hoursMatch = /(\d+)h/.exec(duration);
  const minutesMatch = /(\d+)m/.exec(duration);
  const secondsMatch = /(\d+)s/.exec(duration);

  const hours = hoursMatch ? Number.parseInt(hoursMatch[1]!, 10) : 0;
  const minutes = minutesMatch ? Number.parseInt(minutesMatch[1]!, 10) : 0;
  const seconds = secondsMatch ? Number.parseInt(secondsMatch[1]!, 10) : 0;

  return hours * 3600 + minutes * 60 + seconds;
}
