export function escapeFilename(text: string): string {
  return text
    .replace(/["\\]/g, "\\$&")
    .replace(/[/:*?"<>|]/g, "")
    .trim();
}

export function generateVideoCommand(vod: {
  vodId: string;
  title: string;
  publishedAt: Date;
}): string {
  const date = vod.publishedAt.toISOString().split("T")[0]!;
  const sanitizedTitle = escapeFilename(vod.title);
  return `./TwitchDownloaderCLI videodownload --id ${vod.vodId} -o "${date} ${sanitizedTitle}.mp4"`;
}

export function generateChatDownloadCommand(vod: { vodId: string }): string {
  return `./TwitchDownloaderCLI chatdownload --id ${vod.vodId} -o chat.json`;
}

export function generateChatRenderCommand(
  vod: { vodId: string; title: string; publishedAt: Date },
  settings: { chatWidth: number; chatHeight: number; chatFont: string },
): string {
  const sanitizedFont = settings.chatFont.replace(/"/g, '\\"');
  return `./TwitchDownloaderCLI chatrender -i chat.json -o "chat.mp4" -w ${settings.chatWidth} -h ${settings.chatHeight} -f "${sanitizedFont}"`;
}
