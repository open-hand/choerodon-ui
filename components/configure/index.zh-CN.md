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
| proPrefixCls | 设置统一样式前缀(pro 组件) | string | c7n-pro |
| ripple | 是否开启波纹效果 | boolean | true |
| lookupUrl | lookup 取值的地址或返回地址的钩子 | string \| ((code: string) => string) | code => \`/common/code/\${code}/\` |
| lookupAxiosMethod | Lookup 和 lov 默认请求方法 | string \| string | post |
| lovDefineUrl | Lov 取配置的地址或返回地址的钩子 | string \| ((code: string) => string) | code => \`/sys/lov/lov_define?code=\${code}\` |
| lovDefineAxiosConfig | 返回 Lov 配置的钩子 | (code: string) => AxiosRequestConfig | - |
| lovQueryUrl | Lov 取值的地址或返回地址的钩子 | string \| ((code: string) => string) | code => \`/common/lov/dataset/\${code}\` |
| lovQueryAxiosConfig | Lov 取值 Axios 逻辑的钩子 | (code: string, lovConfig?: LovConfig) => AxiosRequestConfig | - |
| axios | 替换内置的 axios 实例 | AxiosInstance |  |
| dataKey | 默认 DataSet 的 dataKey | string | rows |
| totalKey | 默认 DataSet 的 totalKey | string | total |
| statusKey | 默认 DataSet 提交的数据中标识状态的 key | string | \_\_status |
| tlsKey | 默认 DataSet 数据中标识多语言的 key | string | \_\_tls |
| status | 默认 DataSet 提交的数据的状态映射 | { add: string, update: string, delete: string } | { add: 'add', update: 'update', delete: 'delete' } |
| labelLayout | 默认 Form 的 labelLayout | string | horizontal |
| queryBar | 默认 Table 的 queryBar | string | normal |
| tableBorder | 默认 Table 的 border | boolean | true |
| tableHighLightRow | 默认 Table 当前行高亮 | boolean | true |
| tableRowHeight | 默认 Table 行高 | auto \| number | 30 |
| tableColumnResizable | 默认 Table 列可调整列宽 | boolean | true |
| modalSectionBorder | 默认 Modal 的头和脚有边框线 | boolean | true |
| modalOkFirst | 默认 Modal 的 ok 按钮排在第一个 | boolean | true |
| buttonFuncType | 默认 Button 的功能类型 | string | raised |
| renderEmpty | 自定义组件空状态。 | (componentName: string) => ReactNode | - |
| generatePageQuery | 分页参数转换的钩子 | ({ page?: number, pageSize?: number, sortName?: string, sortOrder?: string }) => object | - |
| feedback | DataSet 查询和提交数据的反馈配置, 详见[Feedback](#Feedback) | Feedback |  |

### Feedback

| 属性                | 说明                                       | 类型     |
| ------------------- | ------------------------------------------ | -------- |
| loadSuccess(resp)   | DataSet 查询成功的反馈, `resp` - 响应值    | Function |
| loadFailed(error)   | DataSet 查询失败的反馈, `error` - 异常对象 | Function |
| submitSuccess(resp) | DataSet 提交成功的反馈, `resp` - 响应值    | Function |
| submitFailed(error) | DataSet 提交失败的反馈, `error` - 异常对象 | Function |
