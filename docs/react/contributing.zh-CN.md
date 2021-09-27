---
order: 6
title: 贡献指南
---
# 贡献指南

感谢你为 Choerodon UI 贡献一份自己的力量，花几分钟来阅读一遍这篇指南，将在此过程中为你提供帮助。

## 行为准则

Choerodon UI 已采用[贡献者公约](https://www.contributor-covenant.org/)作为其行为准则，我们希望项目参与者遵守它。请阅读[全文](https://github.com/open-hand/choerodon-ui/blob/master/CODE_OF_CONDUCT.md)[，](https://github.com/open-hand/choerodon-ui/blob/master/CODE_OF_CONDUCT.md)以便你了解哪些行为会被容忍，哪些行为不会被容忍。

## 广泛的贡献

为 Choerodon UI 做出贡献，代码贡献是其中的一个方面。例如，文档改进与代码更改一样重要，如有官网文档建议同样可以直接提 issue。

## 第一次贡献

如果你还不清楚怎么在 GitHub 上提 Pull Request ，可以阅读下面这篇文章来学习：

[如何优雅地在 GitHub 上贡献代码](https://segmentfault.com/a/1190000000736629)

如果你打算开始处理一个 issue，请先检查一下 issue 下面的留言以确保没有别人正在处理这个 issue。如果当前没有人在处理的话你可以留言告知其他人你将会处理这个 issue，以免别人重复劳动。

如果之前有人留言说会处理这个 issue 但是一两个星期都没有动静，那么你也可以接手处理这个 issue，当然还是需要留言告知其他人。

## Pull Request

我们欢迎 Pull Requests，但是在进行大的更改之前，最好先打开一个问题与维护者讨论。

我们会关注所有的 Pull Requests，会 review 以及合并你的代码，也有可能要求你做一些修改或者告诉你我们为什么不能接受这样的修改。

同时，建议每个 Pull Requests 的功能和缺陷修复不会太多，并功能单一。如果多个功能和缺陷修复，建议拆分为两个小的 Pull Requests。

在你发送 Pull Request 之前，请确认你是按照下面的步骤来做的：

### Fork 仓库

1. Fork the repository.
2. Clone the fork to your local machine and add upstream remote:
```plain
git clone https://github.com/<your username>/choerodon-ui.git
cd choerodon-ui
git remote add upstream https://github.com/open-hand/choerodon-ui.git
```
3. Synchronize your local `master` branch with the upstream one:
```plain
git checkout master
git pull upstream master
```
4. Install the dependencies with npm:
```plain
npm install
```
5. Create a new topic branch:
```plain
git checkout -b my-topic-branch
```
 
在提交代码之前，进行以下步骤：

### PR 内容自查

#### 本地提交前自查

本地自查必要提交内容是否完善：

1. 检查代码格式（空格、分号...），可在提交前对修改代码部分做自动格式化
2. 复杂或特殊改动必要的注释
3. 组件 API 文档更新
4. 必要时添加组件标准 demo
5. 必要时添加测试用例
6. CHANGELOG
    1. 是否需要写更新日志，针对本版本内修改已有对应 changlog 的不需要重复添加
    2. changelog 规范 ex：
```plain
CHANGELOG.zh.md

1. 简略，意思明确
2. 中英文之间空格间隔，组件名反引号包裹
3. 基础组件 `Table` 不需要 `<pro>`

- 🌟 `<pro>Table`：新增 onResize 事件。
- 💄 `<pro>Table`：性能和内存优化。
- 🐞 `configure`： 修复 tableFilterAdapter 类型。

CHANGELOG.en.md

1. 内容中涉及可使用的属性、方法、组件时使用反引号包裹
2. 注意空格，英文标点符号

- 🌟 `<pro>Table`: Added `onResize` callback. 
- 💄 `<pro>Table`: Performance and memory optimization.
- 🐞 `configure`: Modify the `tableFilterAdapter` type.
```
7. commit message
    1. commit 前检查本地代码是否与远程最新代码一致，（建议）可利用 git stash 命令做暂存本地代码，拉取更新远程代码，再 git stash apply 本地合并代码，解决冲突
    2. 确保本地自查代码没问题后，进行 add  commit，commit 规范可直接复制 CHANGELOG.en.md 信息进行修改 ex：
```plain
- 🌟 `<pro>Table`: Added `onResize` callback. 
->
-> 对应修改缩写 + 空格 + 内容去掉反引号
->
-> [ADD] <pro>Table: Added onResize callback. 



[ADD] 新增
[IMP] 优化
[FIX] 修复

非单组件或其他修改优化直接缩写再加对应内容或合并处理（建议每个功能修改单独 commit）：
[IMP] Added some less variable.

[ADD] <pro>Table: Added onResize callback. && [IMP] <pro>Table: Performance and memory optimization.
```
#### 提交 fork 仓库自查

通过 github commit diff 界面，差异对比界面检查提交内容是否符合预期，与本地一致。

1. 快速重复本地自测内容，检查提交文件
2. 通过 diff，能比较明显再次检查提交的代码是否正确，是否影响其他文件代码

### 提交 PR

1. Commit and push to your fork:
```plain
git push -u origin HEAD
```
2. Go to [the repository](https://github.com/open-hand/choerodon-ui.git) and make a Pull Request.

#### 主仓库 PR 自查

1. 生成 PR 合并请求查看 PR 合并状态是否有冲突，有冲突解决后重新提交
2. 生成 PR 合并请求后，通知对应人员进行 review，最后进行合并

可参考以往 PR 及 commits，加深印象。

## 了解更多

若您还想了解 Choerodon UI 组件库更详细的功能介绍及使用流程，您可以查看官网文档。

若在体验 Choerodon UI 组件库 过程中遇到了问题需反馈，您可以登录汉得开放平台，选择 [控制台 - 提反馈] ，问题分类选择 [前端组件库 - C7N-UI] 。

若有需求使用主题包，可联系汉得前端基础研发团队： [wen.dai@hand-china.com](mailto:wen.dai@hand-china.com)

 

