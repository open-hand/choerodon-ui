---
category: Components
subtitle: 全局化配置
cols: 1
type: Other
title: Configure
---

为组件提供统一的全局化配置。

## 使用

```jsx
import { configure } from 'choerodon-ui';

configure({ prefixCls: 'ant' });
```

## API

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| prefixCls | 设置统一样式前缀 | string | c7n |
| proPrefixCls | 设置统一样式前缀(pro组件) | string | c7n-pro |
| ripple | 是否开启波纹效果 | boolean | true |
| lookupUrl | lookup取值的地址或返回地址的钩子 | string \| ((code: string) => string) | code => \`/common/code/${code}/\` |
| lookupAxiosMethod | Lookup 和 lov 默认请求方法 | string \| string | post |
| lovDefineUrl | Lov取配置的地址或返回地址的钩子 | string \| ((code: string) => string) | code => \`/sys/lov/lov_define?code=${code}\` |
| lovQueryUrl | Lov取值的地址或返回地址的钩子 | string \| ((code: string) => string) | code => \`/common/lov/dataset/${code}\` |
| axios | 替换内置的axios实例 | AxiosInstance |  |
| dataKey | 默认DataSet的dataKey | string | rows |
| totalKey | 默认DataSet的totalKey | string | total |
| labelLayout | 默认Form的labelLayout | string | horizontal |
| queryBar | 默认Table的queryBar | string | normal |
| tableBorder | 默认Table的border | boolean | true |
| tableHighLightRow | 默认Table当前行高亮 | boolean | true |
| tableRowHeight | 默认Table行高 | auto \| number | 30 |
| tableColumnResizable | 默认Table列可调整列宽 | boolean | true |
| modalSectionBorder | 默认Modal的头和脚有边框线 | boolean | true |
| modalOkFirst | 默认Modal的ok按钮排在第一个 | boolean | true |
| buttonFuncType | 默认Button的功能类型 | string | raised |
| renderEmpty | 自定义组件空状态。 | Function(componentName: string): ReactNode | - |
| generatePageQuery | 分页参数转换 | Function(pageParams: { page: number, pageSize: number }): object | - |
