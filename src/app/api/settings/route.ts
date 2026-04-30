import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, badRequest, serverError } from "@/lib/api-response";
import { settingsUpdateSchema } from "@/lib/schemas";

// GET - 获取 API 设置
export async function GET() {
  try {
    let settings = await prisma.apiSettings.findFirst();
    if (!settings) {
      settings = await prisma.apiSettings.create({ data: {} });
    }
    return ok(settings);
  } catch (error) {
    return serverError(error);
  }
}

// PUT - 更新 API 设置
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = settingsUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(
        parsed.error.issues.map((i) => i.message).join("; ")
      );
    }

    let settings = await prisma.apiSettings.findFirst();

    if (!settings) {
      settings = await prisma.apiSettings.create({
        data: parsed.data,
      });
    } else {
      settings = await prisma.apiSettings.update({
        where: { id: settings.id },
        data: parsed.data,
      });
    }

    return ok(settings);
  } catch (error) {
    return serverError(error);
  }
}
