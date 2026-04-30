import { prisma } from "@/lib/prisma";
import { format, subDays } from "date-fns";
import { ok, serverError } from "@/lib/api-response";

export async function GET() {
  try {
    const today = format(new Date(), "yyyy-MM-dd");
    const sevenDaysAgo = format(subDays(new Date(), 7), "yyyy-MM-dd");

    // 今日待生成（未生成状态的选题）
    const pendingTopics = await prisma.topic.count({
      where: { status: "未生成" },
    });

    // 待审核草稿
    const draftCount = await prisma.draft.count({
      where: { status: "Draft" },
    });

    // 待发布内容
    const readyToPublish = await prisma.draft.count({
      where: { status: "ReadyToPublish" },
    });

    // 已发布内容
    const published = await prisma.draft.count({
      where: { status: "Published" },
    });

    // 最近 7 天生成统计
    const recentDrafts = await prisma.draft.findMany({
      where: {
        createdAt: {
          gte: new Date(sevenDaysAgo + "T00:00:00"),
        },
      },
      select: { createdAt: true },
    });

    const dailyStats: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const date = format(subDays(new Date(), i), "yyyy-MM-dd");
      dailyStats[date] = 0;
    }
    recentDrafts.forEach((d) => {
      const date = format(d.createdAt, "yyyy-MM-dd");
      if (dailyStats[date] !== undefined) {
        dailyStats[date]++;
      }
    });

    // 今日排期
    const todaySchedules = await prisma.publishSchedule.findMany({
      where: { date: today },
      include: { draft: true },
      orderBy: { time: "asc" },
    });

    return ok({
      pendingTopics,
      draftCount,
      readyToPublish,
      published,
      dailyStats,
      todaySchedules,
    });
  } catch (error) {
    return serverError(error);
  }
}
