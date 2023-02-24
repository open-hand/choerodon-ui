---
title: DataSet
abstract: true
---

数据源。

**注意事项**

> 初次使用该组件库建议阅读[引导教程](/en/tutorials/introduction)。

## API

### DataSet Props

| 参数 | 说明 | 类型 | 默认值 | 版本 |
| --- | --- | --- | --- | --- |
| [name](/en/datasetapi/dataset-props/name) | 对应后台 ds 的 name，自动生成约定的 submitUrl, queryUrl, tlsUrl, validateUrl | Array&lt;string&gt; |  |    |
| [data](/en/datasetapi/dataset-props/data) | 初始化数据 | Array&lt;object&gt; |  |  |
| autoCount | 查询时通知后端是否自动统计总数， 用于分页。当设为 false 时， 查询的参数默认会带上count=N的参数，参数名和值可以通过全局配置 generatePageQuery 设置。当查询结果中 countKey 对应的值是 Y 时，会发起计数查询的请求，请求地址同 read 的地址， 请求参数会带上 onlyCount=Y 的参数，参数名和值可以通过全局配置 generatePageQuery 设置 | boolean | [autoCount](/en/procmp/configure/configure) | 1.5.5 |
| autoQuery | 初始化后自动查询 | boolean | false |  |
| autoQueryAfterSubmit | 提交成功后响应的数据不符合回写条件时自动查询。注：回写条件是指响应数据中含有提交时的数据时，数据将按数据状态分组进行顺序回写，如果要更准确的回写，响应数据要含有提交时的\_\_id 字段值。 | boolean | true | |
| [autoCreate](/en/datasetapi/dataset-props/auto-create) | 初始化时，如果没有记录且 autoQuery 为 false，则自动创建记录 | boolean | false |  |
| autoLocateFirst | 数据加载后自动定位到第一条记录 | boolean | true |   |
| autoLocateAfterCreate | 自动定位到新建记录 | boolean | true | |
| autoLocateAfterRemove | 当前数据被删除后自动定位到其他记录 | boolean | true | |
| validateBeforeQuery | 查询时是否校验查询字段或查询数据集 | boolean | true | 1.0.0  |
| [selection](/en/datasetapi/dataset-props/selection) | 选择的模式, 可选值: false 'multiple' 'single' | boolean \| string | multiple |    |
| selectionStrategy | 树形选择记录策略， SHOW\_ALL \| SHOW\_CHILD \| SHOW\_PARENT | string | 'SHOW_ALL' | 1.4.2 |
| modifiedCheck | 翻页查询前，当有记录更改过时，是否警告提示。 | boolean | true |   |
| modifiedCheckMessage | 翻页查询前，当有记录更改过时，警告提示。 | ReactNode \| ModalProps |  |    |
| pageSize | 分页大小 | number | 10 |   |
| strictPageSize | 严格分页大小, 前端将截断超出 pageSize 的数据 | boolean | true |  1.5.1  |
| [paging](/en/procmp/data-display/table#Tree%20data%20asynchronous%20paging) | 是否分页，server 主要为 Table 的 Tree 模式服务，约定 total 为根节点数目，index 的定位都是基于根节点，为 server 时候保证同时存在 idField 和 parentField (根节点为空或者 undefined) 不然表现和原有版本一致 | boolean \| 'server'| true |   |
| dataKey | 查询返回的 json 中对应的数据的 key, 当为 null 时对应整个 json 数据, json 不是数组时自动作为新数组的第一条数据 | string \| null |  [dataKey](/en/procmp/configure/configure) | |
| totalKey | 查询返回的 json 中对应的总数的 key | string | [totalKey](/en/procmp/configure/configure) | |
| countKey | 查询返回的 json 中对应的是否需要异步计数的 key | string | [countKey](/en/procmp/configure/configure) | 1.5.5 |
| [queryDataSet](/en/datasetapi/dataset-props/query-data-set) | 查询条件数据源 | DataSet |  |  |
| queryUrl | 查询请求的 url。 当设定 name 时，默认 /dataset/{name}/queries | string |  |    |
| queryParameter | 查询请求的初始参数 | object |  | |
| submitUrl | 记录提交请求的 url。 当设定 name 时，默认 /dataset/{name}/mutations | string |  | |
| tlsUrl | 多语言查询请求的 url。 当设定 name 时， 默认 /dataset/{name}/languages | string |  | |
| validateUrl | 远程校验查询请求的 url。 当设定 name 时， 默认 /dataset/{name}/validate | string |  |   |
| exportUrl | 导出请求的 url。 当设定 name 时， 默认 /dataset/{name}/export | string |  |   |
| [transport](/en/tutorials/dataSet-more#transport) | 自定义 CRUD 请求配置, 详见[Transport](#transport) 及 [AxiosRequestConfig](/en/procmp/configure/configure/#axiosrequestconfig) | Transport |  |    |
| feedback | 查询和提交数据的反馈配置, 详见[Feedback](#feedback) | Feedback |  |    |
| [children](/en/datasetapi/dataset-props/children) | 级联行数据集, 例： { name_1: dataSet1, name_2: dataSet2 } | { name: DataSet } |  | |
| primaryKey | 主键字段名，一般用作级联行表的查询字段 | string |  | |
| [idField](/en/datasetapi/dataset-props/id-field) | 树形数据当前节点 id 字段名，与 parentField 组合使用。 适用于平铺数据；变更节点层级可直接修改 idField 和 parentField 对应的值 | string |  | |
| [parentField](/en/datasetapi/dataset-props/id-field) | 树形数据当前父节点 id 字段名，与 idField 组合使用。适用于平铺数据；变更节点层级可直接修改 idField 和 parentField 对应的值| string |  | |
| [childrenField](/en/datasetapi/dataset-props/id-field) | 树形数据子数据集字段名， 如果要异步加载子节点需设置 idField 和 parentField 或者使用 appendData 方法。适用于树形数据；变更节点层级需要操作 record.parent 和 record.children | string |  | 1.4.5 |
| [expandField](/en/datasetapi/dataset-props/id-field) | 树形数据标记节点是否展开的字段名 | string |  |  |
| [treeCheckStrictly](/en/datasetapi/dataset-props/id-field) | 树形数据节点选中状态是否独自控制（父子节点选中状态不再关联） | boolean | | 1.5.3 |
| [checkField](/en/datasetapi/dataset-props/id-field) | 树形数据标记节点是否为选中的字段名，在展开按钮后面会显示 checkbox | string |  |  |
| fields | 字段属性数组，详见[Field Props](#field-props) | object\[\] |  |  |
| record | 记录属性，详见[Record Props](#record-props) | object |  |
| [queryFields](/en/datasetapi/dataset-props/query-data-set) | 查询字段属性数组，在内部生成 queryDataSet，优先级高于 queryDataSet 属性，详见[Field Props](#field-props) | object\[\] |  |  |
| cacheSelection | 缓存选中记录，使切换分页时仍保留选中状态。当设置了 primaryKey 或有字段设置了 unique 才起作用。 | boolean | false |   |
| cacheModified | 缓存变更记录，使切换分页时仍保留变更的记录。当设置了 primaryKey 或有字段设置了 unique 才起作用。 | boolean | false | 1.5.0-beta.0 |
| axios | 覆盖默认 axios | AxiosInstance |  |   |
| [dataToJSON](/en/datasetapi/dataset-props/data-to-json) | 数据转为 json 的方式，详见[DataToJSON](#datatojson) | DataToJSON | dirty |   |
| [cascadeParams](/en/datasetapi/dataset-props/children) | 级联查询参数 | (record, primaryKey) => object | (record, primaryKey) => primaryKey ? record.get(primaryKey) : record.toData() |   |
| exportMode | 导出模式选择：前端导出，后端导出 | client \| server | server |   |
| combineSort | 是否开启组件列排序传参 | boolean | false | 1.4.2 |
| [forceValidate](/en/datasetapi/dataset-props/force-validate) | 始终校验全部数据 | boolean | false | 1.4.5 |
| [validationRules](/en/datasetapi/dataset-props/validation-rules) | dataSet校验规则，详见[ValidationRule](#validationrule) | ValidationRule\[\] |  |  1.5.1  |

### DataSet Values

| 名称 | 说明 | 类型 | 版本 |
| --- | --- | --- | --- |
| current | 获取或者设置当前记录 | observable&lt;Record&gt; |   |
| currentPage | 当前页码 | readonly observable&lt;number&gt; |  |
| currentIndex | 当前游标索引 | observable&lt;number&gt; |  |
| totalCount | 总记录数 | observable&lt;number&gt; |    |
| totalPage | 总页数 | readonly observable&lt;number&gt; |  |
| pageSize | 分页大小 | observable&lt;number&gt; |  |
| paging | 是否分页 | observable&lt;boolean&gt; |   |
| counting | 是否在异步计数查询 | observable&lt;boolean&gt; | 1.5.5 |
| [status](/en/datasetapi/dataset-values/status) | 状态，loading submitting ready | observable&lt;string&gt; |  |
| selection | 选择的模式, 可选值: false 'multiple' 'single' | observable&lt;string\|boolean&gt; |   |
| selectionStrategy | 树形选择记录策略， SHOW_ALL \| SHOW_CHILD \| SHOW_PARENT | observable&lt;string[]&gt; |   |
| [records](/en/datasetapi/dataset-values/records) | 所有记录 | observable&lt;Record[]&gt; | |
| [fields](/en/datasetapi/dataset-values/fields) | 所有字段 | ObservableMap<string, Field> | 1.5.0-beta.0 |
| all | 所有记录, 包括缓存的记录 | observable&lt;Record[]&gt; | |
| data | 数据, 不包括删除状态的 Record | observable&lt;Record[]&gt; |   |
| created | 新建的数据 | readonly observable&lt;Record[]&gt; |  |
| updated | 更新的数据 | readonly observable&lt;Record[]&gt; |  |
| destroyed | 暂时销毁的数据 | readonly observable&lt;Record[]&gt; |    |
| selected | 选中记录，包括 isAllPageSelection 为 false 时缓存的选中记录 | readonly observable&lt;Record[]&gt; |    |
| unSelected | 未选中记录，包括 isAllPageSelection 为 true 时缓存的未选中记录 | readonly observable&lt;Record[]&gt; |   |
| currentSelected | 当前页选中记录 | readonly observable&lt;Record[]&gt; | 1.4.0 |
| currentUnSelected | 当前页未选中记录 | readonly observable&lt;Record[]&gt; | 1.4.0 |
| cachedSelected | isAllPageSelection 为 false 时缓存的选中记录 或 isAllPageSelection 为 true 时缓存的未选中记录 | readonly observable&lt;Record[]&gt; |    |
| cachedModified | 缓存的变更记录 | observable&lt;Record[]&gt; | 1.5.0-beta.0 |
| cachedRecords | 缓存的记录, 包括 cachedSelected 和 cachedModified | observable&lt;Record[]&gt; | 1.5.0-beta.0 |
| treeSelected | 树形选中记录， 受 selectionStrategy 影响 | readonly observable&lt;Record[]&gt; | 1.4.2  |
| length | 数据量 | readonly observable&lt;number&gt; | |
| queryDataSet | 查询数据源 | observable&lt;DataSet&gt; |   |
| parent | 级联头数据源 | readonly observable&lt;DataSet&gt; |  |
| children | 所有级联行数据源 | readonly \[key:string\]: DataSet} | |
| dirty | 含有状态不是 sync 的记录及 dirty 为 true 的记录 | readonly observable&lt;boolean&gt;} |   |
| isAllPageSelection | 是否是跨页全选状态， 请配合 unSelected 一起做跨页选择数据提交， 需要接口支持 | readonly observable&lt;boolean&gt;} | 1.4.0 |

### DataSet Methods

| 名称 | 说明 | 参数 | 返回值类型 | 版本 |
| --- | --- | --- | --- | --- |
| ready() | 判断数据源是否准备就绪 |  | Promise |   |
| query(page, params, cache) | 查询 | `page`&lt;optional,default:1&gt; - 指定页码 `params`&lt;optional&gt; - 临时查询参数  `cache`&lt;optional&gt;(1.5.0-beta.0) - 是否保留缓存的变更记录  | Promise&lt;any&gt; | |
| queryMore(page, params) | 查询更多， 保留原数据 | page&lt;optional,default:1&gt; - 指定页码 params&lt;optional&gt; - 临时查询参数  | Promise&lt;any&gt; | 1.1.0 |
| [submit()](/en/datasetapi/dataset-methods/submit) | 将数据集中的增删改的记录先进行校验再进行远程提交。submit 会抛出请求的异常，请用 promise.catch 或 try-await-catch 来处理异常。 |  | Promise&lt;any&gt; false - 校验失败，undefined - 无数据提交或提交相关配置不全，如没有 submitUrl。 | |
| forceSubmit() | 强制提交，绕过校验。 | | Promise&lt;any&gt; undefined - 无数据提交或提交相关配置不全，如没有 submitUrl。 | 1.5.2 |
| [reset()](/en/datasetapi/dataset-methods/reset) | 重置更改, 并清除校验状态 |  |  |    |
| locate(index) | 定位到指定记录, 如果paging 为 true和server，则做远程查询 为server指代的是根节点节点的index坐标| index - 记录索引 | Promise&lt;Record&gt; |  |
| page(page) | 定位到指定页码，如果paging 为 true和server，则做远程查询 | page - 页码 | Promise&lt;any&gt; |    |
| first() | 定位到第一条记录，如果paging 为 true和server，则做远程查询 为server指代的第一个根节点 |  | Promise&lt;Record&gt; |  |
| last() | 定位到最后一条记录，如果paging 为 true和server，则做远程查询 为server指代的是最后的根节点  | | Promise&lt;Record&gt; |   |
| pre() | 定位到上一条记录，如果paging 为 true和server，则做远程查询 为server指代的当前根节点的上一个根节点 |  | Promise&lt;Record&gt; |    |
| next() | 定位到下一条记录，如果paging 为 true和server，则做远程查询 为server指代的当前根节点的下一个根节点 |  | Promise&lt;Record&gt; |   |
| firstPage() | 定位到第一页，如果paging 为 true和server，则做远程查询 |  | Promise&lt;any&gt; |  |
| lastPage() | 定位到最后一页，如果paging 为 true和server，则做远程查询 |  | Promise&lt;any&gt; | |
| prePage() | 定位到上一页，如果paging 为 true和server，则做远程查询 |  | Promise&lt;any&gt; |    |
| nextPage() | 定位到下一页，如果paging 为 true和server，则做远程查询 |  | Promise&lt;any&gt; |   |
| [create(data, index)](/en/datasetapi/dataset-methods/create) | 创建一条记录 | data - 记录数据对象；index&lt;optional,default:dataSet.records.length&gt; - 记录所在的索引 | Record | |
| [delete(records, confirmMessage: ReactNode \| ModalProps)](/en/datasetapi/dataset-methods/delete) | 立即删除记录 | records - 删除的记录或记录组 confirmMessage - 自定义提示信息或弹窗的属性, 设为false时不弹确认直接删除 |  |  |
| [remove(records, forceRemove)](/en/datasetapi/dataset-methods/delete) | 临时删除记录 | records - 删除的记录或记录组; forceRemove(1.5.1) - 是否强制删除 |  |
| [deleteAll(confirmMessage: ReactNode \| ModalProps)](/en/datasetapi/dataset-methods/delete) | 立即删除所有记录 | confirmMessage - 自定义提示信息或弹窗的属性, 设为false时不弹确认直接删除 |  |   |
| [removeAll(forceRemove)](/en/datasetapi/dataset-methods/delete) | 临时删除所有记录 | forceRemove(1.5.1) - 是否强制删除 |  |    |
| push(...records) | 将若干数据记录插入记录堆栈顶部 | records - 插入的记录列表 | number | |
| unshift(...records) | 将若干数据记录插入记录堆栈底部 | records - 插入的记录列表 | number |  |
| pop() | 从记录堆栈顶部获取记录 |  | Record |  |
| shift() | 从记录堆栈底部获取记录 |  | Record |    |
| splice(from, deleteCount, ...records) | 删除指定索引的若干记录，并可插入若干新记录 | from&lt;optional,default:0&gt; - 索引开始的位置；deleteCount&lt;optional,default:0&gt; - 删除的数量； records - 插入的若干新记录 | Record[] |  |
| slice(start, end) | 截取指定索引范围的记录集，不改变原记录堆栈 | start&lt;optional,default:0&gt; - 开始索引；end&lt;optional,default:记录堆栈长度&gt; - 结束索引 | Record[] | |
| find(fn) | 根据函数查找并返回第一条记录 | fn - 查询函数(record, index, array) =&gt; boolean | Record |  |
| findIndex(fn) | 根据函数查找记录所在的索引 | fn - 查询函数(record, index, array) =&gt; boolean | number |   |
| forEach(fn, thisArg) | 根据函数遍历 | fn - 遍历函数(record, index, array) =&gt; void |  |   |
| map(fn, thisArg) | 根据函数遍历并输出新数组 | fn - 遍历函数(record, index, array) =&gt; any | any[] |   |
| some(fn, thisArg) | 根据函数遍历，当有返回值为 true 时，输出 true | fn - 遍历函数(record, index, array) =&gt; boolean | boolean |   |
| every(fn, thisArg) | 根据函数遍历，当有返回值为 false 时，输出 false | fn - 遍历函数(record, index, array) =&gt; boolean | boolean |    |
| filter(fn, thisArg) | 根据函数过滤并返回记录集 | fn - 过滤函数(record, index, array) =&gt; boolean | Record[] | |
| reduce(fn, initialValue) | 为数组中的所有元素调用指定的回调函数。 回调函数的返回值是累计结果，并在下次调用回调函数时作为参数提供 | fn - 过滤函数(previousValue, record, index, array) =&gt; value initialValue - 初始值 | typeof initialValue |   |
| reduceRight(fn, initialValue) | 按降序调用数组中所有元素的指定回调函数。 回调函数的返回值是累计结果，并在下次调用回调函数时作为参数提供 | fn - 过滤函数(previousValue, record, index, array) =&gt; value initialValue - 初始值 | typeof initialValue |    |
| indexOf(record, fromIndex) | 获取记录所在索引 | record - 记录；fromIndex&lt;optional&gt; - 开始检索的索引 | number |  |
| reverse() | 反转记录的顺序 |  | Record[] |    |
| select(recordOrIndex) | 选中记录 | recordOrIndex - 记录对象或记录的索引 |  |    |
| unSelect(recordOrIndex) | 取消选中记录 | recordOrIndex - 记录对象或记录的索引 |  |  |
| selectAll() | 全选当前页 |  |  |  |
| unSelectAll() | 取消全选当前页 |  |  |    |
| batchSelect(recordOrId) | 批量选择记录 | recordOrId - 记录对象或记录的id集 |  | |
| batchUnSelect(recordOrId) | 取消批量选择记录 | recordOrId - 记录对象或记录的id集 | |    |
| treeSelect(record) | 选择记录和其子记录 | record - 记录对象 |  | 1.4.2   |
| treeUnSelect(record) | 取消选择记录和其子记录 | record - 记录对象 |  |  |
| clearCachedSelected() | 清除缓存的选中记录 |  |  |    |
| clearCachedModified() | 清除缓存的变更记录 |  |  | 1.5.0-beta.0 |
| clearCachedRecords() | 清除所有缓存的记录 |  |  | 1.5.0-beta.0 |
| get(index) | 获取指定索引的记录 | index - 记录索引 | Record |   |
| getFromTree(index) | 从树形数据中获取指定索引的根节点记录 | index - 记录索引 | Record | |
| validate() | 校验数据记录是否有效 |  | Promise&lt;boolean&gt; |   |
| [getField(fieldName)](/en/datasetapi/dataset-methods/get-field) | 根据字段名获取字段 | fieldName - 字段名 | Field | |
| [addField(fieldName, fieldProps)](/en/datasetapi/dataset-methods/add-field) | 增加新字段 | fieldName - 字段名，fieldProps - 字段属性 | Field |    |
| toJSONData() | 转换成用于提交的 json 数据 |  | object[] | |
| toData() | 转换成普通数据，不包含删除的数据 |  | object[] |   |
| bind(ds, name) | 绑定头 DataSet | ds - 头 DataSet 对象或 id name - 绑定名 |  |    |
| [setQueryParameter(para, value)](/en/datasetapi/dataset-methods/set-query-parameter) | 设置查询参数 | para - 参数名 value - 参数值 |  | |
| [getQueryParameter(para)](/en/datasetapi/dataset-methods/set-query-parameter) | 获取查询参数 | para - 参数名 |  | 1.4.0 |
| [loadData(data, total, cache)](/en/datasetapi/dataset-methods/load-data) | 加载数据 | `data` - 数据数组 `total` - 总数，可选，用于分页 `cache`(1.5.0-beat.0) - 是否保留缓存的变更记录 | | |
| [appendData(data, parentRecord)](/en/datasetapi/dataset-methods/load-data) | 附加数据 | `data` - 数据数组 `parentRecord` - 父节点，可选， 用于 childrenField 模式的树形数据 | |
| [setState(key, value)](/en/datasetapi/other/state) | 设置自定义状态值。 | key - 键名或者键值对对象；value - 值 |  | 1.3.1 |
| [getState(key)](/en/datasetapi/other/state) | 获取自定义状态值。 | key - 键名 |  |  1.3.1  |
| modifiedCheck(message) | 变更检查 | message - 同 modifiedCheckMessage， 优先级高于 modifiedCheckMessage | | 1.3.1 |
| setAllPageSelection(enabled) | 切换是否跨页全选。 | enabled - 是否开启 |  | 1.4.0 |
| getValidationErrors() | 获取校验错误信息 |  |  | 1.4.0 |

### DataSet Events

| 事件名 | 说明 | 钩子参数 | 参数说明 | 是否可异步 | 版本  |
| --- | --- | --- | --- | --- | --- |
| update | 值更新事件 | ({ dataSet, record, name, value, oldValue }) =&gt; void | dataSet - 数据集 record - 更新的记录 name - 更新的字段 value - 新值 oldValue - 旧值 | 是 |  |
| query | 查询事件，返回值为 false 将阻止查询 | ({ dataSet, params, data }) =&gt; boolean | dataSet - 数据集 params - 查询参数 data - 查询参数 | 是 | |
| beforeLoad | 数据加载前的事件， 用于处理请求数据 | ({ dataSet, data }) =&gt; void | dataSet - 数据集 data - 请求数据 | 是 |   |
| load | 数据加载完后事件 | ({ dataSet }) =&gt; void | dataSet - 数据集 | 是 |    |
| beforeAppend | 数据附加前的事件， 用于处理请求数据 | ({ dataSet, data }) =&gt; void | dataSet - 数据集 data - 请求数据 | 是 | |
| append | 数据附加完后事件 | ({ dataSet }) =&gt; void | dataSet - 数据集 | 是 | 1.1.0 |
| loadFailed | 数据加载失败事件 | ({ dataSet }) =&gt; void | dataSet - 数据集 | 是 |  |
| submit | 提交事件，返回值为 false 将阻止提交 | ({ dataSet, data }) =&gt; boolean | dataSet - 数据集 data - json 数据 | 是 |   |
| submitSuccess | 提交成功事件 | ({ dataSet, data }) =&gt; void | dataSet - 数据集 data - 响应数据 | 是 |   |
| submitFailed | 提交失败事件 | ({ dataSet }) =&gt; void | dataSet - 数据集 | 是 |    |
| select | 选择记录事件 | ({ dataSet, record, previous }) =&gt; void | dataSet - 数据集 record - 选择的记录 previous - 之前选择的记录，单选模式下有效 | 是 |  |
| unSelect | 撤销选择记录事件 | ({ dataSet, record }) =&gt; void | dataSet - 数据集 record - 撤销选择的记录 | 是 |  |
| selectAll | <废弃>全选记录事件 | ({ dataSet }) =&gt; void | dataSet - 数据集 | 是 | |
| unSelectAll | <废弃>撤销全选记录事件 | ({ dataSet }) =&gt; void | dataSet - 数据集 | 是 |   |
| batchSelect | 批量选择记录事件, 由 select, selectAll, batchSelect 和 treeSelect 方法触发 | ({ dataSet, records }) =&gt; void | dataSet - 数据集 records - 选择的记录集 | 是 | |
| batchUnSelect | 批量取消选择记录事件, 由 unSelect, unSelectAll, batchUnSelect 和 treeUnSelect 方法触发 | ({ dataSet, records }) =&gt; void | dataSet - 数据集 records - 选择的记录集 | 是 | 1.4.2  |
| selectAllPage | 跨页全选事件 | ({ dataSet }) =&gt; void | dataSet - 数据集  | 是 | 1.5.3 |
| unSelectAllPage | 取消跨页全选事件 | ({ dataSet }) =&gt; void | dataSet - 数据集 | 是 | 1.5.3 |
| indexChange | 当前记录变更事件 | ({ dataSet, record, previous }) =&gt; void | dataSet - 数据集 record - 新当前记录 previous - 旧当前记录 | 是 | |
| fieldChange | 字段属性变更事件 | ({ dataSet, record, name, propsName, value, oldValue }) =&gt; void | dataSet - 数据集 record - 字段所属记录，dataSet 的字段无 record name - 字段名 propsName - 属性名 value - 新值 oldValue - 旧值 | 是 |    |
| create | 记录创建事件 | ({ dataSet, record }) =&gt; void | dataSet - 数据集 record - 创建的记录 | 是 |    |
| remove | 记录移除事件 | ({ dataSet, records }) =&gt; void | dataSet - 数据集 records - 移除的记录 | 是 |  |
| export | 导出事件，返回值为 false 将阻止导出 | ({ dataSet, params, data }) =&gt; boolean | dataSet - 数据集 params - 查询参数 data - 查询参数 | 是 |    |
| beforeRemove | 数据临时删除前的事件， 返回值为 false 将阻止临时删除 | ({ dataSet, records }) =&gt; boolean | dataSet - 数据集 records - 记录集 | 否 | |
| beforeDelete | 数据删除前的事件， 返回值为 false 将阻止删除 | ({ dataSet, records }) =&gt; boolean | dataSet - 数据集 records - 记录集 | 是 | 1.0.0 |
| reset | 数据重置事件 | ({ dataSet, records }) =&gt; void | dataSet - 数据集 records - 记录集 | 是 |   |
| validate | 校验事件 | ({ dataSet, result }) =&gt; void | dataSet - 数据集 result - 校验结果集 | 是 |  |
| validateSelf | 校验dataSet事件 | ({ dataSet, result }) =&gt; void | `dataSet` - 数据集 `result` - 校验结果 | 是 |  1.5.1  |


### Record Props

> 1.5.0 版本新增属性，更多案例参考 [Form](/en/procmp/data-entry/form#禁用) & [Table](/en/procmp/data-display/table#功能总和)。

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| [disabled](/en/datasetapi/record-props/disabled) | 是否禁用 | boolean | false |
| selectable | 是否可选 | boolean | true |
| defaultSelected | 是否默认选中 | boolean | false |
| defaultExpanded | 是否默认展开 | boolean | false |
| [dynamicProps](/en/datasetapi/other/dynamic-props) | 动态属性对象。对象为记录属性和返回该记录属性值的钩子的键值对。 | { recordProp: (record) => value } |  |

### Record Values

> 详细介绍：[Record](/en/tutorials/dataSet-more#record-%E5%AF%B9%E8%B1%A1)

| 名称           | 说明                                            | 类型                      |
| -------------- | ----------------------------------------------- | ------------------------- |
| id             | 唯一 ID，自增长的数字                           | number                    |
| key            | 唯一键，主键字段或唯一索引键字段的值，默认同 id | string \| number          |
| status         | 状态， 可选值 add \| update \| delete \| sync    | observable&lt;string&gt;  |
| disabled(1.5.0)       | 禁用                                            | observable&lt;boolean&gt; |
| selectable     | 可选                                            | observable&lt;boolean&gt; |
| selectedTimestamp（1.5.3） | 选中时间戳, 可用于排序 | observable&lt;number&gt; |
| isSelected     | 是否选中                                        | observable&lt;boolean&gt; |
| isCurrent      | 是否当前记录                                    | observable&lt;boolean&gt; |
| isExpanded | 树形节点是否展开 | observable&lt;boolean&gt; |
| children       | 树形子数据集                                    | Record[] \| undefined      |
| parent         | 树形父数据                                      | Record \| undefined        |
| previousRecord | 树形中前一条数据                                | Record \| undefined        |
| nextRecord     | 树形中后一条数据                                | Record \| undefined        |
| level          | 树形层级                                        | number                    |
| dirty          | 数据是否发生变更， 包含级联数据源是否变更       | boolean                   |
| cascadeParent  | 级联父数据                                      | Record \| undefined        |
| index          | 在数据源中的索引                                | number                    |
| editing        | 编辑中状态                                | boolean                    |
| pending        | 等待中状态， 包括树形子数据异步加载                                | boolean                    |

### Record Methods

> 详细介绍：[Record](/en/tutorials/dataSet-more#record-%E5%AF%B9%E8%B1%A1)

| 名称 | 说明 | 参数 | 返回值类型 | 版本|
| --- | --- | --- | --- | --- |
| get(fieldName) | 根据字段名获取字段值或根据字段名数组获取字段名与字段值的对象。注意：禁止通过 record.data\[fieldName\]的方式获取字段值。 | fieldName - 字段名 或 字段名数组 | any |  |
| getPristineValue(fieldName) | 根据字段名获取字段的原始值。 | fieldName - 字段名 | any | |
| [set(fieldName, value)](/en/datasetapi/record-methods/set) | 给指定字段赋值 | fieldName - 字段名或者键值对对象；value - 值 |  |    |
| [init(fieldName, value)](/en/datasetapi/record-methods/set) | 给指定字段初始化值。字段变为净值。 | fieldName - 字段名或者键值对对象；value - 值 |  |   |
| [setState(key, value)](/en/datasetapi/other/state) | 设置自定义状态值。 | key - 键名或者键值对对象；value - 值 |  | |
| [getState(key)](/en/datasetapi/other/state) | 获取自定义状态值。 | key - 键名 |  |    |
| [toJSONData()](/en/datasetapi/dataset-props/data-to-json) | 转换成用于提交的 json 数据, 受 DataSet 的 dataToJSON 属性影响。 |  | object |  |
| [toData()](/en/datasetapi/dataset-props/data-to-json) | 转换成普通数据, 包括所有级联数据。 注意：禁止通过此方法获取的 data 来获取值，请用更高性能的 get 方法来获取值。 | | object |    |
| validate(all, noCascade) | 校验记录 | all - 校验所有字段，默认为 false，只校验修改或新增字段 noCascade - 为 true 时，不校验级联数据 | Promise&lt;boolean&gt; |    |
| getCascadeRecords(childName) | 根据级联名获取子级联数据 | childName - 级联名 | Record[] |   |
| [getField(fieldName)](/en/datasetapi/dataset-methods/get-field) | 根据字段名获取字段，注意：1.5.0-beta.0 版本后尽量使用 dataSet.getField 来提高性能, 如果要获取 recordField 的属性， 可以使用 dsField.get(name, record) | `fieldName` - 字段名 | Field |
| addField(fieldName, fieldProps) | 增加新字段, 1.5.0-beta.0 版本后如果该字段非 record 独有的话，请选择使用 dataSet.addField | `fieldName` - 字段名，`fieldProps` - 字段属性 | Field |
| clone() | 克隆记录，自动剔除主键值 |  | Record |  |
| ready() | 判断记录是否准备就绪 |  | Promise | |
| [reset()](/en/datasetapi/dataset-methods/reset) | 重置更改 |  |  |    |
| save() | 保存当前数据至缓存 |  |  |   |
| restore() | 从缓存恢复保存的数据 |  |  |  |
| clear() | 清除所有数据 |  |  |    |
| getValidationErrors() | 获取校验错误信息 | | | 1.4.0   |

### Field Props

> 详细介绍：[Field](/en/tutorials/dataSet-more#fields)

| 参数 | 说明 | 类型 | 默认值 | 版本 |
| --- | --- | --- | --- | --- |
| name | 字段名 | string |  |   |
| [type](/en/datasetapi/field-props/type) | 字段类型，可选值：boolean \| number \| string \| date \| dateTime \| time \| week \| month \| year \| email \| url \| intl \| object \| attachment \| json \| bigNumber(1.5.1) | string | string |  |
| order | 排序类型，只支持单 field 排序， 如果多个 field 设置了 order，取第一个有 order 的 field，可选值: asc \| desc | string |  |    |
| label | 字段标签 | string \| ReactNode |  |    |
| labelWidth | 字段标签宽度 | number |  |   |
| format | 字符串类型和日期类型字段值格式化。 字符串类型格式化可选值: 'uppercase' 'lowercase' 'capitalize' | string |  |    |
| [pattern](/en/datasetapi/other/validate) | 正则校验 | string \| RegExp |  |    |
| [maxLength](/en/datasetapi/other/validate) | 最大长度 | number |  |    |
| [minLength](/en/datasetapi/other/validate) | 最小长度 | number |  |    |
| [max](/en/datasetapi/other/validate) | 最大值。 fieldName 指向当前记录的 fieldName 值作为最大值。 | BigNumber.Value \| MomentInput \| fieldName | Infinity |  | |
| [min](/en/datasetapi/other/validate) | 最小值。 fieldName 指向当前记录的 fieldName 值作为最小值。 | BigNumber.Value \| MomentInput \| fieldName | -Infinity |   | |
| [step](/en/datasetapi/field-props/precision) | 步距。| BigNumber.Value \| number \| { hour: number, minute: number, second: number } \| string |  | |
| nonStrictStep | 非严格步距，在非严格步距下，允许输入值不为步距的倍数加上最小值，也允许在设置整数步距的情况下输入小数   | boolean | false |    |
| [precision](/en/datasetapi/field-props/precision) | 小数点精度, 提交时会截断 | number |  | 1.3.0 |
| numberGrouping | 千分位分组显示 | boolean | true | 1.3.0   |
| [formatterOptions](/en/datasetapi/field-props/precision) | 数字和货币格式化配置 | FormatNumberFuncOptions: { lang?: string, options?: [Intl.NumberFormatOptions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat) } | | 1.5.1 |
| [validator](/en/datasetapi/other/validate) | 校验器，当返回值为 false 或 涵盖错误信息的字符串，则为校验失败 | (value, name, record) =&gt; boolean \| string \| undefined |  |  |
| [required](/en/datasetapi/other/validate) | 是否必选 | boolean | false |   |
| readOnly | 是否只读 | boolean | false |   |
| disabled | 是否禁用 | boolean | false |   |
| [textField](/en/datasetapi/field-props/text-field) | 值列表的文本字段 | string | meaning | |
| [valueField](/en/datasetapi/field-props/text-field) | 值列表的值字段 | string | value |    |
| [trueValue](/en/datasetapi/field-props/true-value) | 类型为 boolean 时，true 对应的值 | boolean \|string \|number | true | |
| [falseValue](/en/datasetapi/field-props/true-value) | 类型为 boolean 时，false 对应的值 | boolean \|string \|number | false |   |
| options | 下拉框组件的菜单数据集 | DataSet |  |   |
| [optionsProps](/en/datasetapi/field-props/options-props) | 值集组件的数据集配置 | DataSetProps \| (DataSetProps) => DataSetProps |  | |
| group | 是否分组，如果是 number，则为分组的顺序 | boolean \|number |  | |
| defaultValue | 默认值 | any |  |  |
| multiple | 是否为值数组。 当为字符串时，作为数据分隔符，查询时会将字符串分割成数组，提交时会将数组拼接成字符串 | boolean \| string | false |  |
| [range](/en/datasetapi/field-props/range)  | 是否为范围值。 当为 true 时，则值为\[startValue, endValue\]；当为数组时，例如\['start', 'end'\]时，则值为{ start: startValue, end: endValue } | boolean \| \[string, string\] | false |   |
| unique | 唯一索引或联合唯一索引组名。multiple 和 range 字段不适用。当 column 的 editor 设为 true 时，编辑器只会在新增的记录显示，如果要对已有数据进行编辑，请自定义 editor | boolean \| string | false |  |
| lovCode | LOV 配置代码 | string |  |  |
| lovPara | LOV 或 Lookup 查询参数对象 | object |  |    |
| lookupCode | 值列表代码 | string |  | |
| lookupUrl | 值列表请求地址 | string \| (code) => string |  |  |
| lovDefineUrl | lov 配置请求地址 | string \| (code) => string |  | |
| lovQueryUrl | lov 查询请求地址 | string \| (code, config, { dataSet, params, data }) => string |  |   |
| lookupAxiosConfig | 值列表请求配置或返回配置的钩子，详见[AxiosRequestConfig](/en/procmp/configure/configure#axiosrequestconfig)。配置中默认 url 为 lookupUrl， method 为 post。 | AxiosRequestConfig\| ({ dataSet, record, params, lookupCode }) => AxiosRequestConfig |  |  |
| lovDefineAxiosConfig | lov 配置的请求配置或返回配置的钩子，详见[AxiosRequestConfig](/en/procmp/configure/configure#axiosrequestconfig)。 配置中默认 url 为 lovDefineUrl， method 为 post。 | AxiosRequestConfig\| (code: string, field?: Field) => AxiosRequestConfig |  |  |
| lovQueryAxiosConfig | lov 查询的请求配置或返回配置的钩子，详见[AxiosRequestConfig](/en/procmp/configure/configure#axiosrequestconfig)。 配置中默认 url 为 lovQueryUrl， method 为 post。 | AxiosRequestConfig\| (code, config, { dataSet, params, data }) => AxiosRequestConfig |  | |
| lookupBatchAxiosConfig | 返回 lookup 批量查询配置的钩子，优先级高于全局配置的lookupBatchAxiosConfig，根据返回配置的url的不同分别做批量查询，详见[AxiosRequestConfig](/en/procmp/configure/configure#axiosrequestconfig)。 | (codes: string[]) => AxiosRequestConfig | - | 1.0.0 |
| bind | 内部字段别名绑定 | string |  | |
| [dynamicProps](/en/datasetapi/other/dynamic-props) | [动态属性对象](/en/tutorials/dataSet-more#dynamicprops)。对象为字段属性和返回该字段值的钩子的键值对。| { fieldProp: ({ dataSet, record, name }) => value } |  |  |
| [computedProps](/en/datasetapi/other/dynamic-props) | 计算属性对象。功能和用法同 dynamicProps，具有 mobx computed 的缓存功能，一般用于计算量大的场景，避免重复计算，提高性能。请确保计算依赖的值是可观察的。  | { fieldProp: ({ dataSet, record, name }) => value } |  | 1.4.0 |
| cascadeMap | 快码和 LOV 查询时的级联参数映射，详见[级联](/en/tutorials/select#级联)。 | object |  |   |
| currency | 货币代码，详见[Current currency & funds code list.](https://www.currency-iso.org/en/home/tables/table-a1.html) | string |  |   |
| ignore | 忽略提交, 可选值: always - 总是忽略 clean - 值未变化时忽略 never - 从不忽略 | string | |   |
| transformRequest | 在发送请求之前对数据进行处理 | (value: any, record: Record) => any |  |    |
| transformResponse | 在获得响应之后对数据进行处理 | (value: any, object: any) => any |  |  |
| trim | 字符串值是否去掉首尾空格，可选值: both \| left \| right \| none | string | both |  |
| defaultValidationMessages | 默认校验信息，详见[ValidationMessages](/en/procmp/configure/configure#validationmessages) | ValidationMessages |  |  |
| highlight | 高亮, 如是字符串或 ReactElement, 则会显示 Tooltip | boolean \| ReactNode |  | 1.4.0 |
| showCheckedStrategy | 树形多选时定义选中项回填的方式。SHOW_CHILD: 只显示子节点. SHOW_PARENT: 只显示父节点(当父节点下所有子节点都选中时). 默认显示所有选中节点(包括父节点). | string | SHOW_ALL | 1.4.4 |
| bucketName | 附件上传的桶名 | string |  | 1.4.4 |
| bucketDirectory | 附件上传的桶目录 | string |  | 1.4.4 |
| storageCode | 附件存储编码 | string |  | 1.4.4 |
| template | 附件模板 | { bucketName?: string, bucketDirectory?: string, storageCode?:string, attachmentUUID: string, isPublic?: boolean } |  | 1.5.5 |
| attachmentCount | 附件数量， 一般使用 dynamicProps 来获取 record 中某个字段值作为附件数量， 优先级低于attachments.length | string |  | 1.4.4 |
| fileKey | 附件上传属性名 | string | [AttachmentConfig.defaultFileKey](zh/procmp/configure/configure#attachmentconfig) | 1.5.2 |
| fileSize | 附件大小限制 | number | [AttachmentConfig.defaultFileSize](zh/procmp/configure/configure#attachmentconfig) | 1.5.2 |
| useChunk | 附件开启分片上传 | string |  | 1.5.2 |
| chunkSize | 附件分片大小 | number | [AttachmentConfig.defaultChunkSize](zh/procmp/configure/configure#attachmentconfig)  | 1.5.2 |
| chunkThreads | 附件分片上传并发数 | number | [AttachmentConfig.defaultChunkThreads](zh/procmp/configure/configure#attachmentconfig) | 1.5.2 |
| processValue | 值变更时，拦截并返回一个新的值 | (value: any, range?: 0 \| 1) => any |   | 1.4.4 |
| help | 额外信息，常用于提示 | string |  |
| dateMode | 日期组件显示模式,可选值: `date` `dateTime` `time` `year` `month` `week` | string | date  | 1.5.6 |
| accept | Attachment 接受上传的文件类型 [input accept Attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#attr-accept) | string[] |  | 1.5.7 |

### Field Values

> 详细介绍：[Field](/en/tutorials/dataSet-more#fields)

| 名称     | 说明     | 类型                      | 版本 |
| -------- | -------- | ------------------------- | --- |
| name     | 字段名   | readonly string           | |
| type     | 类型     | observable&lt;string&gt;  | |

### Field Methods

> 详细介绍：[Field](/en/tutorials/dataSet-more#fields)

* 当 field 是通过 ds.getField 获取的字段时， 以上传了 record 参数的方法等同于调用了通过 record.getField 得到的 field 对应的方法。版本：1.5.0-beta.0+

| 名称 | 说明 | 参数 | 返回值类型 | 版本 |
| --- | --- | --- | --- | --- |
| get(propsName, record) | 根据属性名获取属性值 | `propsName` - 属性名 `record` - 记录 | any |
| set(propsName, value) | 设置属性值 | propsName - 属性名；value - 属性值 |  |
| reset() | 重置设置的属性 |  |  |
| checkValidity(record) | 校验字段值 | `record` - 记录 | boolean |
| setLovPara(para, value, record) | 设置 Lov 的查询参数 | `para` - 参数名；`value` - 参数值 `record` - 记录 | - |
| getOptions(record) | 获取选项数据集， 设置了 lookupCode 和 lovCode 的字段也适用 | `record` - 记录 | DataSet |
| getValue(record) | 获取当前记录的本字段值 | `record` - 记录 | any |
| getText(lookupValue, showValueIfNotFound, record) | 根据 lookup 值获取 lookup 描述 | `lookupValue` - lookup 值，默认本字段值 `showValueIfNotFound` - 当未找到文本时显示值 `record` - 记录 | string |
| getLookupData(lookupValue, record) | 根据 lookup 值获取 lookup 数据对象 | `lookupValue` - lookup 值，默认本字段值 `record` - 记录 | object |
| fetchLookup(noCache, record) | 请求 lookup 数据，若有缓存直接返回缓存数据。 |  `noCache` - 是否禁用缓存 `record` - 记录 | Promise&lt;object[]&gt; |
| isValid(record) | 是否校验通过 |  `record` - 记录 | boolean ||
| isDirty(record) | 值是否变更 |  `record` - 记录 | boolean ||
| getValidationMessage(record) | 获取校验信息 |  `record` - 记录 | string |
| getValidationErrorValues(record) | 获取校验结果 |  `record` - 记录 | ValidationResult[] | 1.5.0-beta.0 |
| getAttachments(record) | 获取附件列表 |  `record` - 记录 | AttachmentFile[] | 1.5.0-beta.0 |
| getAttachmentCount(record) | 获取附件数量 |  `record` - 记录 | number | 1.5.0-beta.0 |

### Group Values

> 1.5.1 版本新增属性

| 名称     | 说明     | 类型                      |
| -------- | -------- | ------------------------- |
| name     | 分组名， 对应字段名   | readonly string           |
| value    | 分组值， 对应字段值     | readonly any  |
| records    | 分组数据集，若有子分组则为空数组     | Record[]  |
| totalRecords    | 总数据集，涵盖所有子分组的数据集     | Record[]  |
| subGroups    | 非同组子分组     | Group[]  |
| parentGroup    | 非同组父分组     | Group  |
| children    | 同组树形子分组     | Group[]  |
| parent    | 同组树形父分组     | Group  |
| index    | 索引     | number  |

### Group Methods

> 1.5.1 版本新增属性

| 名称 | 说明 | 参数 | 返回值类型 |
| --- | --- | --- | --- |
| [setState(key, value)](/en/datasetapi/other/state) | 设置自定义状态值。 | key - 键名或者键值对对象；value - 值 |  |
| [getState(key)](/en/datasetapi/other/state) | 获取自定义状态值。 | key - 键名 |  |

### Transport

> 详细介绍：[Transport](/en/tutorials/dataSet-more#transport)

| 属性 | 说明 | 类型 |
| --- | --- | --- |
| create | 新建请求的 axios 配置或 url 字符串 | AxiosRequestConfig \| ({ data, params, dataSet }) => AxiosRequestConfig \| string |
| read | 查询请求的 axios 配置或 url 字符串 | AxiosRequestConfig \| ({ data, params, dataSet }) => AxiosRequestConfig \| string |
| update | 更新请求的 axios 配置或 url 字符串 | AxiosRequestConfig \| ({ data, params, dataSet }) => AxiosRequestConfig \| string |
| destroy | 删除请求的 axios 配置或 url 字符串 | AxiosRequestConfig \| ({ data, params, dataSet }) => AxiosRequestConfig \| string |
| validate | 唯一性校验请求的 axios 配置或 url 字符串。当字段配了 unique 属性时，在当前数据集中没有重复数据的情况下，则会发起远程唯一性校验。校验的请求 data 格式为 { unique: \[{fieldName1: fieldValue1,fieldName2: fieldValue2...}\] }，响应格式为 boolean \| boolean\[\]。 | AxiosRequestConfig \| ({ data, params, dataSet }) => AxiosRequestConfig \| string |
| submit | create, update, destroy 的默认配置或 url 字符串。 | AxiosRequestConfig \| ({ data, params, dataSet }) => AxiosRequestConfig \| string |
| tls | 多语言数据请求的 axios 配置或 url 字符串。UI 接收的接口返回值格式为：\[{ name: { zh_CN: '简体中文', en_US: '美式英语', ... }}\]， 其中 name 是字段名。请使用全局配置 transport 的 tls 钩子统一处理。 | AxiosRequestConfig \| ({ data, params, dataSet, record, name }) => AxiosRequestConfig \| string |
| exports | 导出的配置或 url 字符串 | AxiosRequestConfig \| ({ data, params, dataSet }) => AxiosRequestConfig \| string |
| adapter | CRUD 配置适配器 | (config: AxiosRequestConfig, type: string) => AxiosRequestConfig |

### Feedback

| 属性                | 说明                                       | 类型     |
| ------------------- | ------------------------------------------ | -------- |
| loadSuccess(resp)   | DataSet 查询成功的反馈, resp - 响应值    | Function |
| loadFailed(error)   | DataSet 查询失败的反馈, error - 异常对象 | Function |
| submitSuccess(resp) | DataSet 提交成功的反馈, resp - 响应值    | Function |
| submitFailed(error) | DataSet 提交失败的反馈, error - 异常对象 | Function |

### DataToJSON

> 详细介绍：[DataToJSON](/en/tutorials/dataSet-more#datatojson)

| 枚举值 | 说明 | 版本  |
| --- | --- | --- |
| dirty | 只转换变更的数据，包括本身无变更但级联有变更的数据 |  |
| dirty-field | 只转数据中变更了的字段（包括主键和unique以及ignore为never的字段），包括本身无变更但级联有变更的数据 | 1.4.2  |
| selected | 只转换选中的数据，无关数据的变更状态 | |
| all | 转换所有数据 |  |
| normal | 转换所有数据为普通 json，不会带上\_\_status, \_\_id 等附加字段，也不会出现临时删除的数据， 一般用于大 JSON 字段 |    |
| dirty-self | 同 dirty， 但不转换级联数据 |    |
| dirty-field-self | 同 dirty-field， 但不转换级联数据 | 1.4.2   |
| selected-self | 同 selected， 但不转换级联数据 |  |
| all-self | 同 all， 但不转换级联数据 |    |
| normal-self | 同 normal， 但不转换级联数据 |  |

### AttachmentFile

> 1.4.4 版本新增属性

| 属性                | 说明                                       | 类型     |
| ------------------- | ------------------------------------------ | -------- |
| name   | 文件全名    | string |
| size   | 文件大小    | number |
| type   | 文件类型    | string |
| lastModified   | 文件最后修改时间戳    | number |
| creationDate   | 上传时间    | Date |
| uid   | 唯一标识    | string |
| url   | url地址    | string |
| filename   | 文件名（不包含后缀）    | string |
| ext   | 文件后缀    | string |
| status   | 状态 error \| success \| uploading \| deleting \| done    | string |
| percent   | 上传进度, 0 至 100   | number |
| error   | 上传错误对象  | AxiosError |
| errorMessage   | 错误消息  | string |
| invalid   | 检验失败，如果为true, 则无法重新上传  | boolean |
| originFileObj   | 原始文件对象，只有通过上传按钮选择的附件才有该对象  | File |

### AttachmentFileChunk

> 1.5.2 版本新增属性

| 属性                | 说明                                       | 类型     |
| ------------------- | ------------------------------------------ | -------- |
| file   | AttachmentFile对象    | AttachmentFile |
| total   | 文件总大小    | number |
| start   | 分片起始位置    | number |
| end   | 分片结束位置    | number |
| index   | 分片索引    | number |
| status   | 状态 error \| success \| uploading    | string |
| percent   | 上传进度, 0 至 100   | number |

### ValidationRule

> 1.5.1 版本新增属性

| 属性                | 说明                                       | 类型     |
| ------------------- | ------------------------------------------ | -------- |
| name | 校验的名称，可选值：minLength \| maxLength | string |
| value | 校验值 | number |
| message | 校验提示内容  | string |
| disabled(1.5.2) | 禁用  | boolean \| ({ dataSet }) => boolean |
