"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/trpc/react";
import { toast } from "sonner";

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
    <Card>
      <CardHeader>
        <CardTitle>Settings</CardTitle>
        <CardDescription>Customize your VOD download commands</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="chatWidth">Chat Width (px)</Label>
          <Input
            id="chatWidth"
            type="number"
            min={100}
            max={1920}
            value={chatWidth}
            onChange={(e) => setChatWidth(Number.parseInt(e.target.value, 10))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="chatHeight">Chat Height (px)</Label>
          <Input
            id="chatHeight"
            type="number"
            min={100}
            max={1080}
            value={chatHeight}
            onChange={(e) => setChatHeight(Number.parseInt(e.target.value, 10))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="chatFont">Chat Font</Label>
          <Input
            id="chatFont"
            type="text"
            value={chatFont}
            onChange={(e) => setChatFont(e.target.value)}
            placeholder="Arial"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="vodsPerLoad">VODs per Load</Label>
          <Select
            value={vodsPerLoad.toString()}
            onValueChange={(value) => setVodsPerLoad(Number.parseInt(value, 10))}
          >
            <SelectTrigger id="vodsPerLoad">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
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
          className="w-full"
        >
          {updateSettings.isPending ? "Saving..." : "Save Settings"}
        </Button>
      </CardContent>
    </Card>
  );
}
