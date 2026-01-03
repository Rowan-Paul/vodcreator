import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import * as twitch from "@/server/services/twitch";
import * as commands from "@/server/utils/commands";

export const twitchRouter = createTRPCRouter({
  addChannel: protectedProcedure
    .input(z.object({ username: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const user = await twitch.getUserByUsername(input.username);

      const channel = await ctx.db.twitchChannel.create({
        data: {
          name: user.name,
          twitchId: user.twitchId,
          avatarUrl: user.avatarUrl,
          userId: ctx.session.user.id,
        },
      });

      return channel;
    }),

  removeChannel: protectedProcedure
    .input(z.object({ channelId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.twitchChannel.delete({
        where: { id: input.channelId, userId: ctx.session.user.id },
      });

      return { success: true };
    }),

  listChannels: protectedProcedure.query(async ({ ctx }) => {
    const channels = await ctx.db.twitchChannel.findMany({
      where: { userId: ctx.session.user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        userId: true,
        twitchId: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const vodCounts = await Promise.all(
      channels.map((channel) =>
        ctx.db.vOD.count({
          where: { channelId: channel.id },
        }),
      ),
    );

    const latestVods = await Promise.all(
      channels.map((channel) =>
        ctx.db.vOD.findFirst({
          where: { channelId: channel.id },
          orderBy: { publishedAt: "desc" },
        }),
      ),
    );

    return channels.map((channel, index) => ({
      ...channel,
      vodCount: vodCounts[index] ?? 0,
      latestVod: latestVods[index] ?? null,
    }));
  }),

  loadMoreVods: protectedProcedure
    .input(
      z.object({
        channelId: z.string(),
        limit: z.number().min(1),
        offset: z.number().min(0),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const channel = await ctx.db.twitchChannel.findFirst({
        where: { id: input.channelId, userId: ctx.session.user.id },
      });

      if (!channel) {
        throw new Error("Channel not found");
      }

      const vods = await ctx.db.vOD.findMany({
        where: { channelId: input.channelId },
        orderBy: { publishedAt: "desc" },
        skip: input.offset,
        take: input.limit,
      });

      return vods.map((vod) => ({
        ...vod,
        videoCommand: commands.generateVideoCommand(vod),
        chatDownloadCommand: commands.generateChatDownloadCommand(vod),
        chatRenderCommand: commands.generateChatRenderCommand(vod, {
          chatWidth: 400,
          chatHeight: 350,
          chatFont: "Arial",
        }),
      }));
    }),

  refreshChannelVods: protectedProcedure
    .input(z.object({ channelId: z.string(), limit: z.number().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const channel = await ctx.db.twitchChannel.findFirst({
        where: { id: input.channelId, userId: ctx.session.user.id },
      });

      if (!channel) {
        throw new Error("Channel not found");
      }

      const { videos, cursor } = await twitch.getVideosByUserId(
        channel.twitchId,
        input.limit,
      );

      const createdVods = await Promise.all(
        videos.map((video) =>
          ctx.db.vOD.upsert({
            where: { vodId: video.vodId },
            update: {
              title: video.title,
              publishedAt: video.publishedAt,
              duration: video.duration,
              url: video.url,
              thumbnail: video.thumbnail,
            },
            create: {
              vodId: video.vodId,
              title: video.title,
              publishedAt: video.publishedAt,
              duration: video.duration,
              url: video.url,
              thumbnail: video.thumbnail,
              channelId: channel.id,
            },
          }),
        ),
      );

      return {
        vods: createdVods.map((vod) => ({
          ...vod,
          videoCommand: commands.generateVideoCommand(vod),
          chatDownloadCommand: commands.generateChatDownloadCommand(vod),
          chatRenderCommand: commands.generateChatRenderCommand(vod, {
            chatWidth: 400,
            chatHeight: 350,
            chatFont: "Arial",
          }),
        })),
        hasMore: !!cursor,
      };
    }),

  getSettings: protectedProcedure.query(async ({ ctx }) => {
    const settings = await ctx.db.userSettings.findUnique({
      where: { userId: ctx.session.user.id },
    });

    if (settings) return settings;

    return await ctx.db.userSettings.create({
      data: {
        userId: ctx.session.user.id,
        chatWidth: 400,
        chatHeight: 350,
        chatFont: "Arial",
        vodsPerLoad: 5,
      },
    });
  }),

  updateSettings: protectedProcedure
    .input(
      z.object({
        chatWidth: z.number().min(100).max(1920),
        chatHeight: z.number().min(100).max(1080),
        chatFont: z.string().min(1),
        vodsPerLoad: z.number().min(1).max(50),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const settings = await ctx.db.userSettings.upsert({
        where: { userId: ctx.session.user.id },
        update: {
          chatWidth: input.chatWidth,
          chatHeight: input.chatHeight,
          chatFont: input.chatFont,
          vodsPerLoad: input.vodsPerLoad,
        },
        create: {
          userId: ctx.session.user.id,
          chatWidth: input.chatWidth,
          chatHeight: input.chatHeight,
          chatFont: input.chatFont,
          vodsPerLoad: input.vodsPerLoad,
        },
      });

      return settings;
    }),
});
