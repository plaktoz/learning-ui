"use client";

import { useAppData } from "@/lib/app-data/app-data-provider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { H1, Muted } from "@/components/ui/typography";
import type { Theme } from "@/lib/repository/types";

const THEME_OPTIONS: { value: Theme; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];

function SettingsView() {
  const { settings, updateSettings, loading } = useAppData();

  if (loading) {
    return <Muted>Loading…</Muted>;
  }

  return (
    <div className="flex max-w-2xl flex-col gap-8">
      <H1>Settings</H1>

      <Card>
        <CardHeader>
          <CardTitle>Theme</CardTitle>
          <CardDescription>
            Choose how Notes looks on this device.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-2">
          {THEME_OPTIONS.map((option) => (
            <Button
              key={option.value}
              variant={settings.theme === option.value ? "default" : "outline"}
              size="sm"
              onClick={() => updateSettings({ theme: option.value })}
            >
              {option.label}
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export { SettingsView };
