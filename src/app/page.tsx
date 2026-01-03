import Link from "next/link";

import { AddChannel } from "@/app/_components/add-channel";
import { ChannelsList } from "@/app/_components/channels-list";
import { Settings } from "@/app/_components/settings";
import { auth } from "@/server/auth";
import { api, HydrateClient } from "@/trpc/server";

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    void api.twitch.listChannels.prefetch();
    void api.twitch.getSettings.prefetch();
  }

  return (
    <HydrateClient>
      <main className="min-h-screen bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-5xl font-extrabold tracking-tight sm:text-[5rem]">
              VOD <span className="text-[hsl(280,100%,70%)]">Creator</span>
            </h1>
            <p className="text-xl text-white/80">
              Generate Twitch VOD download commands effortlessly
            </p>
          </div>

          {!session?.user && (
            <div className="flex flex-col items-center justify-center gap-4">
              <p className="text-center text-2xl text-white">
                Sign in to start managing your VODs
              </p>
              <Link
                href="/api/auth/signin"
                className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
              >
                Sign in with Google
              </Link>
            </div>
          )}

          {session?.user && (
            <div className="space-y-8">
              <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
                <div className="flex-1 space-y-6">
                  <div className="rounded-xl bg-white/10 p-6">
                    <h2 className="mb-4 text-2xl font-bold">Add Channel</h2>
                    <AddChannel />
                  </div>

                  <div>
                    <h2 className="mb-4 text-2xl font-bold">Your Channels</h2>
                    <ChannelsList />
                  </div>
                </div>

                <div className="lg:w-96">
                  <Settings />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </HydrateClient>
  );
}