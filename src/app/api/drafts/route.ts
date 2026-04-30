import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, okEmpty, badRequest, serverError } from "@/lib/api-response";
import { draftUpdateSchema } from "@/lib/schemas";
import { ALL_DRAFT_STATUSES } from "@/lib/draft-status";

// GET - 获取草稿列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const where = status ? { status } : {};
    const drafts = await prisma.draft.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        topic: true,
        profile: true,
        images: true,
        schedules: true,
      },
    });
    return ok(drafts);
  } catch (error) {
    return serverError(error);
  }
}

// PUT - 更新草稿状态/内容
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = draftUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(
        parsed.error.issues.map((i) => i.message).join("; ")
      );
    }

    const { id, ...fields } = parsed.data;

    // 校验状态值
    if (fields.status && !ALL_DRAFT_STATUSES.includes(fields.status)) {
      return badRequest(`无效的状态值: ${fields.status}`);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: Record<string, any> = {};
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) {
        updateData[key] = value;
      }
    }

    // 标记已发布时自动记录发布时间
    if (fields.status === "Published") {
      updateData.publishedAt = new Date();
    }

    const draft = await prisma.draft.update({
      where: { id },
      data: updateData,
      include: { topic: true, profile: true, images: true },
    });
    return ok(draft);
  } catch (error) {
    return serverError(error);
  }
}

// DELETE - 删除草稿
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return badRequest("缺少 id");
    }
    await prisma.draft.delete({ where: { id } });
    return okEmpty();
  } catch (error) {
    return serverError(error);
  }
}
