# Installer runtime

这里是公开版的 Codex Desktop 主题控制器。它只加载 `themes/xp-qq`，原生界面通过清除注入恢复，不对应额外主题目录。

常用命令：

```bash
node src/cli.mjs list
node src/cli.mjs apply --theme xp-qq
node src/cli.mjs status
node src/cli.mjs restore
node --test
```

面向普通用户的安装步骤请查看仓库根目录的 [README](../README.md)。
