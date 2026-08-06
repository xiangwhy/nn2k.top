---
title: "SinoRept"
summary: "sinorept.com — 爬宠双语产品展示站，从 CMS 到 VPS 自管自部署。"
year: 2026
tags: ["Next.js", "Payload CMS", "Tailwind", "Self-hosted", "i18n"]
link: "https://sinorept.com"
repo: "https://github.com/xiangwhy/sinorept"
featured: true
order: 100
---

> **[sinorept.com](https://sinorept.com)** — 双语切换、WhatsApp 询盘入口、产品画廊、自研排序算法都在前台，直接访问无需登录。

## 项目背景

自从有了 AI，把很多以前没办法实现的想法慢慢做出来了 — SinoRept 是其中一个。

<!-- TODO：1-2 句具体动机 — 是给真实业务用、朋友 / 熟人委托、还是想验证「自管 CMS + 自部署」全链路？避免从「为了练习 XX 技术」开头。 -->

## 我做了什么

整套站是单体 Next.js 16 应用跑出来的，前台 + 自管后台共用一个仓库。

- **前后端不分家**：用 Payload CMS 3 + SQLite 拉起完整后台（产品 / 分类 / 文章 / 媒体 / 询盘 / 浏览统计），schema 变更全部走 migration 文件，不开 `push: true` 自动改库。
- **从本地到 VPS 一条龙**：`deploy.sh` 跑本地构建 → rsync 到 VPS → `corepack` 拉锁定版本的 pnpm → `payload migrate` → `pm2 restart`，Nginx 反代 + Let's Encrypt 续期。
- **i18n 不靠路由 hack**：middleware 按 `/zh/` `/en/` 前缀 rewrite + 注入 `x-locale` header，页面统一通过 `getLocale()` / `getDictionary()` 取语言，URL 切换走 `window.location.pathname`。
- **数据驱动的产品排序**：自研 `rankFeaturedProducts`：7 天 ×0.5 + 30 天 ×0.3 + allTime ×0.2 加权，14 天内新品另叠 `FRESH_BOOST_MAX=5` 的 boost；同款再走 related 推荐。
- **后台也长出了数据**：pageview / 国家 / 来源 Top5 上 admin dashboard，再加 WhatsApp 入口点击的埋点转化漏斗。
- **SEOh 体检**：自建 `/admin/seo-health` 跑结构化数据 / sitemap / canonical 一类检查，发现 issue 直接给跳转按钮进对应 page 编辑页。
- **iOS Safari 那些坑**：FAB 拖拽 + 无限滚动用 server-rendered `<script type="text/javascript ">`（带末尾空格）触发 React 19 的 `isScriptDataBlock()` data block 分支，绕开 "Encountered a script tag" warning 又保证执行；字号、断词、mobile footer 邮箱一寸寸抠出来的。

## 结果

- 迭代到 **v2.16.7**，前后 16 个小版本，每个版本都是一次 deploy：版本历史写在 `package.json` + README + ROADMAP 三处对齐。
- 处理过一次 **destructive migration 误删 194 行 `products_locales`** 的事故，复盘归档在 `src/migrations/20260720_150000_products_category_nullable.ts` 头注释，留给下一个碰 schema 的自己。
- 工程债里留下的「smart-sort 权重校准」「SEO Health 自动修复 CTA」「Lightbox 相邻图预加载」都是 v2.17+ 的后路——不是没想好，是上线先稳。

---

**链接**：源码仓库 [xiangwhy/sinorept](https://github.com/xiangwhy/sinorept) · 后台 `/admin`
