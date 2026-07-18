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
        cursor: z.string().nullish(),
      }),
    )
    .query(async ({ input }) => {
      const { videos, cursor: nextCursor } = await twitch.getVideosByUserId(
        input.twitchId,
        input.limit,
        input.cursor ?? undefined,
      );

      const madeProgress = videos.length > 0 && nextCursor !== input.cursor;

      return {
        vods: videos,
        nextCursor: madeProgress ? nextCursor : undefined,
        fetchedAt: new Date(),
      };
    }),
});
