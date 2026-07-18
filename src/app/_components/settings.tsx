"use client";

import { type ChangeEvent, useState } from "react";
import { Settings as SettingsIcon } from "lucide-react";
import { toast } from "sonner";

import { useVodStore } from "@/app/_stores/vod-store";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CHAT_RENDER_PROFILES,
  isChatRenderProfileId,
  resolveChatRenderSpec,
} from "@/lib/chat-render-profiles";

export function Settings() {
  const settings = useVodStore((state) => state.settings);
  const updateSettings = useVodStore((state) => state.updateSettings);
  const [draft, setDraft] = useState(settings);

  const renderSpec = resolveChatRenderSpec(draft);
  const hasChanges =
    draft.chatRenderProfile !== settings.chatRenderProfile ||
    draft.customChatWidth !== settings.customChatWidth ||
    draft.customChatHeight !== settings.customChatHeight ||
    draft.chatFont !== settings.chatFont ||
    draft.vodsPerLoad !== settings.vodsPerLoad;
  const settingsAreValid =
    draft.chatFont.trim().length > 0 &&
    (draft.chatRenderProfile !== "custom" ||
      (Number.isFinite(draft.customChatWidth) &&
        draft.customChatWidth >= 100 &&
        draft.customChatWidth <= 3840 &&
        Number.isFinite(draft.customChatHeight) &&
        draft.customChatHeight >= 100 &&
        draft.customChatHeight <= 2160));

  const handleProfileChange = (value: string) => {
    if (!isChatRenderProfileId(value)) return;
    setDraft((current) => ({ ...current, chatRenderProfile: value }));
  };

  const handleCustomWidthChange = (event: ChangeEvent<HTMLInputElement>) => {
    setDraft((current) => ({
      ...current,
      customChatWidth: Number.parseInt(event.target.value, 10),
    }));
  };

  const handleCustomHeightChange = (event: ChangeEvent<HTMLInputElement>) => {
    setDraft((current) => ({
      ...current,
      customChatHeight: Number.parseInt(event.target.value, 10),
    }));
  };

  const handleFontChange = (event: ChangeEvent<HTMLInputElement>) => {
    setDraft((current) => ({ ...current, chatFont: event.target.value }));
  };

  const handleVodsPerLoadChange = (value: string) => {
    setDraft((current) => ({
      ...current,
      vodsPerLoad: Number.parseInt(value, 10),
    }));
  };

  const handleSave = () => {
    updateSettings(draft);
    toast.success("Settings saved successfully");
  };

  return (
    <Card className="border-[#1f1f23] bg-[#18181b]">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-[#9146ff]/10 p-2">
            <SettingsIcon className="h-5 w-5 text-[#9146ff]" />
          </div>
          <div>
            <CardTitle>Settings</CardTitle>
            <CardDescription className="text-[#adadb8]">
              Customize your VOD download commands
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="chatRenderProfile">Chat Render Template</Label>
          <Select
            value={draft.chatRenderProfile}
            onValueChange={handleProfileChange}
          >
            <SelectTrigger
              id="chatRenderProfile"
              className="border-[#3f3f46] bg-[#0e0e10] text-white focus:border-[#9146ff] focus:ring-[#9146ff]/20"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-[#3f3f46] bg-[#18181b]">
              <SelectItem value="1080p">
                {CHAT_RENDER_PROFILES["1080p"].label}
              </SelectItem>
              <SelectItem value="1440p">
                {CHAT_RENDER_PROFILES["1440p"].label}
              </SelectItem>
              <SelectItem value="custom">Custom dimensions</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-[#adadb8]">
            {renderSpec.chatWidth} × {renderSpec.chatHeight},{" "}
            {renderSpec.fontSize}px type, {renderSpec.framerate} fps
          </p>
        </div>

        {draft.chatRenderProfile === "custom" && (
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="customChatWidth">Width (px)</Label>
              <Input
                id="customChatWidth"
                type="number"
                min={100}
                max={3840}
                value={draft.customChatWidth}
                onChange={handleCustomWidthChange}
                className="border-[#3f3f46] bg-[#0e0e10] text-white focus:border-[#9146ff] focus:ring-[#9146ff]/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customChatHeight">Height (px)</Label>
              <Input
                id="customChatHeight"
                type="number"
                min={100}
                max={2160}
                value={draft.customChatHeight}
                onChange={handleCustomHeightChange}
                className="border-[#3f3f46] bg-[#0e0e10] text-white focus:border-[#9146ff] focus:ring-[#9146ff]/20"
              />
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="chatFont">Chat Font</Label>
          <Input
            id="chatFont"
            type="text"
            value={draft.chatFont}
            onChange={handleFontChange}
            placeholder="Arial"
            className="border-[#3f3f46] bg-[#0e0e10] text-white placeholder:text-[#71717a] focus:border-[#9146ff] focus:ring-[#9146ff]/20"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="vodsPerLoad">VODs per Load</Label>
          <Select
            value={draft.vodsPerLoad.toString()}
            onValueChange={handleVodsPerLoadChange}
          >
            <SelectTrigger
              id="vodsPerLoad"
              className="border-[#3f3f46] bg-[#0e0e10] text-white focus:border-[#9146ff] focus:ring-[#9146ff]/20"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-[#3f3f46] bg-[#18181b]">
              <SelectItem value="1">1</SelectItem>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={handleSave}
          disabled={!hasChanges || !settingsAreValid}
          className="w-full bg-[#9146ff] text-white hover:bg-[#772ce8]"
        >
          Save Settings
        </Button>
      </CardContent>
    </Card>
  );
}
