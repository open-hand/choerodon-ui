---
title: API
---

### DatePicker

| 参数         | 说明                                                                             | 类型                                                        | 默认值 |
| ------------ | -------------------------------------------------------------------------------- | ----------------------------------------------------------- | ------ |
| mode | 显示模式,可选值: date \| dateTime \| time \| year \| month \| week | string | date  |
| min          | 最小日期                                                                         | MomentInput                                                 |        |
| max          | 最大日期                                                                         | MomentInput                                                 |        |
| format       | 日期格式，如 `YYYY-MM-DD HH:mm:ss`                                               | string                                                      |        |
| timeZone | 时区显示 | string \| (moment) => string |   |
| step         | 时间步距                                                                         | { hour: number, minute: number, second: number }            |        |
| filter | 日期过滤 | (currentDate, selected, mode) => boolean |   |
| cellRenderer | 单元格渲染, view 可选值：date \| dateTime \| time \| week \| month \| year \| decade | (view) => (props, text, currentDate, selected) => ReactNode |        |
| renderExtraFooter	| 在面板中添加额外的页脚 |	() => React.ReactNode	||
| extraFooterPlacement	| 额外的页脚的位置 可选值: top bottom |	string |	bottom

更多属性请参考 [TriggerField](/zh/procmp/abstract/trigger-field/#TriggerField)。
