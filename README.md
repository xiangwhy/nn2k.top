# nn2k.top

个人作品集 · Astro + Cloudflare。

栈：Astro 7 · `@astrojs/cloudflare` adapter · pnpm 11 · 自动部署到 Cloudflare Workers（通过 `wrangler deploy`），自定义域 `nn2k.top`。

## 本地开发

```sh
pnpm install
pnpm dev            # http://localhost:4321
pnpm build          # 产物输出到 ./dist
pnpm preview        # 本地预览构建产物
```

需要 Node ≥ 22.12。

### pnpm 11 注意（本地）

pnpm 11 改了 build script 策略：`esbuild` / `workerd` 等包需要显式允许 install 时跑原生脚本。
仓库里已经 `pnpm approve-builds` 处理过，记录在 `pnpm-workspace.yaml` 的 `allowBuilds:` 下。

新装依赖后如果遇到：

```
Ignored build scripts: <pkg>
Run "pnpm approve-builds" to pick which dependencies should be allowed to run scripts.
```

执行 `pnpm approve-builds <pkg>` 即可（pnpm 11）。pnpm 10 走 `.npmrc#only-built-dependencies[]` 兜底。

### pnpm 10 注意（CI / Cloudflare Pages）

Cloudflare Pages 默认装 pnpm 10.x。pnpm 10 对 `pnpm-workspace.yaml` 的处理和 11 不同：

- pnpm 10 **要求** workspace 文件里有 `packages:` 字段，没有就报错 `packages field missing or empty`
- 本仓库用 `packages: []` 声明这是单 package、非 workspace

`.npmrc` 里同时维护了 `only-built-dependencies[]` 列表，作为 pnpm 10 的兜底（pnpm 11 忽略这行，靠 `allowBuilds:`）。

## 内容结构

每个项目是一个 markdown 文件，放在 `src/content/projects/` 下：

```
src/content/projects/
  my-project.md
  another-thing.mdx
```

frontmatter 字段（schema 见 `src/content.config.ts`）：

| 字段       | 必填 | 说明                                       |
| ---------- | ---- | ------------------------------------------ |
| `title`    | ✓    | 项目名                                     |
| `summary`  | ✓    | 列表卡片上的一句话描述                     |
| `year`     | ✓    | 年份                                       |
| `tags`     | ✗    | 标签数组                                   |
| `link`     | ✗    | 线上地址（可访问的 URL）                   |
| `repo`     | ✗    | 源码仓库 URL                               |
| `cover`    | ✗    | 封面图路径（`/covers/foo.jpg`）           |
| `featured` | ✗    | `true` 时出现在首页 hero                   |
| `draft`    | ✗    | `true` 时构建排除，便于写未完成的内容     |
| `order`    | ✗    | 排序权重，数字越大越靠前                   |

正文用标准 markdown，可加 `.mdx` 文件使用组件。

## 部署

代码仓库：[github.com/xiangwhy/nn2k.top](https://github.com/xiangwhy/nn2k.top)
线上地址：https://nn2k.top

部署走 **Cloudflare Pages + GitHub 集成**：push 到 `main` 自动构建+部署。

实际部署载体是 **Cloudflare Workers** —— 不是纯 Pages 静态托管。原因：CF Pages 检测到 `@astrojs/cloudflare` adapter 生成的 `dist/wrangler.json` 后会自动跑 `npx wrangler deploy`，把 `dist/client/` 作为 Workers Assets 部署。这个路径下：

- 站点运行在 `*.workers.dev`（当前 `nn2k-top.nn2k.workers.dev`）
- 自定义域 `nn2k.top` 通过 Workers → Triggers → Custom Domains 绑定
- 自定义域配置在 Cloudflare dashboard 的 **Workers**，不是 Pages

### 首次部署（参考）

**1. GitHub repo**

```sh
gh repo create nn2k.top --public --source=. --remote=origin --push
```

**2. CF Pages 创建项目**
- [dash.cloudflare.com](https://dash.cloudflare.com/?to=/:account/pages) → Workers & Pages → Create application → Pages → Connect to Git
- 选 `xiangwhy/nn2k.top`

**3. Build 配置**

| 字段               | 值                              |
| ------------------ | ------------------------------- |
| Framework preset   | Astro                           |
| Build command      | `pnpm build`                    |
| Deploy command     | `npx wrangler deploy`（**不要清空**） |
| Root directory     | （留空）                        |

**4. 环境变量**

| Variable        | Value |
| --------------- | ----- |
| `NODE_VERSION`  | `22`  |
| `PNPM_ENABLE`   | `true` |

不设 `PNPM_ENABLE=true` 的话 CF Pages 会走默认 npm 构建，`pnpm-workspace.yaml` 路径会触发 pnpm 10 的兼容报错。

**5. 绑定自定义域**
- Workers & Pages → `nn2k-top` worker → Settings → Triggers → Custom Domains → Add Custom Domain
- 域名 DNS 已在 Cloudflare 时自动加记录；否则去注册商加 CNAME 指向 `nn2k-top.nn2k.workers.dev`（根域可能用 ALIAS / ANAME）

### 日常部署

改完代码 `git push`，CF Pages 自动重新构建+部署，约 1 分钟生效。

## 目录速览

```
src/
├── content.config.ts      # 内容集合 schema
├── content/projects/      # 项目 markdown（占位 → 真实项目）
├── layouts/Base.astro     # 基础 HTML 壳
├── components/            # Header / Footer / ProjectCard / Seal
├── pages/
│   ├── index.astro        # 首页：hero + 重点项目 + 其他列表
│   ├── about.astro        # 关于页（待写）
│   └── projects/
│       ├── index.astro    # 项目全列表
│       └── [...slug].astro# 项目详情（动态路由）
└── styles/global.css      # 设计 token + 基础排版

根目录：
├── astro.config.mjs       # CF adapter + sitemap + mdx 集成
├── pnpm-workspace.yaml    # pnpm 11 allowBuilds（pnpm 10 兼容用 packages: []）
├── .npmrc                 # pnpm 10 兜底的 only-built-dependencies
└── public/                # favicon 等静态资源
```

## 设计方向（备忘）

- 暖纸 `#F1EEE7` + 墨黑 `#1A1814` + 一处朱砂红 `#B5302A`
- 标题 IBM Plex Serif，正文中文字体走系统栈
- 签名元素：印章（`src/components/Seal.astro`），字符当前是「翔」，出现在 Header 品牌名旁 + 首页 hero 各一次
- 暗色模式跟随系统 `prefers-color-scheme`，自动切换调色板
- 设计有意避开 AI 默认三模板（奶油 + 衬线 / 纯黑 + 荧光 / 报纸分栏）

## 待办

- [ ] 替换 `src/content/projects/placeholder-*.md` 为真实项目
- [ ] 写 `src/pages/about.astro` 正文
- [ ] （可选）评论 / 分析：Giscus + Plausible / Umami 都免费，按需接入