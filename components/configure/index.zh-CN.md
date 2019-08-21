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
import { configure, getConfig } from 'choerodon-ui';

configure({ prefixCls: 'ant' });

const prefixCls = getConfig('prefixCls');
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
| lovDefineAxiosConfig | 返回Lov配置的钩子 | (code: string) => AxiosRequestConfig | - |
| lovQueryUrl | Lov取值的地址或返回地址的钩子 | string \| ((code: string) => string) | code => \`/common/lov/dataset/${code}\` |
| lovQueryAxiosConfig | Lov取值Axios逻辑的钩子 | (code: string, lovConfig?: LovConfig) => AxiosRequestConfig | - |
| axios | 替换内置的axios实例 | AxiosInstance |  |
| dataKey | 默认DataSet的dataKey | string | rows |
| totalKey | 默认DataSet的totalKey | string | total |
| statusKey | 默认DataSet提交的数据中标识状态的key | string | __status |
| tlsKey | 默认DataSet数据中标识多语言的key | string | __tls |
| status | 默认DataSet提交的数据的状态映射 | { add: string, update: string, delete: string } | { add: 'add', update: 'update', delete: 'delete' } |
| labelLayout | 默认Form的labelLayout | string | horizontal |
| queryBar | 默认Table的queryBar | string | normal |
| tableBorder | 默认Table的border | boolean | true |
| tableHighLightRow | 默认Table当前行高亮 | boolean | true |
| tableRowHeight | 默认Table行高 | auto \| number | 30 |
| tableColumnResizable | 默认Table列可调整列宽 | boolean | true |
| modalSectionBorder | 默认Modal的头和脚有边框线 | boolean | true |
| modalOkFirst | 默认Modal的ok按钮排在第一个 | boolean | true |
| buttonFuncType | 默认Button的功能类型 | string | raised |
| renderEmpty | 自定义组件空状态。 | (componentName: string) => ReactNode | - |
| generatePageQuery | 分页参数转换的钩子 | ({ page?: number, pageSize?: number, sortName?: string, sortOrder?: string }) => object | - |
