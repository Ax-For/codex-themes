# 安装与启动故障排查

本文供用户或另一台机器上的 Agent 排查 Codex XP · QQ Theme 安装成功但启动时未加载的问题。

## 已验证兼容基线

截至 `2026-07-31`，最新完成实机验证的环境是：

| 项目 | 已验证值 |
|---|---|
| Codex Desktop | `26.727.40816` |
| macOS | `26.5.2` |
| 架构 | Apple Silicon (`arm64`) |
| 主题 | `xp-qq` |
| CDP 回环端口 | `9341` |

健康状态同时满足：

```text
processHasDebugFlag: true
portOpen: true
installed: true
mode: active
themeId: xp-qq
persistenceEnabled: true
failed: []
```

版本相同只能说明 Codex renderer 版本一致，不能证明安装运行时、本地状态、后台服务或启动参数一致。未来 Codex 更新 DOM 或禁用调试端口后，仍可能需要适配。

## 先理解四个独立层次

1. **源码仓库**：用户下载或执行 `git pull` 的目录。
2. **已安装运行时**：macOS 和 Windows 默认都复制到 `~/.codex/codex-themes`。
3. **本地状态**：
   - macOS：`~/Library/Application Support/CodexThemes`
   - Windows：`%APPDATA%\CodexThemes`
4. **后台启动服务**：
   - macOS LaunchAgent：`com.codex-themes.skin-controller`
   - Windows Scheduled Task：`Codex Themes Controller`

更新源码仓库不会自动更新已安装运行时。复制仓库到另一台机器，也不会复制或注册那台机器所需的本地状态和后台服务。

## 大版本更新后的自愈行为

安装当前版本后，后台链路按以下方式处理 Codex 自更新造成的短暂不一致：

- 后台控制器启动失败时不会立即结束常驻承诺，而是以最多 30 秒的退避继续巡检。
- macOS detached 重启排队后若没有出现 CDP renderer，同一可信 Codex 进程会在 45 秒冷却后重试；每个五分钟窗口最多三次，窗口到期自动重新武装，避免无限快速重启。
- macOS 服务状态会区分“LaunchAgent 已加载”和“控制器进程确实在运行”，避免把 crash/throttle 状态误报为健康。

本节的自愈保证只针对 macOS。它只恢复启动参数、后台进程和 renderer 注入链路，不会从网络自动更新仓库。当 Codex 大版本修改 DOM 或 Electron 行为时，仍需 `git pull` 后重新运行 macOS 安装器，把新代码复制到稳定安装目录并更新 LaunchAgent 定义。

## 最短恢复流程

### macOS

先完全退出 Codex，再从当前仓库运行安装器。直接在终端运行可以保留完整错误信息：

```bash
cd /实际路径/codex-themes
zsh studio/scripts/install.command
```

安装后检查实际安装副本，而不是仓库副本：

```bash
~/.codex/codex-themes/scripts/lib/run-cli.zsh doctor
~/.codex/codex-themes/scripts/lib/run-cli.zsh status
launchctl print "gui/$(id -u)/com.codex-themes.skin-controller"
```

### Windows

完全退出 Codex，然后在当前仓库运行：

```bat
studio\scripts\windows\install.bat
```

在 PowerShell 中检查后台任务和端口：

```powershell
Get-ScheduledTask -TaskName "Codex Themes Controller"
Get-NetTCPConnection -LocalAddress 127.0.0.1 -LocalPort 9341 -State Listen
```

若当前 PowerShell 可用 Node.js 22 或更高版本，还可以从仓库执行：

```powershell
node studio\src\cli.mjs doctor
node studio\src\cli.mjs status
```

## 分层诊断

### 1. 仓库与安装副本是否一致

macOS：

```bash
cd /实际路径/codex-themes
git rev-parse HEAD
shasum -a 256 \
  studio/src/cli.mjs \
  "$HOME/.codex/codex-themes/src/cli.mjs"
```

Windows PowerShell：

```powershell
git rev-parse HEAD
Get-FileHash .\studio\src\cli.mjs -Algorithm SHA256
Get-FileHash "$HOME\.codex\codex-themes\src\cli.mjs" -Algorithm SHA256
```

两个哈希不一致，说明只更新了仓库，没有更新实际运行的安装副本。重新运行安装器。

### 2. 后台服务是否存在并运行

macOS：

```bash
launchctl print "gui/$(id -u)/com.codex-themes.skin-controller"
```

健康输出应包含：

```text
state = running
```

并且 `arguments` 中的控制器路径应位于：

```text
~/.codex/codex-themes/src/cli.mjs
```

如果服务不存在、未运行，或者其中的 Node/控制器绝对路径已经不存在，请重新运行安装器。不要手工复制 LaunchAgent plist。

Windows：

```powershell
Get-ScheduledTask -TaskName "Codex Themes Controller" |
  Format-List TaskName, State, TaskPath
```

任务不存在时重新运行 Windows 安装器。

### 3. Codex 是否以可注入方式启动

macOS：

```bash
~/.codex/codex-themes/scripts/lib/run-cli.zsh doctor
```

重点读取：

| 结果 | 含义 | 处理 |
|---|---|---|
| `diagnosis: ok` | 调试参数和端口正常 | 继续检查 `status` |
| `running-no-flag` | Codex 正在运行，但启动参数被丢弃或被旧实例接管 | 完全退出所有 Codex 窗口和进程，再运行已安装的 `scripts/apply.command` |
| `flag-present-port-closed` | 进程带参数但 9341 没有开放 | 检查端口占用和控制器日志 |
| `not-running` | Codex 未运行 | 从安装后的启动入口或 `apply.command` 启动 |

检查端口：

```bash
lsof -nP -iTCP:9341 -sTCP:LISTEN
curl --fail --silent http://127.0.0.1:9341/json/list
```

9341 必须由当前可信 Codex 主进程监听。端口被其他程序占用时，不要直接终止未知进程；先确认进程身份。

### 4. renderer 是否完成注入

macOS：

```bash
~/.codex/codex-themes/scripts/lib/run-cli.zsh status
```

健康结果必须包含：

```json
{
  "installed": true,
  "mode": "active",
  "themeId": "xp-qq",
  "persistenceEnabled": true
}
```

同时顶层 `failed` 和 `results.failed` 都应为空数组。

常见异常：

- `persistenceEnabled: false`：当前会话可能生效，但下次启动不会保持。重新运行安装器，或在 Codex 顶部“换肤”菜单中打开“皮肤常驻”。
- `failed` 非空或全部主窗口失败：先确认 `doctor` 为 `ok`，再检查注入日志。
- 没有任何 `main` renderer：Codex 主窗口尚未完全加载，等待片刻后重试；持续为空则检查 9341 `/json/list`。

## 日志位置

### macOS

```bash
tail -n 100 "$HOME/Library/Application Support/CodexThemes/controller.error.log"
tail -n 100 "$HOME/Library/Application Support/CodexThemes/controller.log"
tail -n 100 "$HOME/Library/Application Support/CodexThemes/injector.log"
```

### Windows

```powershell
Get-ChildItem "$env:APPDATA\CodexThemes\controller-*.stderr.log"
Get-Content "$env:APPDATA\CodexThemes\controller-*.stderr.log" -Tail 100
Get-Content "$env:APPDATA\CodexThemes\injector.log" -Tail 100
```

日志可能保留旧故障；判断当前问题时必须同时记录时间戳、当前 `doctor` 和 `status` 输出。

不要分享以下文件，它们可能包含本机控制凭证或运行状态：

```text
state.json
session.json
transition.json
operation.lock
```

## 给另一台机器 Agent 的收集清单

请让 Agent 返回以下信息，避免只回复“安装失败”：

1. 操作系统、架构和 Codex Desktop 版本。
2. 仓库 `git rev-parse HEAD`。
3. 仓库与 `~/.codex/codex-themes` 中 `src/cli.mjs` 的 SHA-256。
4. `doctor` 完整 JSON。
5. `status` 完整 JSON。
6. macOS LaunchAgent 或 Windows Scheduled Task 状态。
7. 9341 监听进程身份。
8. 与本次失败时间对应的控制器和注入日志末尾 100 行。

推荐先按以下顺序归因：

```text
源码与安装副本不同
  → 重新安装
后台服务缺失或路径失效
  → 重新安装并重新检查服务
Codex 未带调试参数
  → 完全退出旧实例后重新应用
9341 未开放或被占用
  → 确认监听进程和日志
CDP 正常但 renderer 注入失败
  → 根据 status.failed 和 injector.log 排查选择器兼容性
```

只有在源码副本、后台服务、CDP 和 renderer 四层都核实后，才能把问题归因于 Codex 版本兼容性。
