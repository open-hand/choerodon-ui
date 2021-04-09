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

configure({ prefixCls: 'c7n' });

const prefixCls = getConfig('prefixCls');
```

## API

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| prefixCls | 设置统一样式前缀 | string | c7n |
| proPrefixCls | 设置统一样式前缀(pro 组件) | string | c7n-pro |
| iconfontPrefix | 图标样式前缀 | string | icon |
| icons | 图标列表，用于 IconPicker。 | string[] \| { \[categoryName: string\]: string[] } | import { categories } from 'choerodon-ui-font' |
| ripple | 是否开启波纹效果 | boolean | true |
| lookupCache | lookup 缓存配置。`maxAge` - 缓存时长 `max` - 缓存数量上限 | object | { maxAge: 1000 _ 60 _ 10, max: 100 } |
| lookupUrl | lookup 取值的地址或返回地址的钩子 | string \| ((code: string) => string) | code => \`/common/code/\${code}/\` |
| lookupAxiosConfig | 值列表请求的配置或钩子，详见[AxiosRequestConfig](#AxiosRequestConfig)。 配置中默认 url 为 lookupUrl， method 为 post。 | AxiosRequestConfig \| ({ dataSet: DataSet, record: Record, params?: any, lookupCode: string }) => AxiosRequestConfig | - |
| lovDefineUrl | Lov 取配置的地址或返回地址的钩子 | string \| ((code: string) => string) | code => \`/sys/lov/lov_define?code=\${code}\` |
| lovDefineAxiosConfig | 返回 Lov 配置的请求的配置或钩子，详见[AxiosRequestConfig](#AxiosRequestConfig)。 配置中默认 url 为 lovDefineUrl， method 为 post。 | AxiosRequestConfig \| (code: string, lovConfig?: LovConfig, { dataSet, params, data }) => AxiosRequestConfig | - |
| lovQueryUrl | Lov 取值的地址或返回地址的钩子 | string \| ((code: string) => string) | code => \`/common/lov/dataset/\${code}\` |
| lovQueryAxiosConfig | Lov 查询数据请求的配置或钩子，详见[AxiosRequestConfig](#AxiosRequestConfig)。 配置中默认 url 为 lovQueryUrl， method 为 post。 | AxiosRequestConfig \| (code: string, lovConfig?: LovConfig, { dataSet, params, data }) => AxiosRequestConfig | - |
| lovModalProps | Lov 弹窗属性，详见[ModalProps](/components/modal/#Modal) | ModalProps |  |
| lookupBatchAxiosConfig | 返回 lookup 批量查询配置的钩子，详见[AxiosRequestConfig](#AxiosRequestConfig)。 | (codes: string[]) => AxiosRequestConfig | - |
| selectReverse | 是否开启下拉多选反向功能。 | boolean | true |
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
| tableSelectedHighLightRow | 默认 Table 当前勾选行高亮 | boolean | false |
| tableParityRow | 默认 Table 奇偶行 | boolean |  |
| tableRowHeight | 默认 Table 行高 | auto \| number | 30 |
| tableExpandIcon | 默认 Table 自定义展开图标 | ({ prefixCls, expanded, expandable, needIndentSpaced, record, onExpand }) => ReactNode |  |
| tableSpinProps | 默认 Table spin 的属性 | SpinProps | { size: Size.default, wrapperClassName: '' } |
| tableButtonProps | 默认 TableButton 的属性 | ButtonProps | { color: 'primary', funcType: 'flat' } |
| tableCommandProps | 默认 TableCommand 的属性 | ButtonProps | { color: 'primary', funcType: 'flat' } |
| tableDefaultRenderer | 默认 Table 为空时 renderer 的内容 | ReactNode | '' |
| tableShowSelectionTips | Table默认显示选中记录提示 | boolean | false |
| tableAlwaysShowRowBox | Table是否一直显示rowbox,开启后在其他模式下也会显示rowbox | boolean | false |
| tableUseMouseBatchChoose | Table是否使用鼠标批量选择,开启后在rowbox的情况下可以进行鼠标拖动批量选择,在起始的rowbox处按下,在结束位置松开 | boolean | false |
| tableEditorNextKeyEnterDown | Table是否开启可编辑行回车编辑下一行 | boolean | true |
| tableColumnResizable | 默认 Table 列可调整列宽 | boolean | true |
| tableColumnHideable | 默认 Table 列可调整显示 | boolean | true |
| tableColumnTitleEditable | 默认 Table 列可编辑标题 | boolean | false |
| tableColumnDraggable | Table是否开启列拖拽 | boolean | false |
| tableColumnTooltip | Table 是否开启列提示 | TableColumnTooltip | |
| tableRowDraggable | Table是否开启行拖拽 | boolean | false |
| tableDragColumnAlign | Table行拖拽的模式 | 'left'\|'right' | - |
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
| modalSectionBorder | 默认 Modal 的头和脚有边框线 | boolean | true |
| drawerSectionBorder | 默认 Drawer 的头和脚有边框线 | boolean | true |
| drawerTransitionName | 抽屉模式使用的动画， 可选值： 'slide-right' 'slide-left' 'slide-up' 'slide-down' | string | 'slide-right' |
| modalOkFirst | 默认 Modal 的 ok 按钮排在第一个 | boolean | true |
| modalKeyboard | Modal 是否支持键盘 esc 关闭 | boolean | true |
| modalAutoCenter | Modal 是否默认居中 | boolean | false |
| modalMaskClosable | 点击蒙层是否允许关闭，可选 boolean \| click \| dblclick | boolean \| string | false |
| drawerOkFirst | 默认 Modal drawer 的 ok 按钮排在第一个，优先级高于 modalOkFirst | boolean \| undefined | undefined |
| buttonFuncType | 默认 Button 的功能类型 | string | raised |
| buttonColor | 默认 Button 的颜色 | string | default |
| renderEmpty | 自定义组件空状态。componentName会接收到的值为 `Table` `Select`,在实现函数的时候需要对这两个输入进行处理,**注意需要同时处理Table以及Select**,默认值参考源代码的[defaultRenderEmpty](https://github.com/open-hand/choerodon-ui/blob/master/components/configure/index.tsx) | (componentName: string) => ReactNode | - |
| defaultValidationMessages | 自定义校验信息, 详见[ValidationMessages](#ValidationMessages) | ValitionMessages | - |
| generatePageQuery | 分页参数转换的钩子 | ({ page?: number, pageSize?: number, sortName?: string, sortOrder?: string }) => object | - |
| feedback | DataSet 查询和提交数据的反馈配置, 详见[Feedback](/components-pro/data-set/#Feedback) | Feedback |  |
| transport | DataSet 默认 transport, 详见[Transport](/components-pro/data-set/#Transport) | Transport |  |
| formatter | 日期格式化。其中 jsonDate 是数据请求和响应时的格式，为空时日期会转化为 timestamp。详见[Formatter](#Formatter) | Formatter |  |
| useColon | Form中是否使用冒号,当开启时会在所有的label后面加上冒号,并且必填的*号会被移到最前方 | boolean | false |
| excludeUseColonTagList | Form中不使用冒号的标签的列表,当为自定义组件的时候,需要设置displayName作为标签名 | string[] | ['div','button','Button'] |
| lovTableProps | 全局配置lov的tableProps,当同时存在lovTableProps以及的时候会进行一层合并 | [TableProps](/components-pro/table/) | {} |
| collapseExpandIconPosition | 全局配置 collapse 图标位置 |  `left` \| `right` | `left` |
| collapseExpandIcon | 全局配置 collapse 自定义切换图标| (panelProps) => ReactNode \| `text`(预置icon + 展开收起文字) | 无 |
| collapseTrigger | 全局配置切换面板的触发位置 | `header` \| `icon` | `header` |
| textFieldAutoComplete | 全局配置textField的autoComplete属性 | 可选值: `on` `off` |  |
| resultStatusRenderer | 自定义状态展示,可以覆盖现有状态展示，也可以增加状态展示，支持全局配置 | object -> {string:react.ReactNode} | - |
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

| 属性 | 默认值 | 类型 |
| --- | --- | --- |
| badInput | 请输入一个数字。 | ReactNode |
| patternMismatch | 请输入有效的值。 | ReactNode |
| rangeOverflow | {label}必须小于或等于{max}。 | ReactNode |
| rangeUnderflow | {label}必须大于或等于{min}。 | ReactNode |
| stepMismatch | 请输入有效值。最接近的有效值为{0}。 | ReactNode |
| stepMismatchBetween | 请输入有效值。两个最接近的有效值分别为{0}和{1}。 | ReactNode |
| tooLong | 请将该内容减少到{maxLength}个或更少字符（目前您使用了{length}个字符）。 | ReactNode |
| tooShort | 请将该内容增加到{minLength}个或更多字符（目前您使用了{length}个字符）。 | ReactNode |
| typeMismatch | 请输入与类型匹配的有效值。 | ReactNode |
| valueMissing | 请输入{label}。 | ReactNode |
| valueMissingNoLabel | 请填写此字段。 | ReactNode |
| uniqueError | 该字段值重复，请重新填写。 | ReactNode |
| unknown | 未知错误。 | ReactNode |

### AxiosRequestConfig

| 属性              | 说明                | 类型                                |
| ----------------- | ------------------- | ----------------------------------- |
| url               | 地址                | string                              |
| method            | 方法                | string                              |
| baseURL           | 基础地址            | string                              |
| headers           | 请求头              | object                              |
| params            | url 参数            | object                              |
| data              | 请求体数据          | object                              |
| timeout           | 请求超时时间        | number                              |
| withCredentials   | 用于跨域传递 cookie | boolean                             |
| transformRequest  | 转变提交的数据      | (data: any, headers: any) => string |
| transformResponse | 转变响应的数据      | (data: any, headers: any) => any    |

更多配置请参考 Axios 官方文档，或参考 typescript 文件/node_modules/axios/index.d.ts
