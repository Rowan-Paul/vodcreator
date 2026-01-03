import Link from "next/link";

import { AddChannel } from "@/app/_components/add-channel";
import { ChannelsList } from "@/app/_components/channels-list";
import { Settings } from "@/app/_components/settings";
import { auth } from "@/server/auth";
import { api, HydrateClient } from "@/trpc/server";
import { LogOut, Settings as SettingsIcon, Twitch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    void api.twitch.listChannels.prefetch();
    void api.twitch.getSettings.prefetch();
  }

  return (
    <HydrateClient>
      <div className="min-h-screen bg-[#0e0e10] text-white">
        {session?.user && (
          <header className="sticky top-0 z-50 border-b border-[#1f1f23] bg-[#18181b]/95 backdrop-blur supports-[backdrop-filter]:bg-[#0e0e10]/80">
            <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-[#9146ff] p-2">
                  <Twitch className="h-5 w-5" />
                </div>
                <h1 className="text-lg font-semibold">VOD Creator</h1>
              </div>

              <nav className="flex items-center gap-3">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="#settings">
                    <SettingsIcon className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </Button>
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage
                      src={session.user.image ?? undefined}
                      alt={session.user.name ?? ""}
                    />
                    <AvatarFallback>
                      {session.user.name?.[0] ?? "U"}
                    </AvatarFallback>
                  </Avatar>
                  <Button variant="ghost" size="sm" asChild>
                    <Link
                      href="/api/auth/signout"
                      className="text-red-400 hover:text-red-300"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </Link>
                  </Button>
                </div>
              </nav>
            </div>
          </header>
        )}

        <main className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
          {!session?.user && (
            <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
              <div className="flex max-w-md flex-col items-center gap-8 text-center">
                <div className="rounded-full bg-[#9146ff]/10 p-6">
                  <Twitch className="h-16 w-16 text-[#9146ff]" />
                </div>
                <div className="space-y-3">
                  <h1 className="text-4xl font-bold tracking-tight">
                    VOD Creator
                  </h1>
                  <p className="text-[#adadb8]">
                    Generate Twitch VOD download commands with chat overlay
                    support
                  </p>
                </div>
                <Link
                  href="/api/auth/signin"
                  className="rounded-lg bg-[#9146ff] px-8 py-3 font-semibold text-white transition-all hover:bg-[#772ce8] hover:shadow-[0_0_20px_rgba(145,70,255,0.3)]"
                >
                  Sign in to get started
                </Link>
              </div>
            </div>
          )}

          {session?.user && (
            <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
              <div className="space-y-6">
                <div className="rounded-xl border border-[#1f1f23] bg-[#18181b] p-6 shadow-sm">
                  <h2 className="mb-4 text-lg font-semibold">Add Channel</h2>
                  <AddChannel />
                </div>

                <div>
                  <h2 className="mb-4 text-lg font-semibold">Your Channels</h2>
                  <ChannelsList />
                </div>
              </div>

              <div id="settings" className="lg:sticky lg:top-24 lg:h-fit">
                <Settings />
              </div>
            </div>
          )}
        </main>
      </div>
    </HydrateClient>
  );
}
