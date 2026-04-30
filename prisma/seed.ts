import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // 创建默认用户画像
  const profile = await prisma.userProfile.create({
    data: {
      name: "AI 内容研究员",
      positioning:
        "分享 AI 工具使用经验、内容工作流搭建和效率实践的内容创作者",
      targetAudience:
        "关注 AI 工具、内容效率和个人工作流优化的创作者与开发者",
      contentStyle: "真实经验分享、干货实用、像朋友聊天一样自然",
      bannedWords: "最好、第一、必须、绝对、保证、100%、全网最低、永久稳定、官方合作",
      commonTags:
        "#AI工具,#内容运营,#工作流,#效率提升,#创作者工具,#AI写作",
      productInfo:
        "一个帮助创作者整理内容生产流程的 AI 辅助工具",
      referralLink: "",
      adIntensity: "中",
      allowMarketing: true,
      defaultLength: "中",
    },
  });

  // 创建默认 API 设置
  await prisma.apiSettings.create({
    data: {
      aiBaseUrl: "https://api.openai.com/v1",
      aiApiKey: "",
      textModel: "gpt-4o",
      imageModel: "dall-e-3",
      defaultCount: 3,
      localSavePath: "./data/assets",
      enableSensitiveCheck: true,
      enableAdCheck: true,
    },
  });

  // 创建示例选题（5 种模板各一个）
  const topics = await Promise.all([
    // 干货教程型
    prisma.topic.create({
      data: {
        title: "Claude Code 安装到使用的完整教程",
        direction: "AI 编程工具使用教程",
        targetAudience: "想用 AI 辅助编程的开发者",
        keywords: "Claude Code,安装教程,AI编程,命令行工具",
        productHook:
          "在教程结尾自然带出自己整理工具链和工作流的方法论",
        contentType: "干货教程",
        profileId: profile.id,
      },
    }),

    // 避坑指南型
    prisma.topic.create({
      data: {
        title: "买 Token 前一定要看的 5 个避坑指南",
        direction: "AI 工具订阅和 API 使用避坑",
        targetAudience: "需要接入 AI 工具或 API 的用户",
        keywords: "API使用,AI工具,避坑指南,成本管理",
        productHook:
          "分享避坑经验后，自然带出更稳妥的工具选择和使用建议",
        contentType: "避坑指南",
        profileId: profile.id,
      },
    }),

    // 人设故事型
    prisma.topic.create({
      data: {
        title: "我为什么开始自己搭建 AI 中转站",
        direction: "个人工作流搭建经历",
        targetAudience: "对 AI 工具感兴趣的人、想做副业的人",
        keywords: "工作流搭建,AI工具,个人经历,技术分享",
        productHook:
          "在描述搭建过程时自然提到自己如何逐步沉淀出一套内容工作台",
        contentType: "人设故事",
        profileId: profile.id,
      },
    }),

    // 工具评测型
    prisma.topic.create({
      data: {
        title: "Claude Code 和 Codex 到底怎么选",
        direction: "AI 编程工具对比",
        targetAudience: "纠结选哪个 AI 编程工具的开发者",
        keywords: "Claude Code,Codex,AI编程工具,对比评测",
        productHook:
          "对比中自然带出不同工具在内容和开发工作流中的适用场景",
        contentType: "工具评测",
        profileId: profile.id,
      },
    }),

    // 引流软广型
    prisma.topic.create({
      data: {
        title: "分享一套我自己在用的 AI 内容工作流",
        direction: "AI 内容工作流经验分享",
        targetAudience: "想提升内容效率的创作者和独立开发者",
        keywords: "内容工作流,AI写作,创作者工具,效率提升",
        productHook:
          "核心内容是分享自己的真实使用流程，而不是直接推销某个服务",
        contentType: "引流软广",
        profileId: profile.id,
      },
    }),
  ]);

  console.log("✅ Seed 数据创建完成！");
  console.log(`  - 用户画像: ${profile.name}`);
  console.log(`  - 选题数量: ${topics.length}`);
  console.log(`  - 模板覆盖: 干货教程、避坑指南、人设故事、工具评测、引流软广`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
