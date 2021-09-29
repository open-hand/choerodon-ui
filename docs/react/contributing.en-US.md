---
order: 6
title: Contributing
---
# Contributing to Choerodon UI

Thank you for contributing to Choerodon UI. Take a few minutes to read this guide and will help you in this process.

## code of conduct

Choerodon UI has adopted [Contributor Covenant](https://www.contributor-covenant.org/) as its code of conduct, and we hope that project participants will abide by it. Please read [full text](https://github.com/open-hand/choerodon-ui/blob/master/CODE_OF_CONDUCT.md)[,](https://github.com/open-hand/choerodon-ui/ blob/master/CODE_OF_CONDUCT.md) so that you can understand which behaviors will be tolerated and which behaviors will not be tolerated.

## Extensive contribution

Contribute to Choerodon UI, code contribution is one aspect of it. For example, documentation improvements are as important as code changes. If you have official website documentation suggestions, you can also directly raise an issue.

## First contribution

If you still don’t know how to submit a Pull Request on GitHub, you can read the following article to learn:

[How to contribute code gracefully on GitHub](https://segmentfault.com/a/1190000000736629)

If you plan to start working on an issue, please check the comments under issue first to make sure that no one else is working on the issue. If no one is currently working on it, you can leave a message to inform others that you will deal with this issue, so as to avoid duplication of work by others.

If someone left a message saying that this issue will be dealt with, but there is no movement for a week or two, then you can also take over the issue. Of course, you still need to leave a message to inform others.

## Pull Request

We welcome Pull Requests, but before making major changes, it is best to open an issue to discuss with the maintainer.

We will pay attention to all Pull Requests, review and merge your code, and may also ask you to make some changes or tell you why we cannot accept such changes.

At the same time, it is recommended that each Pull Requests does not have too many functions and defect fixes, and has a single function. If multiple functions and defects are fixed, it is recommended to split them into two small Pull Requests.

Before you send a Pull Request, please make sure you follow the steps below:

### Fork the repository

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
 
Before submitting the code, perform the following steps:

### PR content self-inspection

#### Self-inspection before local submission

Whether the necessary submissions for local self-examination are complete:

1. Check the code format (space, semicolon...), you can automatically format the modified code before submitting
2. Complicated or special changes necessary notes
3. Component API documentation update
4. Add component standard demo if necessary
5. Add test cases if necessary
6. CHANGELOG
    1. Do you need to write an update log? For the modification in this version, there is no need to add it repeatedly.
    2. changelog specification ex:
```plain
CHANGELOG.zh.md

1. Concise, clear meaning
2. There is a space between Chinese and English, and the component name is wrapped in backquotes
3. The basic component `Table` does not need `<pro>`

-🌟 `<pro>Table`: Added onResize event.
-💄 `<pro>Table`: Performance and memory optimization.
-🐞 `configure`: Fix the tableFilterAdapter type.

CHANGELOG.en.md

1. Use backticks to wrap the content involving available properties, methods, and components
2. Pay attention to spaces and English punctuation

-🌟 `<pro>Table`: Added `onResize` callback.
-💄 `<pro>Table`: Performance and memory optimization.
-🐞 `configure`: Modify the `tableFilterAdapter` type.
```
7. commit message
    1. Check whether the local code is consistent with the latest remote code before commit, (recommended) you can use the git stash command to temporarily store the local code, pull and update the remote code, and then git stash apply to merge the code locally to resolve the conflict
    2. After ensuring that the local self-check code is ok, perform add commit, and the commit specification can be directly copied and modified by CHANGELOG.en.md information ex:
```plain
-🌟 `<pro>Table`: Added `onResize` callback.
->
-> Corresponding to modify the abbreviation + space + remove the backtick from the content
->
-> [ADD] <pro>Table: Added onResize callback.



[ADD] Add
[IMP] Optimization
[FIX] Fix

Non-single component or other modification optimization directly abbreviate and add corresponding content or merge processing (it is recommended to modify each function separately to commit):
[IMP] Added some less variable.

[ADD] <pro>Table: Added onResize callback. && [IMP] <pro>Table: Performance and memory optimization.
```
#### Submit fork warehouse self-inspection

Through the github commit diff interface, the difference comparison interface checks whether the submitted content meets expectations and is consistent with the local.

1. Quickly repeat the local self-test content and check the submitted documents
2. Through diff, it is more obvious to check whether the submitted code is correct and whether it affects the code of other files
### Submit PR

1. Commit and push to your fork:
```plain
git push -u origin HEAD
```
2. Go to [the repository](https://github.com/open-hand/choerodon-ui.git) and make a Pull Request.
#### Main warehouse PR self-inspection

1. Generate a PR merge request to check whether there is a conflict in the PR merge status, and resubmit after the conflict is resolved
2. After generating the PR merge request, notify the corresponding personnel to review, and finally merge

You can refer to past PRs and commits to deepen your impression.

## learn more

If you want to know more detailed function introduction and usage process of Choerodon UI component library, you can check the official website document.

If you encounter a problem during the experience of Choerodon UI component library and need feedback, you can log in to the HAND open platform, select [Console-Feedback], and select [Front-end component library-C7N-UI] for problem classification.

If you need to use the theme package, you can contact Hande front-end basic R&D team: [wen.dai@hand-china.com](mailto:wen.dai@hand-china.com)
