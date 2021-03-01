---
category: Pro Components
type: Data Entry
title: AutoComplete
subtitle: 自动补全
---

按钮用于开始一个即时操作。

## 何时使用
当你需要帮助用户进行输入自动补全的时候可以使用


## API


按钮的属性说明如下：

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| options | 自动完成的数据源 | [DataSourceItemType](https://git.io/vMMKF)\[] \| DataSet |  |
| optionRenderer | 渲染 Option 文本的钩子 | ({ record, text, value }) => ReactNode |  |
| matcher | 匹配器 | (value,inputText) => boolean | (value, inputText) => value.indexOf(inputText) !== -1 |
