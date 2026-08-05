# nn2k.top

个人作品集 · Astro + Cloudflare Pages。

## 本地开发

```sh
pnpm install
pnpm dev            # http://localhost:4321
pnpm build          # 产物输出到 ./dist
pnpm preview        # 本地预览构建产物
```

需要 Node ≥ 22.12。

### pnpm 11 注意

pnpm 11 改了 build script 策略：`esbuild` 和 `workerd` 的安装脚本需要显式允许。
仓库里已经 `pnpm approve-builds` 处理过了，记录在 `pnpm-workspace.yaml`。

如果之后装新依赖遇到：

```
Ignored build scripts: <pkg>
Run "pnpm approve-builds" to pick which dependencies should be allowed to run scripts.
```

执行 `pnpm approve-builds <pkg>` 即可。

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

## 部署到 Cloudflare Pages

1. **推到 GitHub**
   ```sh
   gh repo create nn2k.top --public --source=. --remote=origin --push
   ```
   或者自己建 repo 后 `git remote add` + `git push`。

2. **在 Cloudflare 控制台绑定项目**
   - 进入 [Pages](https://dash.cloudflare.com/?to=/:account/pages)
   - "Create application" → "Pages" → "Connect to Git"
   - 选择 `nn2k.top` 仓库

3. **构建设置**（第一次连接时填）

   | 项              | 值                              |
   | --------------- | ------------------------------- |
   | Framework preset| Astro                          |
   | Build command   | `pnpm build`                    |
   | Build output    | `dist`                          |
   | Root directory  | （留空）                        |
   | Node version    | 环境变量 `NODE_VERSION=22`      |

   > CF Pages 默认用 npm；切到 pnpm 需要在 "Environment variables" 里加
   > `PNPM_ENABLE=true`，或在构建命令前加 `corepack enable pnpm`。

4. **自定义域名 nn2k.top**
   - 域名如果已在 Cloudflare DNS 解析，直接在 Pages → "Custom domains" 添加即可
   - 如果域名在别处，把 DNS 的 `www`（和裸域）改成 Cloudflare Pages 提供的 CNAME 记录

5. **后续每次 `git push` 自动构建部署**。

## 目录速览

```
src/
├── content.config.ts      # 内容集合 schema
├── content/projects/      # 项目 markdown
├── layouts/Base.astro     # 基础 HTML 壳
├── components/            # Header / Footer / ProjectCard / Seal
├── pages/                 # 路由
│   ├── index.astro
│   ├── about.astro
│   └── projects/
│       ├── index.astro
│       └── [...slug].astro
└── styles/global.css      # 设计 token + 基础排版
```

## 设计方向（备忘）

- 暖纸 `#F1EEE7` + 墨黑 `#1A1814` + 一处朱砂红 `#B5302A`
- 标题 IBM Plex Serif，正文中文字体走系统栈
- 签名元素：印章（`src/components/Seal.astro`），一处即可，多了会腻
- 暗色模式跟随系统，`prefers-color-scheme`

## 待办

- [ ] 替换占位项目内容
- [ ] 决定 Seal 字符（现在是「印」，可换成自己名字 / 真实印章）
- [ ] 写关于页面
- [ ] 接评论 / 分析（如需要）