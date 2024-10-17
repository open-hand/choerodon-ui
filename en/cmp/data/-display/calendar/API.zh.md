---
title: API
---

**注意：**Calendar 部分 locale 是从 value 中读取，所以请先正确设置 moment 的 locale。

```jsx
// 默认语言为 en-US，所以如果需要使用其他语言，推荐在入口文件全局设置 locale
// import moment from 'moment';
// import 'moment/locale/zh-cn';
// moment.locale('zh-cn');

<Calendar
  dateCellRender={dateCellRender}
  monthCellRender={monthCellRender}
  onPanelChange={onPanelChange}
  onSelect={onSelect}
/>
```

| 属性名 | 说明 | 类型 | 默认值 | 版本 |
| --- | --- | --- | --- | --- |
| dateCellRender | 自定义渲染日期单元格，返回内容会被追加到单元格 | function(date: moment): ReactNode | 无 | |
| dateFullCellRender | 自定义渲染日期单元格，返回内容覆盖单元格 | function(date: moment): ReactNode | 无 | |
| defaultValue | 默认展示的日期 | [moment](http://momentjs.com/) | 默认日期 | |
| disabledDate | 不可选择的日期 | (currentDate: moment) => boolean | 无 | |
| fullscreen | 是否全屏显示 | boolean | true | |
| locale | 国际化配置 | object | [默认配置](https://github.com/open-hand/choerodon-ui/blob/master/components/date-picker/locale/example.json) | |
| mode | 初始模式，`month/year` | string | month | |
| monthCellRender | 自定义渲染月单元格，返回内容会被追加到单元格 | function(date: moment): ReactNode | 无 | |
| monthFullCellRender | 自定义渲染月单元格，返回内容覆盖单元格 | function(date: moment): ReactNode | 无 | |
| validRange | 设置可以显示的日期 | \[[moment](http://momentjs.com/), [moment](http://momentjs.com/)] | 无 | |
| value | 展示日期 | [moment](http://momentjs.com/) | 当前日期 | |
| headerRender | 自定义头部内容 | function(object:{value: moment, type: string, onChange: f(), onTypeChange: f()}) | 无 | 1.6.0 |
| onPanelChange | 日期面板变化回调 | function(date: moment, mode: string) | 无 | |
| onSelect | 点击选择日期回调 | function(date: moment） | 无 | |
