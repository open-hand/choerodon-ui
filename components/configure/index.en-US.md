---
category: Components
type: Other
cols: 1
title: Configure
---

## Usage

```jsx
import { configure, getConfig } from 'choerodon-ui';

configure({ prefixCls: 'c7n' });

const prefixCls = getConfig('prefixCls');
```

## API

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| prefixCls | set prefix class | string | c7n |
| proPrefixCls | set prefix class for pro components | string | c7n-pro |
| iconfontPrefix | iconfont css prefix | string | icon |
| icons | List of iconfont, used for IconPicker. | string[] \| { \[categoryName: string\]: string[] } | import { categories } from 'choerodon-ui-font' |
| ripple | Whether to open the ripple effect | boolean | true |
| lookupCache | lookup cache config. `maxAge` - cache max age `max` - cache max length | object | { maxAge: 1000 _ 60 _ 10, max: 100 } |
| lookupUrl | Lookup value url or hook which return url | string \| ((code: string) => string) | code => \`/common/code/\${code}/\` |
| lookupAxiosConfig | Lookup fetch axios config, more info: [AxiosRequestConfig](#AxiosRequestConfig). By default, url is lookupUrl and method is post. | AxiosRequestConfig \| ({ dataSet: DataSet, record: Record, params?: any, lookupCode: string }) => AxiosRequestConfig | post |
| lovDefineUrl | Lov configure url or hook which return url | string \| ((code: string) => string) | code => \`/sys/lov/lov_define?code=\${code}\` |
| lovDefineAxiosConfig | hook for Lov configure axios config, more info: [AxiosRequestConfig](#AxiosRequestConfig). By default, url is lovDefineUrl and method is post. | AxiosRequestConfig \| (code: string) => AxiosRequestConfig | - |
| lovQueryUrl | Lov query url or hook which return url | string \| ((code: string, lovConfig?: LovConfig, { dataSet, params, data }) => string) | code => \`/common/lov/dataset/\${code}\` |
| lovQueryAxiosConfig | hook for Lov query axios config, more info: [AxiosRequestConfig](#AxiosRequestConfig). By default, url is lovQueryUrl and method is post. | AxiosRequestConfig \| (code: string, lovConfig?: LovConfig, { dataSet, params, data }) => AxiosRequestConfig | - |
| lovTriggerMode | Lov Trigger Mode. | string | icon |
| lookupBatchAxiosConfig | hook for batch lookup query, more info:[AxiosRequestConfig](#AxiosRequestConfig)。 | (codes: string[]) => AxiosRequestConfig | - |
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
| tableSelectedHighLightRow | Default Table selected line highlight | boolean | false |
| tableRowHeight | Default Table row height | auto \| number | 30 |
| tableColumnResizable | Default Table column resizable | boolean | true |
| tableExpandIcon | Default Table custom expansion icon | ({ prefixCls, expanded, expandable, needIndentSpaced, record, onExpand }) => ReactNode |  |
| tableSpinProps | Default Table spin props | SpinProps | { size: Size.default, wrapperClassName: '' } |
| tableButtonProps | Default Table button props | ButtonProps | { color: 'primary', funcType: 'flat' } |
| tableCommandProps | Default Table command props | ButtonProps | { color: 'primary', funcType: 'flat' } |
| tableDefaultRenderer | Default Table empty renderer | ReactNode | '' |
| tableAlwaysShowRowBox | Table是否一直显示rowbox,开启后在其他模式下也会显示rowbox | boolean | false |
| tableUseMouseBatchChoose | Table是否使用鼠标批量选择,开启后在rowbox的情况下可以进行鼠标拖动批量选择,在起始的rowbox处按下,在结束位置松开 | boolean | false || pagination | 默认 pagination 的属性 | TablePaginationConfig \| false | 详见[Pagination](/components-pro/pagination/#Pagination) |
| dropdownMatchSelectWidth | 默认下拉框匹配输入框宽度 | boolean | true |
| modalSectionBorder | Default if Modal header and foot have a border line | boolean | true |
| modalOkFirst | Default the ok button of Modal is ranked first | boolean | true |
| buttonFuncType | Default Button function type | string | raised |
| buttonColor | Default Button color | string | default |
| renderEmpty | set empty content of components. | (componentName: string) => ReactNode | - |
| defaultValidationMessages | Default validation messages. More info: [ValidationMessages](#ValidationMessages) | ValitionMessages | - |
| generatePageQuery | Hook for Paging Parameter Conversion | ({ page?: number, pageSize?: number, sortName?: string, sortOrder?: string }) => object | - |
| feedback | The feedback of DataSet for query and submit. More info: [Feedback](/components-pro/data-set/#Feedback) | Feedback |  |
| transport | Default transport of DataSet. More info: [Transport](/components-pro/data-set/#Transport) | Transport |  |
| formatter | Date formatter. `jsonDate` is the format of the data in request and response, and the date is converted to timestamp when it is empty. More info:[Formatter](#Formatter) | Formatter |  |
| useColon | Form是否使用冒号,当开启时会在所有的label后面加上冒号,并且必填的*号会被移到最前方 | boolean | false |
| excludeUseColonTagList | Form中不使用冒号的标签的列表,当为自定义组件的时候,需要设置displayName作为标签名 | string[] | ['div','button','Button'] |
| lovTableProps | 全局配置lov的tableProps,当同时存在lovTableProps以及的时候会进行一层合并 | [TableProps](/components-pro/table/) | {} |
| textFieldAutoComplete | 全局配置textField的autoComplete属性 | 可选值: `on` `off` |  |

### Formatter

| 属性     | 默认值              | 类型   |
| -------- | ------------------- | ------ |
| jsonDate | YYYY-MM-DD HH:mm:ss | string |
| date     | YYYY-MM-DD          | string |
| dateTime | YYYY-MM-DD HH:mm:ss | string |
| time     | HH:mm:ss            | string |
| week     | YYYY-Wo             | string |
| month    | YYYY-MM             | string |
| year     | YYYY                | string |

### ValidationMessages

| Property | Default | Type |
| --- | --- | --- |
| badInput | Please input a number. | ReactNode |
| patternMismatch | Please input a valid value. | ReactNode |
| rangeOverflow | {label} must be less than or equal to {max}. | ReactNode |
| rangeUnderflow | {label} must be greater than or equal to {min}. | ReactNode |
| stepMismatch | Please input a valid value. The closest valid value is {0}. | ReactNode |
| stepMismatchBetween | Please input a valid value. The two closest valid values are {0} and {1}. | ReactNode |
| tooLong | Please decrease the length of the value down to {maxLength} or less characters (You have input {length} characters). | ReactNode |
| tooShort | Please increase the length of the value down to {minLength} or more characters (You have input {length} characters). | ReactNode |
| typeMismatch | Please input a value to match the given type. | ReactNode |
| valueMissing | Please input {label}. | ReactNode |
| valueMissingNoLabel | Please input a value. | ReactNode |
| uniqueError | The value is duplicate, please input another one. | ReactNode |
| unknown | Unknown error. | ReactNode |

### AxiosRequestConfig

| Property          | Description                 | Type                                |
| ----------------- | --------------------------- | ----------------------------------- |
| url               | request url address         | string                              |
| method            | request method              | string                              |
| baseURL           | base url                    | string                              |
| headers           | request headers             | object                              |
| params            | url parameters              | object                              |
| data              | data of request body        | object                              |
| timeout           | timeout of request          | number                              |
| withCredentials   | cors cookie                 | boolean                             |
| transformRequest  | transform for request data  | (data: any, headers: any) => string |
| transformResponse | transform for response data | (data: any, headers: any) => any    |

For more configuration, please refer to the official Axios documentation, or typescript: `/node_modules/axios/index.d.ts`
