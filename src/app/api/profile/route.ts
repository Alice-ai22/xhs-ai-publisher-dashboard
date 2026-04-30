import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, okEmpty, badRequest, serverError } from "@/lib/api-response";
import { profileCreateSchema, profileUpdateSchema } from "@/lib/schemas";

// GET - 获取所有用户画像
export async function GET() {
  try {
    const profiles = await prisma.userProfile.findMany({
      orderBy: { createdAt: "desc" },
    });
    return ok(profiles);
  } catch (error) {
    return serverError(error);
  }
}

// POST - 创建用户画像
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = profileCreateSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(
        parsed.error.issues.map((i) => i.message).join("; ")
      );
    }

    const profile = await prisma.userProfile.create({
      data: parsed.data,
    });
    return ok(profile);
  } catch (error) {
    return serverError(error);
  }
}

// PUT - 更新用户画像
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = profileUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(
        parsed.error.issues.map((i) => i.message).join("; ")
      );
    }

    const { id, ...data } = parsed.data;
    const profile = await prisma.userProfile.update({
      where: { id },
      data,
    });
    return ok(profile);
  } catch (error) {
    return serverError(error);
  }
}

// DELETE - 删除用户画像
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return badRequest("缺少 id");
    }
    await prisma.userProfile.delete({ where: { id } });
    return okEmpty();
  } catch (error) {
    return serverError(error);
  }
}
