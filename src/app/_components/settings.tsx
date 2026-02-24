"use client";

import { useEffect, useState } from "react";
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
import { useVodStore } from "@/app/_stores/vod-store";
import { toast } from "sonner";
import { Settings as SettingsIcon } from "lucide-react";

export function Settings() {
  const settings = useVodStore((state) => state.settings);
  const updateSettings = useVodStore((state) => state.updateSettings);

  const [chatWidth, setChatWidth] = useState(settings.chatWidth);
  const [chatHeight, setChatHeight] = useState(settings.chatHeight);
  const [chatFont, setChatFont] = useState(settings.chatFont);
  const [vodsPerLoad, setVodsPerLoad] = useState(settings.vodsPerLoad);

  useEffect(() => {
    setChatWidth(settings.chatWidth);
    setChatHeight(settings.chatHeight);
    setChatFont(settings.chatFont);
    setVodsPerLoad(settings.vodsPerLoad);
  }, [settings]);

  const handleSave = () => {
    updateSettings({ chatWidth, chatHeight, chatFont, vodsPerLoad });
    toast.success("Settings saved successfully");
  };

  const hasChanges =
    chatWidth !== settings.chatWidth ||
    chatHeight !== settings.chatHeight ||
    chatFont !== settings.chatFont ||
    vodsPerLoad !== settings.vodsPerLoad;

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
          disabled={!hasChanges}
          className="w-full bg-[#9146ff] text-white hover:bg-[#772ce8]"
        >
          Save Settings
        </Button>
      </CardContent>
    </Card>
  );
}
