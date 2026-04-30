import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, serverError } from "@/lib/api-response";

// GET - 获取生成日志
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status"); // success | error
    const type = searchParams.get("type"); // text | image
    const limit = Math.min(Number(searchParams.get("limit") || 50), 200);

    const where: Record<string, string> = {};
    if (status) where.status = status;
    if (type) where.type = type;

    const logs = await prisma.generationLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return ok(logs);
  } catch (error) {
    return serverError(error);
  }
}
