---
title: "chnroute"
summary: "chnroute fork：MikroTik RouterOS 路由规则每日自动刷，CN IP + gfwlist 即用脚本。"
year: 2026
tags: ["RouterOS", "Bash", "GitHub Actions", "Networking"]
repo: "https://github.com/xiangwhy/chnroute"
featured: false
order: 80
---

> **[CN.rsc](https://github.com/xiangwhy/chnroute/blob/main/CN.rsc)** — 每日自动刷的中国 IPv4 路由脚本，复制粘贴进 MikroTik Terminal 即可 import。

## 项目背景

自从有了 AI，把很多以前没办法实现的想法慢慢做出来了 — chnroute fork 属于另一类：把日常里的小琐碎自动化。

<!-- TODO：1-2 句 fork 的具体动机 — 比如「上游停更」「RouterOS v7 上游没适配」「macOS 上跑不动」。 -->

## 我做了什么

`chnroute` fork 自 [ruijzhan/chnroute](https://github.com/ruijzhan/chnroute)，主链路是 GitHub Actions 每日拉 iwik.org 中国 IP + gfwlist 域名 → 串 `generate.sh` → 输出多套格式脚本：

| 产物 | 用途 |
|---|---|
| `CN.rsc` | RouterOS 标准地址列表 |
| `CN_mem.rsc` | 内存优化版（避免磁盘 I/O，给资源紧的设备） |
| `LAN.rsc` | 内网 IPv4 段 |
| `gfwlist.rsc` | RouterOS 6 DNS 规则 |
| `gfwlist_v7.rsc` | RouterOS v7.6+ 优化（用 Match Subdomains） |
| `03-gfwlist.conf` | dnsmasq 格式（OpenWrt 等） |

我在 fork 上的几条实质改动：

- **macOS 兼容性**：BSD sed/awk vs GNU 的差异（`generate.sh` 之前在 macOS 跑会炸，修了 — 见 [8469e1c](https://github.com/xiangwhy/chnroute/commit/8469e1c)）
- **时区 fix**：`CN.rsc` 顶部的 generation timestamp 用北京时区 (UTC+8) 写，避免 RouterOS 端按 UTC 排错
- **RouterOS v7 优化**：单独输出 `gfwlist_v7.rsc`，利用 v7.6+ 的 Match Subdomains 减少规则数
- **代码审查全量过一遍**：lib/ 抽出更细、按职责拆，shellcheck 0 warning
- **address-list 名重命名** `CN` → `List_ALL_China`：避免和用户既有 firewall rule 名字冲突，同时从生成脚本里去掉多余的 `address-list remove` 命令

自动化：GitHub Actions `main.yaml` 每日 UTC 跑一次，把生成文件直接 commit 回 main 分支，所以 commit 历史里绝大部分是这种 `Automated update: 2026-07-01 ...` 字样的 stamp。

## 结果

- **797 commits**，绝大多数是自动化刷新留下来的；实质改动集中在最近几次
- **测试**：`make test` / `make ci-test` 跑全链路（依赖检查 → shellcheck → 生成 → 校验输出 → benchmark），能在本地一次性 dry-run
- **产物** `CN.rsc` / `gfwlist_v7.rsc` 是真有人用的——RouterOS 设备每天 import 这个文件就能拿到当日的中国 IP 段，免去手维护

---

**链接**：[源码仓库](https://github.com/xiangwhy/chnroute) · GitHub Actions 自动更新 badge 在 README 顶部
