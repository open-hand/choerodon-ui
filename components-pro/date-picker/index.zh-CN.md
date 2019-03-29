---
category: Pro Components
subtitle: 日期选择框
type: Data Entry
title: DatePicker
---

选择日期的控件。

## 何时使用

当用户需要输入一个日期，可以点击标准输入框，弹出日期面板进行选择。

## API

### DatePicker

| 参数      | 说明                                     | 类型        |默认值 |
|-----------|------------------------------------------|------------|--------|
| min | 最小日期 | MomentInput |   |
| max | 最大日期 | MomentInput |   |
| format | 日期格式，如 `YYYY-MM-DD HH:mm:ss` | string |   |
| filter | 日期过滤 | (currentDate, selected) => boolean |   |
| cellRenderer | 单元格渲染, view可选值：`date` `dateTime` `time` `week` `month` `year` `decade` | (view) => (props, text, currentDate, selected) => ReactNode |   |

更多属性请参考 [TriggerField](/components-pro/trigger-field/#TriggerField)。

<style>
.code-box-demo .c7n-pro-calendar-picker-wrapper {
  margin-bottom: .1rem;
}
</style>
