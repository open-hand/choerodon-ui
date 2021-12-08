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
| lovTableProps | 全局配置lov的tableProps,当同时存在lovTableProps以及的时候会进行一层合并 | [TableProps](/components-pro/table/) \| (multiple?: boolean) => [TableProps](/components-pro/table/) | {} |
| lovModalProps | Lov 弹窗属性，详见[ModalProps](/components/modal/#Modal) | ModalProps |  |
| lovAutoSelectSingle | Lov 点击查询仅存在一条数据时自动选中且不弹窗 | boolean | false |
| lovQueryBar | 默认 Lov Table 的 queryBar | string | normal |
| lovQueryBarProps | 默认 Lov Table queryBar 的 queryBarProps | object | |
| lovQueryCachedSelected | lov 查询缓存已勾选记录 | (code: string, cachedSelected: Map<string, Record>) => Promise<object[]> | |
| lookupBatchAxiosConfig | hook for batch lookup query, more info:[AxiosRequestConfig](#AxiosRequestConfig)。 | (codes: string[]) => AxiosRequestConfig | - |
| selectReverse | Whether to enable the pull-down multi-select reverse function. | boolean | true |
| selectSearchable | 是否开启下拉搜索功能。 | boolean | false |
| selectPagingOptionContent | 渲染分页 option | ReactNode | ··· |
| selectTrigger | 下拉弹出触发方式 | Action[] | \['focus', 'click'] |
| axios | Replace the built-in axios instance | AxiosInstance | |   |
| dataKey | default dataKey of DataSet | string | rows |
| totalKey | default totalKey of DataSet | string | total |
| statusKey | The status key in the data submitted by the DataSet by default. | string | \_\_status |
| tlsKey | Multi-language key in the DataSet data by default. | string | \_\_tls |
| status | Default status map of data submitted by DataSet. | { add: string, update: string, delete: string } | { add: 'add', update: 'update', delete: 'delete' } |
| labelLayout | default labelLayout of Form | string | horizontal |
| queryBar | default queryBar of table | string | normal |
| queryBarProps | 默认 Table queryBar 的 queryBarProps | object | |
| tableVirtual | default virtual of Table | boolean | |
| tableVirtualCell | default virtualCell of Table | boolean | |
| tableBorder | default border of table | boolean | true |
| tableColumnEditorBorder | default columnEditorBorder of Table | boolean | tableBorder |
| tableHighLightRow | Default Table current line highlight, 可选值: boolean \| focus \| click,  true - 始终显示高亮行, 'click' - 点击行后始终显示高亮行， 'focus' - 表格获焦时显示高亮行 | boolean | true |
| tableSelectedHighLightRow | Default Table selected line highlight | boolean | false |
| tableParityRow | Default Table parity line | boolean |  |
| tableRowHeight | Default Table row height | auto \| number | 30 |
| tableExpandIcon | Default Table custom expansion icon | ({ prefixCls, expanded, expandable, needIndentSpaced, record, onExpand }) => ReactNode |  |
| tableSpinProps | Default Table spin props | SpinProps | { size: Size.default, wrapperClassName: '' } |
| tableButtonProps | Default Table button props | ButtonProps | { color: 'primary', funcType: 'flat' } |
| tableButtonsLimit | 默认 Table 头部显示功能按钮的数量，超出限制放入更多下拉 | number | |
| tableCommandProps | Default Table command props | ButtonProps | { color: 'primary', funcType: 'flat' } |
| tableShowSelectionTips | Table默认显示选中记录提示 | boolean | false |
| tableAlwaysShowRowBox | Table是否一直显示rowbox,开启后在其他模式下也会显示rowbox | boolean | false |
| tableUseMouseBatchChoose | Table是否使用鼠标批量选择,开启后在rowbox的情况下可以进行鼠标拖动批量选择,在起始的rowbox处按下,在结束位置松开 | boolean | false || pagination | 默认 pagination 的属性 | TablePaginationConfig \| false | 详见[Pagination](/components-pro/pagination/#Pagination) |
| tableEditorNextKeyEnterDown | Table是否开启可编辑行回车编辑下一行 | boolean | true |
| tableColumnResizable | Default Table column resizable | boolean | true |
| tableColumnHideable | Default Table column hideable | boolean | true |
| performanceTableColumnHideable | 默认 performanceTable 列可调整显示 | boolean | true |
| tableColumnTitleEditable | Default Table column title editable | boolean | false |
| performanceTableColumnTitleEditable | 默认 performanceTable 列可编辑标题 | boolean | false |
| tableColumnDraggable | Default Table column draggable| boolean | false |
| performanceTableColumnDraggable | performanceTable 是否开启列拖拽 | boolean | false |
| tableRowDraggable | Default Table row draggable | boolean | false |
| tableDragColumnAlign | Default align of Table row drag handler | 'left'\|'right' | - |
| tableAutoFocus | Table 新增行自动聚焦至第一个可编辑字段 | boolean | false |
| tableColumnOnCell | Custom cell property configuration | (dataSet, record, column) => object | - |
| tableColumnAlign | 默认表格列对齐方式 | (column, field) => 'left' \| 'center' \| 'right' \| undefined | Function |
| tableColumnDefaultWidth | 默认表格列宽度, 只在出横向滚动条时起作用 | number | 100 |
| tableColumnDefaultMinWidth | 默认表格列最小宽度 | number | 50 |
| tableAggregationColumnDefaultWidth | 默认表格聚合列宽度, 只在出横向滚动条时起作用 | number | 250 |
| tableAggregationColumnDefaultMinWidth | 默认表格聚合列最小宽度 | number | 50 |
| tableKeyboard | Table 开启或关闭新增的快捷按钮事件 | boolean | false |
| tableFilterAdapter | Table 筛选条请求适配器 | ({ type, config, searchCode, queryDataSet} )=>AxiosRequestConfig | |
| tableFilterSuffix | Table 筛选条按钮预留区 | ReactNode | |
| tableFilterSearchText | Table 筛选条快速搜索参数名 | string | 'params' |
| tableAutoHeightDiff | Table 自动高度误差值配置 | number | 80 |
| customizable | 是否显示个性化设置入口按钮 | boolean \| [Customizable](#Customizable) | false |
| customizedSave | Table 个性化保存的钩子 | (code, customized, component: keyof [Customizable](#Customizable)) => void | (code, customized) => localStorage.setItem(`table.customized.${code}`, JSON.stringify(customized)) |
| customizedLoad | Table 个性化加载的钩子 | (code, component: keyof [Customizable](#Customizable)) => Promise | (code) => Promise.resolve(JSON.parse(localStorage.getItem(`table.customized.${code}`) \|\| 'null')) |
| tableShowRemovedRow |	默认 Table 是否显示临时移除的行，默认置灰显示 |	boolean |	true |
| pagination | 默认 pagination 的属性 | TablePaginationConfig \| false | 详见[Pagination](/components-pro/pagination/#Pagination) |
| defaultActiveFirstOption | 默认 Select 高亮第一个选项 | boolean | true |
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
| generatePageQuery | Hook for Paging Parameter Conversion | ({ page?: number, pageSize?: number, sortName?: string, sortOrder?: string, sort?: string[] }) => object | - |
| feedback | The feedback of DataSet for query and submit. More info: [Feedback](/components-pro/data-set/#Feedback) | Feedback |  |
| transport | Default transport of DataSet. More info: [Transport](/components-pro/data-set/#Transport) | Transport |  |
| formatter | Date formatter. `jsonDate` is the format of the data in request and response, and the date is converted to timestamp when it is empty. More info:[Formatter](#Formatter) | Formatter |  |
| useColon | Form是否使用冒号,当开启时会在所有的label后面加上冒号,并且必填的*号会被移到最前方 | boolean | false |
| collapseExpandIconPosition | 全局配置 collapse 图标位置 |  `left` \| `right` | `left` |
| collapseExpandIcon | 全局配置 collapse 自定义切换图标| (panelProps) => ReactNode \| `text`(预置icon + 展开收起文字) | 无 |
| collapseTrigger | 全局配置切换面板的触发位置 | `header` \| `icon` | `header` |
| textFieldAutoComplete | 全局配置textField的autoComplete属性 | 可选值: `on` `off` |  |
| resultStatusRenderer | custom status render，you can add status renderer or cover status renderer, support the gloabal config | object-> {string:react.ReactNode} | - |
| numberFieldNonStrictStep | 全局配置 NumberField 的 nonStrictStep 属性 | boolean | false |
| numberFieldFormatter | NumberField格式器   | FormatNumberFunc: (value: string, lang: string, options: Intl.NumberFormatOptions) => string |        |
| numberFieldFormatterOptions | NumberField格式器参数,可以与组件值进行合并   | FormatNumberFuncOptions: { lang?: string, options?: Intl.NumberFormatOptions } |        |
| showLengthInfo | 全局配置是否展示长度信息 | boolean |  |
| showInvalidDate | 显示无效日期 | boolean |  |
| showRequiredColorsOnlyEmpty | 只有在空值时显示必填背景色和边框色 | boolean |  |
| showValidation | 校验信息提示方式 | `tooltip` \| `newLine` | `tooltip` |
| showHelp| 显示提示信息的方式 | `tooltip` \| `newLine`\| `label`\| `none`| `newline` |
| highlightRenderer | 高亮渲染器 | ({ title, content, dataSet, record, name, className, style }, element) => ReactNode |  |
| performanceEnabled | 开启性能监控 | { Table: boolean } | { Table: false }  |
| onPerformance | 性能监控埋点函数 | (type, event) => void |   |
| tooltip | 是否开启提示, 参数 target 详见 [TooltipTarget](#TooltipTarget) | Tooltip.always \| Tooltip.overflow \| Tooltip.none \| function(target) | |
| tooltipTheme | Tooltip 主题 或 返回主题的钩子, 参数 target 详见 [TooltipTarget](#TooltipTarget) | dark \| light \| function(target) |  (target) => target === 'validation' ? 'light' : 'dark' |
| tooltipPlacement | Tooltip 位置 或 返回位置的钩子, 参数 placement 详见 [TooltipPlacement](#TooltipPlacement) | [placement](/components-pro/tooltip/#API) \| function(target) |  [TooltipPlacement](#TooltipPlacement) |
| attachment | 附件上传配置 | [AttachmentConfig](#AttachmentConfig) |   |
| tabsInkBarStyle | Tabs 墨条样式 | CSSProperties |  |
| numberFieldKeyboard | control `UP` `DOWN` keyboard events for `NumberField` component | boolean | true |
| lovShowSelectedInView | Lov 多选时，viewMode 为 modal 或 drawer，在对话框中显示已选记录  | boolean \| (viewMode) => boolean | (viewMode) => viewMode === 'drawer' |
| secretFieldEnable | 获取是否开启数据操作保护 | () => boolean |  |
| secretFieldTypes | 获取验证方式以及验证号码 | () => object[] |  |
| secretFieldFetchVerifyCode | 校验验证码 | (type: string) => Promise<object> |  |
| secretFieldQueryData | 获取真实数据 | ({type: string, _token: string, fieldName: string, captchaKey: string, captcha: string, action: string }) => Promise |  |
| secretFieldSaveData | 保存编辑后的数据 | ({ _token: string, fieldName: string, value: string }) => Promise |  |

### Customizable

| 属性     | 默认值              | 类型   |
| -------- | ------------------- | ------ |
| Table | false | boolean |
| PerformanceTable | false | boolean |
| Tabs | false | boolean |

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
| timeZone |                     | string \| (moment) => string |

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

### TooltipTarget

| 属性              | 说明                | 
| ----------------- | ------------------- |
| table-cell         | table cell               |
| button               | button                |
| label               | label                |
| select-option               | select option                |
| output               | Output                |
| validation               | validation message                |
| help               | help message                |
| text-field-disabled  | 输入类组件禁用状态       |
| undefined               | default                |

### TooltipPlacement

| 属性              | 说明                | 默认 |
| ----------------- | ------------------- |--- |
| table-cell         | 表格单元格               | 'right' |
| button               | 按钮                | |
| label               | 表单控件标签                | |
| select-option               | 表单控件标签                ||
| output               | Output                | 'right' |
| validation               | 校验信息                | 'bottomLeft' |
| help               | 帮助信息                | |
| text-field-disabled               | 输入类组件禁用状态           | 'right' |

### AttachmentConfig

| 属性              | 说明                | 类型                                |
| ----------------- | ------------------- | ----------------------------------- |
| defaultFileKey               | 上传文件的参数名                | string                              |
| defaultFileSize               | 上传文件的大小限制, 单位 `B`                | number                              |
| action               | 上传的 axios 请求配置或返回 axios 请求配置的钩子                | AxiosConfig \| ({ attachment: [AttachmentFile](/component-pro/data-set/#AttachmentFile), bucketName?: string, bucketDirectory?: string, storageCode?:string, attachmentUUID: string, isPublic?: boolean }) => AxiosRequestConfig                             |
| batchFetchCount               | 批量获取附件数量                | (attachmentUUIDs: string[], { isPublic?: boolean }) => Promise<{\[key as string\]: number}>                             |
| fetchList               | 查询附件列表                | ({ bucketName?: string, bucketDirectory?: string, storageCode?:string, attachmentUUID: string, isPublic?: boolean }) => Promise<FileLike[]>                             |
| getPreviewUrl               | 获取预览地址，默认使用 AttachmentFile.url                | ({ attachment: AttachmentFile, bucketName?: string, bucketDirectory?: string, storageCode?:string, attachmentUUID: string, isPublic?: boolean }) => string                             |
| getDownloadUrl               | 获取下载地址，默认使用 AttachmentFile.url                | ({ attachment: AttachmentFile, bucketName?: string, bucketDirectory?: string, storageCode?:string, attachmentUUID: string, isPublic?: boolean }) => string                             |
| getDownloadAllUrl               | 获取全部下载地址                | ({ bucketName?: string, bucketDirectory?: string, storageCode?:string, attachmentUUID: string, isPublic?: boolean }) => string                            |
| getAttachmentUUID               | 获取附件的UUID                | ({ isPublic?: boolean }) => Promise<string> \| string                            |
| renderIcon               | 附件列表项的前缀图标渲染函数                | (attachment: AttachmentFile, listType: 'text'\| 'picture' \| 'picture-card', defaultIcon: ReactNode) => ReactNode                            |
| renderHistory               | 渲染操作历史                | ({ attachment: AttachmentFile, bucketName?: string, bucketDirectory?: string, storageCode?:string, attachmentUUID: string }) => ReactNode                            |
| onUploadSuccess | 上传成功的回调 | (attachment: AttachmentFile, response: any) => void |
| onUploadError | 上传出错的回调 | (error: Error, attachment: AttachmentFile) => void |
| onOrderChange | 排序变化回调，用于发送排序请求 | (attachments: AttachmentFile[], { isPublic?: boolean }) => void |
| onRemove | 删除文件回调，用于发送删除请求, 返回 false 或抛出异常将中止删除 | ({ attachment: AttachmentFile, bucketName?: string, bucketDirectory?: string, storageCode?:string, attachmentUUID: string, isPublic?: boolean }) => void |

### SecretFieldConfig

| 属性              | 说明                | 类型                                |
| ----------------- | ------------------- | ----------------------------------- |
| secretFieldEnable | 获取是否开启数据操作保护 | () => boolean |  |
| secretFieldTypes | 获取验证方式以及验证号码 | () => object[] |  |
| secretFieldFetchVerifyCode | 校验验证码 | (type: string) => Promise<object> |  |
| secretFieldQueryData | 获取真实数据 | ({type: string, _token: string, fieldName: string, captchaKey: string, captcha: string, action: string }) => Promise |  |
| secretFieldSaveData | 保存编辑后的数据 | ({ _token: string, fieldName: string, value: string }) => Promise |  |

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
