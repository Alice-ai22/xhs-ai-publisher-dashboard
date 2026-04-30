import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, okEmpty, badRequest, serverError } from "@/lib/api-response";
import { topicCreateSchema, topicUpdateSchema } from "@/lib/schemas";

// GET - 获取选题列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const where = status ? { status } : {};
    const topics = await prisma.topic.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { profile: true, _count: { select: { drafts: true } } },
    });
    return ok(topics);
  } catch (error) {
    return serverError(error);
  }
}

// POST - 创建选题
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = topicCreateSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(
        parsed.error.issues.map((i) => i.message).join("; ")
      );
    }

    const topic = await prisma.topic.create({
      data: parsed.data,
    });
    return ok(topic);
  } catch (error) {
    return serverError(error);
  }
}

// PUT - 更新选题
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = topicUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(
        parsed.error.issues.map((i) => i.message).join("; ")
      );
    }

    const { id, ...data } = parsed.data;
    const topic = await prisma.topic.update({
      where: { id },
      data,
    });
    return ok(topic);
  } catch (error) {
    return serverError(error);
  }
}

// DELETE - 删除选题
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return badRequest("缺少 id");
    }
    await prisma.topic.delete({ where: { id } });
    return okEmpty();
  } catch (error) {
    return serverError(error);
  }
}
