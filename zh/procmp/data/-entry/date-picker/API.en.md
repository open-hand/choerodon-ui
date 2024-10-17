---
title: API
---

### DatePicker

| 属性名        | 说明                                                                             | 类型                                                        | 默认值 | 版本 |
| ------------ | -------------------------------------------------------------------------------- | ----------------------------------------------------------- | ------ | --- |
| mode | 显示模式,可选值: date \| dateTime \| time \| year \| month \| week | string | date  |  |
| min          | 最小日期                                                                         | MomentInput                                                 |        |  |
| max          | 最大日期                                                                         | MomentInput                                                 |        |  |
| format       | 日期格式，如 YYYY-MM-DD HH:mm:ss`                                               | string                                                      |        |  |
| timeZone | 时区显示 | string \| (moment) => string |   | 1.4.2 |
| step         | 时间步距                                                                         | { hour: number, minute: number, second: number }            |        |  |
| filter | 日期过滤, 选择面板的 mode 会变化, 需要根据 mode 变化设置是否过滤。当在 range 模式中时（1.6.3 支持），rangeTarget 为 0 代表在 start，1 代表在 end，rangeValue 为值数组 | (currentDate, selected, mode, rangeTarget, rangeValue) => boolean | |
| cellRenderer | 单元格渲染, view 可选值：date \| dateTime \| time \| week \| month \| year \| decade | (view) => (props, text, currentDate, selected) => ReactNode |        |  |
| renderExtraFooter	| 在面板中添加额外的页脚 |	() => React.ReactNode	||  |
| extraFooterPlacement	| 额外的页脚的位置 可选值: top bottom |	string |	bottom| |
| editorInPopup | 编辑器在下拉框中  | boolean |  | 1.4.5 |
| defaultTime | 设置用户选择日期时默认的时分秒，仅应用于 dateTime mode，DateTimePicker 组件  | moment \| \[moment, moment\] | 1.4.5 |
| useInvalidDate | 允许使用非法日期, 但校验依旧无法通过  | boolean | true | 1.5.4 |
| comboRangeMode | 设置在 `range` 模式时，选择弹窗是否组合显示（`time` 和 `dateTime` 模式不支持） | boolean |  | 1.6.5 |
| inputReadOnly | 设置输入框为只读（避免在移动设备上打开虚拟键盘） | boolean | false | 1.6.6 |

更多属性请参考 [TriggerField](/zh/procmp/abstract/trigger-field/#TriggerField)。
