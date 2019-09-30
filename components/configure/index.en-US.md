---
category: Components
type: Other
cols: 1
title: Configure
---

## Usage

```jsx
import { configure, getConfig } from 'choerodon-ui';

configure({ prefixCls: 'ant' });

const prefixCls = getConfig('prefixCls');
```

## API

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| prefixCls | set prefix class | string | c7n |
| proPrefixCls | set prefix class for pro components | string | c7n-pro |
| ripple | Whether to open the ripple effect | boolean | true |
| lookupUrl | Lookup value url or hook which return url | string \| ((code: string) => string) | code => \`/common/code/\${code}/\` |
| lookupAxiosMethod | Lookup and lov fetch method | string \| string | post |
| lovDefineUrl | Lov configure url or hook which return url | string \| ((code: string) => string) | code => \`/sys/lov/lov_define?code=\${code}\` |
| lovDefineAxiosConfig | hook for Lov configure axios config | (code: string) => AxiosRequestConfig | - |
| lovQueryUrl | Lov query url or hook which return url | string \| ((code: string) => string) | code => \`/common/lov/dataset/\${code}\` |
| lovQueryAxiosConfig | hook for Lov query axios config | (code: string, lovConfig?: LovConfig, { dataSet, params, data }) => AxiosRequestConfig | - |
| axios | Replace the built-in axios instance | AxiosInstance |  |
| dataKey | default DataSet's dataKey | string | rows |
| totalKey | default DataSet's totalKey | string | total |
| statusKey | The status key in the data submitted by the DataSet by default. | string | \_\_status |
| tlsKey | Multi-language key in the DataSet data by default. | string | \_\_tls |
| status | Default status map of data submitted by DataSet. | { add: string, update: string, delete: string } | { add: 'add', update: 'update', delete: 'delete' } |
| labelLayout | default Form's labelLayout | string | horizontal |
| queryBar | default table's queryBar | string | normal |
| tableBorder | default table's border | boolean | true |
| tableHighLightRow | Default Table current line highlight | boolean | true |
| tableRowHeight | Default Table row height | auto \| number | 30 |
| tableColumnResizable | Default Table column resizable | boolean | true |
| modalSectionBorder | Default if Modal header and foot have a border line | boolean | true |
| modalOkFirst | Default the ok button of Modal is ranked first | boolean | true |
| buttonFuncType | Default Button function type | string | raised |
| renderEmpty | set empty content of components. | (componentName: string) => ReactNode | - |
| generatePageQuery | Hook for Paging Parameter Conversion | ({ page?: number, pageSize?: number, sortName?: string, sortOrder?: string }) => object | - |
| feedback | The feedback of DataSet for query and submit, More info: [Feedback](#Feedback) | Feedback |  |

### Feedback

| 属性 | 说明 | 类型 |
| --- | --- | --- |
| loadSuccess(resp) | The success feedback of DataSet for query, `resp` - response value | Function |
| loadFailed(error) | The failed feedback of DataSet for query, `error` - error object | Function |
| submitSuccess(resp) | The success feedback of DataSet for submit, `resp` - response value | Function |
| submitFailed(error) | The failed feedback of DataSet for submit, `error` - error object | Function |
