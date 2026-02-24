import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import * as twitch from "@/server/services/twitch";

export const twitchRouter = createTRPCRouter({
  lookupChannelByUsername: protectedProcedure
    .input(z.object({ username: z.string().min(1) }))
    .mutation(async ({ input }) => {
      return await twitch.getUserByUsername(input.username);
    }),

  getChannelVods: protectedProcedure
    .input(
      z.object({
        twitchId: z.string().min(1),
        limit: z.number().min(1).max(50),
        offset: z.number().min(0).default(0),
      }),
    )
    .mutation(async ({ input }) => {
      const requestSize = Math.min(100, input.offset + input.limit);
      const { videos, cursor } = await twitch.getVideosByUserId(
        input.twitchId,
        requestSize,
      );

      const vods = videos.slice(input.offset, input.offset + input.limit);
      const hasMore = Boolean(cursor) || videos.length > input.offset + vods.length;

      return { vods, hasMore };
    }),
});
