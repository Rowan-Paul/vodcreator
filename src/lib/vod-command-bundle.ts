import {
  type ChatRenderSettings,
  resolveChatRenderSpec,
} from "@/lib/chat-render-profiles";

interface CommandVod {
  vodId: string;
  title: string;
  publishedAt: Date;
}

export interface VodCommandBundle {
  videoDownload: string;
  chatDownload: string;
  chatRender: string;
}

function escapeFilename(text: string): string {
  return text
    .replace(/[/:*?"<>|]/g, "")
    .replace(/[\\$`!]/g, "\\$&")
    .trim();
}

function escapeDoubleQuotedArgument(text: string): string {
  return text.replace(/["\\$`!]/g, "\\$&");
}

function createBasename(vod: CommandVod): string {
  const date = vod.publishedAt.toISOString().split("T")[0]!;
  const title = escapeFilename(vod.title) || "Untitled VOD";
  return `${date} ${title} [${vod.vodId}]`;
}

export function createVodCommandBundle(
  vod: CommandVod,
  settings: ChatRenderSettings,
): VodCommandBundle {
  const basename = createBasename(vod);
  const chatInput = `${basename}.chat.json`;
  const chatOutput = `${basename}.chat.mp4`;
  const renderSpec = resolveChatRenderSpec(settings);
  const font = escapeDoubleQuotedArgument(settings.chatFont);

  return {
    videoDownload: `./TwitchDownloaderCLI videodownload --id ${vod.vodId} -o "${basename}.mp4"`,
    chatDownload: `./TwitchDownloaderCLI chatdownload --id ${vod.vodId} -o "${chatInput}"`,
    chatRender: `./TwitchDownloaderCLI chatrender -i "${chatInput}" -o "${chatOutput}" -w ${renderSpec.chatWidth} -h ${renderSpec.chatHeight} -f "${font}" --font-size ${renderSpec.fontSize} --framerate ${renderSpec.framerate}`,
  };
}
