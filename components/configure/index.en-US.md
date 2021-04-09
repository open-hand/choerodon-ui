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
| lovModalProps | Lov 弹窗属性，详见[ModalProps](/components/modal/#Modal) | ModalProps |  |
| lookupBatchAxiosConfig | hook for batch lookup query, more info:[AxiosRequestConfig](#AxiosRequestConfig)。 | (codes: string[]) => AxiosRequestConfig | - |
| selectReverse | Whether to enable the pull-down multi-select reverse function. | boolean | true |
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
| tableParityRow | Default Table parity line | boolean |  |
| tableRowHeight | Default Table row height | auto \| number | 30 |
| tableExpandIcon | Default Table custom expansion icon | ({ prefixCls, expanded, expandable, needIndentSpaced, record, onExpand }) => ReactNode |  |
| tableSpinProps | Default Table spin props | SpinProps | { size: Size.default, wrapperClassName: '' } |
| tableButtonProps | Default Table button props | ButtonProps | { color: 'primary', funcType: 'flat' } |
| tableCommandProps | Default Table command props | ButtonProps | { color: 'primary', funcType: 'flat' } |
| tableDefaultRenderer | Default Table empty renderer | ReactNode | '' |
| tableShowSelectionTips | Table默认显示选中记录提示 | boolean | false |
| tableAlwaysShowRowBox | Table是否一直显示rowbox,开启后在其他模式下也会显示rowbox | boolean | false |
| tableUseMouseBatchChoose | Table是否使用鼠标批量选择,开启后在rowbox的情况下可以进行鼠标拖动批量选择,在起始的rowbox处按下,在结束位置松开 | boolean | false || pagination | 默认 pagination 的属性 | TablePaginationConfig \| false | 详见[Pagination](/components-pro/pagination/#Pagination) |
| tableEditorNextKeyEnterDown | Table是否开启可编辑行回车编辑下一行 | boolean | true |
| tableColumnResizable | Default Table column resizable | boolean | true |
| tableColumnHideable | Default Table column hideable | boolean | true |
| tableColumnTitleEditable | Default Table column title editable | boolean | false |
| tableColumnDraggable | Default Table column draggable| boolean | false |
| tableColumnTooltip | Table 是否开启列提示 | TableColumnTooltip | |
| tableRowDraggable | Default Table row draggable | boolean | false |
| tableDragColumnAlign | Default align of Table row drag handler | 'left'\|'right' | - |
| tableAutoFocus | Table 新增行自动聚焦至第一个可编辑字段 | boolean | false |
| tableKeyboard | Table 开启或关闭新增的快捷按钮事件 | boolean | false |
| tableFilterAdapter | Table 筛选条请求适配器 | AxiosRequestConfig | |
| tableFilterSuffix | Table 筛选条按钮预留区 | ReactNode | |
| tableFilterSearchText | Table 筛选条快速搜索参数名 | string | 'params' |
| tableAutoHeightDiff | Table 自动高度误差值配置 | number | 80 |
| tableCustomizedSave | Table 个性化保存的钩子 | (code, customized) => void | (code, customized) => localStorage.setItem(`table.customized.${code}`, JSON.stringify(customized)) |
| tableCustomizedLoad | Table 个性化加载的钩子 | (code) => Promise | (code) => Promise.resolve(JSON.parse(localStorage.getItem(`table.customized.${code}`) \|\| 'null')) |
| pagination | 默认 pagination 的属性 | TablePaginationConfig \| false | 详见[Pagination](/components-pro/pagination/#Pagination) |
| dropdownMatchSelectWidth | 默认下拉框匹配输入框宽度 | boolean | true |
| modalSectionBorder | Default if Modal header and foot have a border line | boolean | true |
| drawerSectionBorder | Default if drawer header and foot have a border line | boolean | true |
| drawerTransitionName | 抽屉模式使用的动画， 可选值： 'slide-right' 'slide-left' 'slide-up' 'slide-down' | string | 'slide-right' |
| modalOkFirst | Default the ok button of Modal is ranked first | boolean | true |
| modalKeyboard | Does Modal support keyboard esc off | boolean | true |
| modalAutoCenter | Whether Modal is centered by default | boolean | false |
| modalMaskClosable | 点击蒙层是否允许关闭，可选 boolean \| click \| dblclick | boolean \| string | false |
| drawerOkFirst | The ok button of the default Modal drawer is ranked first, and has a higher priority than modalOkFirst | boolean \| undefined | undefined |
| buttonFuncType | Default Button function type | string | raised |
| buttonColor | Default Button color | string | default |
| renderEmpty | 自定义组件空状态。componentName会接收到的值为 `Table` `Select`,在实现函数的时候需要对这两个输入进行处理,**注意需要同时处理Table以及Select**,默认值参考源代码的[defaultRenderEmpty](https://github.com/open-hand/choerodon-ui/blob/master/components/configure/index.tsx) | (componentName: string) => ReactNode | - |
| defaultValidationMessages | Default validation messages. More info: [ValidationMessages](#ValidationMessages) | ValitionMessages | - |
| generatePageQuery | Hook for Paging Parameter Conversion | ({ page?: number, pageSize?: number, sortName?: string, sortOrder?: string }) => object | - |
| feedback | The feedback of DataSet for query and submit. More info: [Feedback](/components-pro/data-set/#Feedback) | Feedback |  |
| transport | Default transport of DataSet. More info: [Transport](/components-pro/data-set/#Transport) | Transport |  |
| formatter | Date formatter. `jsonDate` is the format of the data in request and response, and the date is converted to timestamp when it is empty. More info:[Formatter](#Formatter) | Formatter |  |
| useColon | Form是否使用冒号,当开启时会在所有的label后面加上冒号,并且必填的*号会被移到最前方 | boolean | false |
| excludeUseColonTagList | Form中不使用冒号的标签的列表,当为自定义组件的时候,需要设置displayName作为标签名 | string[] | ['div','button','Button'] |
| lovTableProps | 全局配置lov的tableProps,当同时存在lovTableProps以及的时候会进行一层合并 | [TableProps](/components-pro/table/) | {} |
| collapseExpandIconPosition | 全局配置 collapse 图标位置 |  `left` \| `right` | `left` |
| collapseExpandIcon | 全局配置 collapse 自定义切换图标| (panelProps) => ReactNode \| `text`(预置icon + 展开收起文字) | 无 |
| collapseTrigger | 全局配置切换面板的触发位置 | `header` \| `icon` | `header` |
| textFieldAutoComplete | 全局配置textField的autoComplete属性 | 可选值: `on` `off` |  |
| resultStatusRenderer | custom status render，you can add status renderer or cover status renderer, support the gloabal config | object-> {string:react.ReactNode} | - |
| numberFieldNonStrictStep | 全局配置 NumberField 的 nonStrictStep 属性 | boolean | false |
| numberFieldFormatter | NumberField格式器   | FormatNumberFunc: (value: string, lang: string, options: Intl.NumberFormatOptions) => string |        |
| numberFieldFormatterOptions | NumberField格式器参数,可以与组件值进行合并   | FormatNumberFuncOptions: { lang?: string, options?: Intl.NumberFormatOptions } |        |

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
