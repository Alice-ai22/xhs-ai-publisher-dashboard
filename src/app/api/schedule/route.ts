import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, okEmpty, badRequest, serverError } from "@/lib/api-response";
import { scheduleCreateSchema, scheduleUpdateSchema } from "@/lib/schemas";

// GET - 获取发布日程
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const where: Record<string, unknown> = {};
    if (startDate && endDate) {
      where.date = { gte: startDate, lte: endDate };
    }

    const schedules = await prisma.publishSchedule.findMany({
      where,
      include: { draft: true },
      orderBy: [{ date: "asc" }, { time: "asc" }],
    });

    return ok(schedules);
  } catch (error) {
    return serverError(error);
  }
}

// POST - 创建发布日程
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = scheduleCreateSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(
        parsed.error.issues.map((i) => i.message).join("; ")
      );
    }

    const schedule = await prisma.publishSchedule.create({
      data: parsed.data,
      include: { draft: true },
    });

    // 更新草稿的排期信息
    await prisma.draft.update({
      where: { id: parsed.data.draftId },
      data: {
        scheduledDate: parsed.data.date,
        scheduledTime: parsed.data.time,
      },
    });

    return ok(schedule);
  } catch (error) {
    return serverError(error);
  }
}

// PUT - 更新日程（拖拽调整日期）
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = scheduleUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(
        parsed.error.issues.map((i) => i.message).join("; ")
      );
    }

    const { id, ...data } = parsed.data;
    const schedule = await prisma.publishSchedule.update({
      where: { id },
      data,
      include: { draft: true },
    });

    // 同步更新草稿排期
    if (data.date || data.time) {
      await prisma.draft.update({
        where: { id: schedule.draftId },
        data: {
          ...(data.date ? { scheduledDate: data.date } : {}),
          ...(data.time ? { scheduledTime: data.time } : {}),
        },
      });
    }

    return ok(schedule);
  } catch (error) {
    return serverError(error);
  }
}

// DELETE - 删除日程
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return badRequest("缺少 id");
    }
    await prisma.publishSchedule.delete({ where: { id } });
    return okEmpty();
  } catch (error) {
    return serverError(error);
  }
}
