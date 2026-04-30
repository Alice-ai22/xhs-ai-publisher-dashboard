# XHS AI Publisher Dashboard

一个本地部署的小红书内容工作流面板，聚焦“AI 生成 + 人工审核 + 手动发布”这条合规链路，帮助个人创作者或小团队把账号定位、选题、生成、审核、排期和发布整理进同一个工作台。

## 项目定位

这个项目**不是**自动发帖工具，也**不会**实现以下能力：

- 自动登录
- 自动发帖
- 验证码绕过
- 非官方接口发布
- 任何绕过平台风控的行为

当前版本的设计原则是：

- AI 负责内容草拟、结构化输出和辅助提效
- 人工负责审核、修改、确认发布
- 发布阶段仅提供“复制内容 / 下载图片 / 回填链接”的辅助能力

## 功能预览

- Dashboard 工作台：查看待生成、待审核、待发布、已发布统计
- 账号定位：配置人设、受众、风格、禁用词、常用标签
- 选题库：沉淀选题方向、关键词、参考内容和模板类型
- 内容生成：基于模板和选题调用 AI 生成标题、正文、标签、封面提示词等
- 草稿审核：查看草稿、编辑内容、复制字段、流转状态
- 发布日历：按日期和时间安排内容发布节奏
- 发布助手：整理待发布内容包，手动发布后回填链接
- 系统设置：配置 OpenAI 兼容接口、模型和合规检查开关
- 日志页：查看文本/图片生成记录和失败原因

## 技术栈

- 前端：Next.js 16 + React 19 + TypeScript
- 样式：Tailwind CSS 4
- 后端：Next.js Route Handlers
- 数据库：SQLite + Prisma
- 校验：Zod
- 测试：Vitest

## 截图

仓库内提供了一张首页 Dashboard 截图示例：

- [Dashboard Screenshot](./data/screenshot-home.png)

如果你准备对外展示项目，建议补充 `generate`、`drafts`、`export` 三个页面截图。

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

```bash
cp .env.example .env
```

`.env` 示例：

```env
DATABASE_URL="file:./dev.db"
AI_BASE_URL="https://api.openai.com/v1"
AI_API_KEY="sk-your-api-key-here"
AI_TEXT_MODEL="gpt-4o"
AI_IMAGE_MODEL="dall-e-3"
LOCAL_SAVE_PATH="./data/assets"
```

说明：

- `AI_*` 变量也可以在网页设置页中维护
- 没有可用的图片模型时，系统仍可生成图片提示词

### 3. 初始化数据库

```bash
npm run db:migrate
npm run db:generate
npm run db:seed
```

如果你希望清空并重建本地数据库：

```bash
npm run db:reset
```

### 4. 启动项目

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)

### 5. 首次使用建议顺序

1. 先进入“账号定位”创建账号画像
2. 再进入“选题库”添加选题
3. 然后到“内容生成”调用 AI 生成草稿
4. 在“草稿审核”页人工筛选和修改
5. 最后通过“发布助手”手动发布并回填链接

## 常用命令

```bash
npm run dev          # 启动开发服务器
npm run build        # 构建生产版本
npm run start        # 启动生产服务器
npm run lint         # 代码检查
npm run test         # 运行测试
npm run db:migrate   # 执行 Prisma 迁移
npm run db:generate  # 生成 Prisma Client
npm run db:seed      # 导入示例数据
npm run db:reset     # 重置数据库并导入示例数据
npm run db:studio    # 打开 Prisma Studio
```

## 数据模型

| 模型 | 说明 |
|------|------|
| `UserProfile` | 账号定位信息 |
| `Topic` | 选题库 |
| `Draft` | 内容草稿 |
| `GeneratedImage` | 图片生成记录 |
| `PublishSchedule` | 发布排期 |
| `ApiSettings` | API 配置 |
| `GenerationLog` | AI 调用日志 |

## 草稿状态流转

```text
Draft -> NeedsEdit -> Draft
Draft -> ReadyToPublish -> Published
```

- `Draft`：初始生成状态
- `NeedsEdit`：需要人工修改
- `ReadyToPublish`：审核通过，准备发布
- `Published`：已完成发布并回填结果

## 项目结构

```text
xhs-ai-publisher-dashboard/
├── prisma/               # 数据模型、迁移、种子数据
├── src/
│   ├── app/              # App Router 页面与 API 路由
│   ├── components/       # 通用组件
│   ├── lib/              # 工具函数、校验、状态常量、AI 客户端
│   ├── prompts/          # 文案生成 Prompt
│   └── types/            # 类型定义
├── tests/                # 纯逻辑测试
└── data/                 # 本地资源目录（默认不提交生成产物）
```

## 当前边界

这个项目目前更适合：

- 本地部署
- 单人或小团队使用
- 验证内容工作流
- 作为独立开发者项目继续迭代

它目前还没有覆盖：

- 多用户权限系统
- 远程对象存储
- 团队协作审阅
- 正式商业化所需的安全治理

## Roadmap

- 补充更多页面截图和演示素材
- 完善开源协作体验，例如 issue / PR 模板
- 继续增强内容工作流相关的稳定性和可维护性
- 逐步补充更适合长期使用的配置与排障能力

## 开发说明

- 提交前请至少运行 `npm run lint` 和 `npm run build`
- 当前测试主要覆盖纯函数、字段解析与 schema 校验
- 如果你要扩展发布能力，请优先保持“人工审核 + 手动发布”的产品边界

## 开源协作

欢迎提 issue 或 PR。提交前建议先阅读：

- [CONTRIBUTING.md](./CONTRIBUTING.md)
- [SECURITY.md](./SECURITY.md)

## License

本项目使用 [MIT License](./LICENSE)。
