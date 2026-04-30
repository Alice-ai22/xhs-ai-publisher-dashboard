import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateMarkdown, generateNoteJson } from "@/lib/export";
import { parseStringArray, parseChecklist } from "@/lib/json-fields";
import { badRequest, notFound, serverError } from "@/lib/api-response";
import type { PublishPackage } from "@/types";

// GET - 导出草稿发布包
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const draftId = searchParams.get("draftId");
    const format = searchParams.get("format") || "json"; // json | markdown

    if (!draftId) {
      return badRequest("缺少 draftId");
    }

    const draft = await prisma.draft.findUnique({
      where: { id: draftId },
      include: { profile: true, images: true },
    });

    if (!draft) {
      return notFound("草稿不存在");
    }

    const titles = parseStringArray(draft.titles);
    const hashtags = parseStringArray(draft.hashtags);
    const imagePrompts = parseStringArray(draft.contentImagePrompts);
    const publishChecklist = parseChecklist(draft.publishChecklist);

    const pkg: PublishPackage = {
      title: titles[0] || "",
      body: draft.body,
      hashtags,
      coverPrompt: draft.coverImagePrompt,
      imagePrompts,
      publishChecklist,
      commentGuide: draft.commentGuide || "",
      riskDisclaimer: draft.riskDisclaimer || "",
      noteJson: {},
    };

    // 生成 noteJson
    pkg.noteJson = generateNoteJson(
      pkg,
      draft.profile?.name || ""
    );

    if (format === "markdown") {
      const md = generateMarkdown(pkg);
      return new NextResponse(md, {
        headers: {
          "Content-Type": "text/markdown; charset=utf-8",
          "Content-Disposition": `attachment; filename="xhs-note-${draftId}.md"`,
        },
      });
    }

    return NextResponse.json({ success: true, data: pkg });
  } catch (error) {
    return serverError(error);
  }
}
