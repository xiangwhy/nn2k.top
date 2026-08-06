---
title: "SMS Forwarder"
summary: "ESP32-S3 4G 模组固件，SMS 收到自动推微信，单文件 main.cpp 撑起全栈。"
year: 2026
tags: ["ESP32", "C++", "Embedded", "USB CDC", "OTA"]
repo: "https://github.com/xiangwhy/sms-forwarder-esp32"
featured: false
order: 90
---

> **[v4.0.31 release](https://github.com/xiangwhy/sms-forwarder-esp32/releases/latest)** — 当前生产是 v4.0.30（真机烧录），含 15 段 concat 拼接 + Web OTA。

## 项目背景

自从有了 AI，把很多以前没办法实现的想法慢慢做出来了 — 这个 SMS Forwarder 也是其中之一。

<!-- TODO：1-2 句具体动机 — 比如「出差不想带双手机」「家里 4G 副卡需要无人值守收短信」等，写你最具体的那个。 -->

## 我做了什么

ESP32-S3 单芯片 + ML307 4G 模组的 SMS 转发器，业务逻辑塞进单文件 `main.cpp`（~3300 行）。

- **USB Host + CDC + AT 命令驱动 ML307**：4G 模组状态（AT 握手 / SIM / 信号）实时推 LED（GPIO7/15/6）
- **完整 SMS PDU 解码**：7-bit / UCS-2 / 中日泰文；手写 UDH 拼接支持最长 15 段 concat SMS（v4.0.30 修过 `body_hex` 截断 + 栈溢出）
- **NVS 落盘 + 8 条消息缓冲**推送队列，HTTPS 失败 30s 自动重发；上电先 drain 一轮残留
- **内嵌 Web UI**：CSS + JS 全在 PROGMEM 字符串，无外部资源；SPA 用 iframe + 父页每 5s 拉 `/api/status` 共享状态给子页
- **Web OTA 整包烧录**（BasicAuth）—— 远程升级无需串口
- **零硬编码凭据**：NVS 没配置就强制 AP 模式起来，引导用户在 `192.168.4.1` 配网；凭据全部 NVS

## 结果

- 迭代到 **v4.0.31**（生产烧 v4.0.30，2026-07-10），每个 bug 一个版本号，10+ 个 fix tag
- 修过：concat SMS UDH `total<=8` 错位 (v4.0.29) → `body_hex` 截断 (v4.0.30)、`stash_udh_part` 没跳 UDHL+UDH 头部导致乱码 (v4.0.26.2)、NVS 残留 push 队列顺序 (v4.0.25/26)
- **已知未解**：`dtac` gateway 偶发 raw UD bytes（4 层 sniff 仍 cover 不到），备注在 ROADMAP 留底，不是没看见
- **能 host-test 的部分都 host-test 化**：`pdu_codec` 抽成独立 `.cpp/.h`，PC 端 `tests/host/` 跑 CMake + CTest，编码边界先在 PC 上钉死再下硬件

---

**链接**：[源码仓库](https://github.com/xiangwhy/sms-forwarder-esp32) · [Releases](https://github.com/xiangwhy/sms-forwarder-esp32/releases) · 架构详见 `HANDOVER.md`
