"use client";

import { useState } from "react";
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
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { Settings as SettingsIcon } from "lucide-react";

export function Settings() {
  const { data: settings } = api.twitch.getSettings.useQuery();
  const updateSettings = api.twitch.updateSettings.useMutation();
  const utils = api.useUtils();

  const [chatWidth, setChatWidth] = useState(settings?.chatWidth ?? 400);
  const [chatHeight, setChatHeight] = useState(settings?.chatHeight ?? 350);
  const [chatFont, setChatFont] = useState(settings?.chatFont ?? "Arial");
  const [vodsPerLoad, setVodsPerLoad] = useState(settings?.vodsPerLoad ?? 5);

  const handleSave = () => {
    void updateSettings.mutate(
      { chatWidth, chatHeight, chatFont, vodsPerLoad },
      {
        onSuccess: () => {
          toast.success("Settings saved successfully");
          void utils.twitch.getSettings.invalidate();
        },
        onError: (error) => {
          toast.error(error?.message ?? "Failed to save settings");
        },
      },
    );
  };

  const hasChanges =
    chatWidth !== (settings?.chatWidth ?? 400) ||
    chatHeight !== (settings?.chatHeight ?? 350) ||
    chatFont !== (settings?.chatFont ?? "Arial") ||
    vodsPerLoad !== (settings?.vodsPerLoad ?? 5);

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
          <Label htmlFor="chatWidth" className="text-sm font-medium">
            Chat Width (px)
          </Label>
          <Input
            id="chatWidth"
            type="number"
            min={100}
            max={1920}
            value={chatWidth}
            onChange={(e) => setChatWidth(Number.parseInt(e.target.value, 10))}
            className="border-[#3f3f46] bg-[#0e0e10] text-white placeholder:text-[#71717a] focus:border-[#9146ff] focus:ring-[#9146ff]/20"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="chatHeight" className="text-sm font-medium">
            Chat Height (px)
          </Label>
          <Input
            id="chatHeight"
            type="number"
            min={100}
            max={1080}
            value={chatHeight}
            onChange={(e) => setChatHeight(Number.parseInt(e.target.value, 10))}
            className="border-[#3f3f46] bg-[#0e0e10] text-white placeholder:text-[#71717a] focus:border-[#9146ff] focus:ring-[#9146ff]/20"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="chatFont" className="text-sm font-medium">
            Chat Font
          </Label>
          <Input
            id="chatFont"
            type="text"
            value={chatFont}
            onChange={(e) => setChatFont(e.target.value)}
            placeholder="Arial"
            className="border-[#3f3f46] bg-[#0e0e10] text-white placeholder:text-[#71717a] focus:border-[#9146ff] focus:ring-[#9146ff]/20"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="vodsPerLoad" className="text-sm font-medium">
            VODs per Load
          </Label>
          <Select
            value={vodsPerLoad.toString()}
            onValueChange={(value) =>
              setVodsPerLoad(Number.parseInt(value, 10))
            }
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
          disabled={!hasChanges || updateSettings.isPending}
          className="w-full bg-[#9146ff] text-white hover:bg-[#772ce8]"
        >
          {updateSettings.isPending ? "Saving..." : "Save Settings"}
        </Button>
      </CardContent>
    </Card>
  );
}
