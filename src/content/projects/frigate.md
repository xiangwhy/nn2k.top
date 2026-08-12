---
title: "Frigate NVR"
summary: "家庭 NVR：Frigate 0.17 + YOLO 实时检测 7 路 Hikvision，内网 192.168.1.8。"
year: 2026
tags: ["Frigate", "YOLO", "ONNX", "Docker", "NVR"]
featured: false
order: 70
---

> **192.168.1.8:5000** — 仅内网可达，没有公网入口；7 路 Hikvision 摄像头全部走 YOLO COCO 80 类实时检测，UI 上能看到绿框。

## 项目背景

自从有了 AI，把很多以前没办法实现的想法慢慢做出来了 — Frigate NVR 是其中最贴近日常的一个：家里 7 路摄像头原本只是录像回放，想做的是「进门有人 / 院子进猫」这类实时提示，但又不想交云服务月费，干脆自己搭一台 NVR。

整套是 [Frigate 0.17](https://github.com/blakeblackshear/frigate) 容器 + go2rtc + YOLOv8 ONNX 模型跑在一台内网 Linux 小主机（`192.168.1.8`）上，RTSP 走 Hikvision 录像机 `172.30.1.10:554` 中转。摄像头全部 `cam101 ~ cam701`，UI 上「4 宫格」分组显示主入口和三个室外点。

## 我做了什么

- **部署形态**：单 docker 容器跑 `ghcr.io/blakeblackshear/frigate:stable`，配置宿主 `/opt/frigate/config/config.yml` 挂到容器内 `/config/`；模型 `yolo26n.onnx`（9.5 MB，COCO 80 类）放 `model_cache/`，每次改配置前先 `cp ... .bak.$(date +%s)`，目前目录下有 4 个备份轮换。
- **流复用**：7 路 RTSP 不直接喂 Frigate，先过 go2rtc（容器内 8554）转发；UI 直播和检测进程读的是 `rtsp://127.0.0.1:8554/<cam_name>`，避免重复拉 RTSP 把录像机打满。WebRTC 信令开 TCP+UDP `8555`，但实际 UI 默认走 jsmpeg（见下文坑）。
- **检测**：现在用 ONNX CPU detector 跑通，`detect.width/height: 2560x1440`，`fps: 1`；snapshots 默认保留 14 天。

### 修过的三个 YOLO 配置坑

启用检测 → Frigate 启动 → 几秒内崩溃 → watchdog 重启循环。三个原因叠在一起：

1. **`model_type` 改名**：Frigate 0.17 删了 `yolov8 / v9 / v10 / v11` 这些具体选项，只剩 `dfine / rfdetr / ssd / yolox / yolonas / yolo-generic`。配置里写 `yolov8` 直接 schema 校验失败。
2. **detector 段用 `model_path` 扁平写**，不是嵌套的 `model: {path: ...}`；其它模型参数（`width / height / input_tensor / input_pixel_format / input_dtype`）放在**顶层 `model:`**。schema 上 `detector_config.model` 标了 `extra="allow"`，嵌套写法表面上合法但 `model.path` 实际不被读。
3. **`input_dtype` 默认 `int`（uint8）**，YOLOv8 ONNX 期望 `float32`；不写 `input_dtype: float` 会触发 ONNX Runtime InvalidArgument。

最终可用的核心段：

```yaml
detectors:
  cpu1:
    type: onnx
    model_path: /config/model_cache/yolo26n.onnx

model:
  model_type: yolo-generic
  width: 640
  height: 640
  input_tensor: nchw
  input_pixel_format: rgb
  input_dtype: float
```

> 模型文件名是 `yolo26n.onnx`（误导），实际是 YOLOv8/v11 架构，原始 `.pt` 同目录留了一份。

### 还在跑的事

每次改 `config.yml` 走同一套动作：本地备份 → `docker restart frigate` → `docker logs frigate --tail 100 | grep -iE 'error|warn|loaded'` 看启动状态 → UI 上摄像头卡出现绿框才算通。

## 已知未解 / 显式没做

按口头确认过不在范围内：

- ❌ **录像**：`record:` 没启用，时间轴没有视频回放，纯粹 live + snapshots
- ❌ **MQTT / Home Assistant 联动**：`mqtt.enabled: false`
- ❌ **Coral / GPU 加速**：当前 ONNX CPU detector 跑通够用，CPU 占用高但能扛；接 Coral TPU 是后续清单第一项
- ❌ **HWaccel**：服务端无 GPU/NVENC，ffmpeg 纯软解
- ❌ **多区域 / 运动检测 / 物体过滤**：只用 COCO 80 类默认阈值
- ❌ **WebRTC 强制**：Frigate 0.17 `CameraLiveConfig` schema 只有 `streams/height/quality`，加 `live: streaming: webrtc` 会校验失败（验证过，已回滚备份保留）

### 🐛 Windows Chrome live 黑屏

192.168.1.63（Windows Chrome 148+ / Edge）打开摄像头 live → 黑屏 + 主线程卡死；Mac / 192.168.1.1 / 192.168.1.42 上同样路径完全正常。

逐项排除后定位：**Windows Chrome 148+ 的 jsmpeg / WebAssembly / Canvas 渲染 bug**——Frigate 0.17 默认浏览器直播走 jsmpeg（WebSocket + JS 解 mpeg1），新版 Chrome 上 Canvas paint 占满主线程。Frigate 端没字段可绕，绕行方案在文档里列了 4 条（换 Firefox / Edge 加启动参数 / 降 Chrome / 用 VLC 直连 RTSP），长期只能等 Frigate 或 jsmpeg 更新。

## 文档

`HANDOVER.md` 在隔壁仓库（`/Users/xiang/projects/nvr/HANDOVER.md`），把上面所有踩坑 / 命令 / 备份文件位置 / 已知问题都归档了——因为这个项目不是 git 仓库、不发版，文档就是它的 commit log。

---

**访问**：仅内网 `http://192.168.1.8:5000`（Frigate UI，未启用 auth）