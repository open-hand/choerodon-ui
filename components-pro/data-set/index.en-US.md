---
category: Pro Components
order: -1
title: DataSet
---

数据源。

## API

### DataSet Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| name | 对应后台 ds 的 name，自动生成约定的 submitUrl, queryUrl, tlsUrl, validateUrl | Array&lt;object&gt; |  |
| data | 初始化数据 | Array&lt;object&gt; |  |
| autoQuery | 初始化后自动查询 | boolean | false |
| autoCreate | 初始化时，如果没有记录且 autoQuery 为 false，则自动创建记录 | boolean | false |
| selection | 选择的模式, 可选值：`false` `'multiple'` `'single'` | boolean \| string | 'multiple' |
| modifiedCheck | 查询前，当有记录更改过时，是否警告提示。 | boolean | false |
| pageSize | 分页大小 | number | 10 |
| paging | 是否不分页 | boolean | true |
| dataKey | 查询返回的 json 中对应的数据的 key, 当为 null 时对应整个 json 数据, json 不是数组时自动作为新数组的第一条数据 | string \| null | rows |
| totalKey | 查询返回的 json 中对应的总数的 key | string | total |
| queryDataSet | 查询条件数据源 | DataSet |  |
| queryUrl | 查询请求的 url。 当设定 name 时，默认 /dataset/{name}/queries | string |  |
| queryParameter | 查询请求的初始参数 | object |  |
| submitUrl | 记录提交请求的 url。 当设定 name 时，默认 /dataset/{name}/mutations | string |  |
| tlsUrl | 多语言查询请求的 url。 当设定 name 时， 默认 /dataset/{name}/languages | string |  |
| validateUrl | 远程校验查询请求的 url。 当设定 name 时， 默认 /dataset/{name}/validate | string |  |
| exportUrl | 导出请求的 url。 当设定 name 时， 默认 /dataset/{name}/export | string |  |
| transport | 自定义 CRUD 请求配置, 详见[Transport](#Transport) 及 [AxiosRequestConfig](#AxiosRequestConfig) | Transport |  |
| children | 级联行数据集, 例： { name_1: dataSet1, name_2: dataSet2 } | { name: DataSet } |  |
| primaryKey | 主键字段名，一般用作级联行表的查询字段 | string |  |
| idField | 树形数据当前节点 id 字段名 | string |  |
| parentField | 树形数据当前父节点 id 字段名 | string |  |
| expandField | 树形数据标记节点是否展开的字段名 | string |  |
| checkField | 树形数据标记节点是否为选中的字段名，在展开按钮后面会显示 checkbox | string |  |
| fields | 字段属性数组，详见[Field Props](#Field Props) | object\[\] |  |
| queryFields | 查询字段属性数组，在内部生成 queryDataSet，优先级低于 queryDataSet 属性，详见[Field Props](#Field Props) | object\[\] |  |
| cacheSelection | 缓存选中记录，使切换分页时仍保留选中状态。当设置了 primaryKey 或有字段设置了 unique 才起作用。 | boolean | false |
| axios | 覆盖默认 axios | AxiosInstance |  |

### DataSet Values

| 名称 | 说明 | 类型 |
| --- | --- | --- |
| current | 获取或者设置当前记录 | observable&lt;Record&gt; |
| currentPage | 当前页码 | readonly observable&lt;number&gt; |
| currentIndex | 当前游标索引 | observable&lt;number&gt; |
| totalCount | 总记录数 | observable&lt;number&gt; |
| totalPage | 总页数 | readonly observable&lt;number&gt; |
| pageSize | 分页大小 | observable&lt;number&gt; |
| paging | 是否分页 | observable&lt;boolean&gt; |
| status | 状态，`loading` `submitting` `ready` | observable&lt;string&gt; |
| selection | 选择的模式, 可选值：`false` `'multiple'` `'single'` | observable&lt;string\|boolean&gt; |
| records | 所有记录 | observable&lt;Record[]&gt; |
| all | 所有记录, 包括缓存的选择记录 | observable&lt;Record[]&gt; |
| data | 数据, 不包括删除状态的 Record | observable&lt;Record[]&gt; |
| created | 新建的数据 | readonly observable&lt;Record[]&gt; |
| updated | 更新的数据 | readonly observable&lt;Record[]&gt; |
| destroyed | 暂时销毁的数据 | readonly observable&lt;Record[]&gt; |
| selected | 选中记录，包括缓存的选中记录 | readonly observable&lt;Record[]&gt; |
| currentSelected | 当前页选中记录 | readonly observable&lt;Record[]&gt; |
| cachedSelected | 缓存的选中记录 | readonly observable&lt;Record[]&gt; |
| length | 数据量 | readonly observable&lt;number&gt; |
| queryDataSet | 查询数据源 | observable&lt;DataSet&gt; |
| parent | 级联头数据源 | readonly DataSet |
| children | 所有级联行数据源 | readonly \[key:string\]: DataSet} |

### DataSet Methods

| 名称 | 说明 | 参数 | 返回值 |
| --- | --- | --- | --- |
| ready(isSelect) | 判断记录是否准备就绪 | `isSelect` - 设为 `true` 时，判断选中的记录 | Promise |
| query(page) | 查询 | `page`&lt;optional,defualt:0&gt; - 指定页码 | Promise&lt;any&gt; |
| submit(isSelect, noCascade) | 将数据集中的增删改的记录先进行校验再进行远程提交。submit 会抛出请求的异常，请用 promise.catch 或 try-await-catch 来处理异常。 | `isSelect` - 设为 `true` 时，只提交选中的记录 `noCascade` - 为 true 时，不提交级联数据 | Promise&lt;any&gt; `false` - 校验失败，`undefined` - 无数据提交或提交相关配置不全，如没有 submitUrl。 |
| reset() | 重置更改, 并清除校验状态 |  |  |
| locate(index) | 定位到指定记录, 如果`paging` 为 `true`，则做远程查询 | `index` - 记录索引 | Promise&lt;Record&gt; |
| page(page) | 定位到指定页码，如果`paging` 为 `true`，则做远程查询 | `page` - 页码 | Promise&lt;any&gt; |
| first() | 定位到第一条记录，如果`paging` 为 `true`，则做远程查询 |  | Promise&lt;Record&gt; |
| last() | 定位到最后一条记录，如果`paging` 为 `true`，则做远程查询 |  | Promise&lt;Record&gt; |
| pre() | 定位到上一条记录，如果`paging` 为 `true`，则做远程查询 |  | Promise&lt;Record&gt; |
| next() | 定位到下一条记录，如果`paging` 为 `true`，则做远程查询 |  | Promise&lt;Record&gt; |
| firstPage() | 定位到第一页，如果`paging` 为 `true`，则做远程查询 |  | Promise&lt;any&gt; |
| lastPage() | 定位到最后一页，如果`paging` 为 `true`，则做远程查询 |  | Promise&lt;any&gt; |
| prePage() | 定位到上一页，如果`paging` 为 `true`，则做远程查询 |  | Promise&lt;any&gt; |
| nextPage() | 定位到下一页，如果`paging` 为 `true`，则做远程查询 |  | Promise&lt;any&gt; |
| create(data, index) | 创建一条记录 | `data` - 记录数据对象；`index`&lt;optional,default:0&gt; - 记录所在的索引 | Record |
| delete(records) | 立即删除记录 | `records` - 删除的记录或记录组 |  |
| remove(records) | 临时删除记录 | `records` - 删除的记录或记录组 |  |
| deleteAll() | 立即删除所有记录 |  |  |
| removeAll() | 临时删除所有记录 |  |  |
| push(...records) | 将若干数据记录插入记录堆栈顶部 | `records` - 插入的记录列表 | number |
| unshift(...records) | 将若干数据记录插入记录堆栈底部 | `records` - 插入的记录列表 | number |
| pop() | 从记录堆栈顶部获取记录 |  | Record |
| shift() | 从记录堆栈底部获取记录 |  | Record |
| splice(from, deleteCount, ...records) | 删除指定索引的若干记录，并可插入若干新记录 | `from`&lt;optional,default:0&gt; - 索引开始的位置；`deleteCount`&lt;optional,default:0&gt; - 删除的数量； `records` - 插入的若干新记录 | Record[] |
| slice(start, end) | 截取指定索引范围的记录集，不改变原记录堆栈 | `start`&lt;optional,default:0&gt; - 开始索引；`end`&lt;optional,default:记录堆栈长度&gt; - 结束索引 | Record[] |
| find(fn) | 根据函数查找并返回第一条记录 | `fn` - 查询函数(record, index, array) =&gt; boolean | Record |
| findIndex(fn) | 根据函数查找记录所在的索引 | `fn` - 查询函数(record, index, array) =&gt; boolean | number |
| forEach(fn, thisArg) | 根据函数遍历 | `fn` - 遍历函数(record, index, array) =&gt; void |  |
| map(fn, thisArg) | 根据函数遍历并输出新数组 | `fn` - 遍历函数(record, index, array) =&gt; any | any[] |
| some(fn, thisArg) | 根据函数遍历，当有返回值为 true 时，输出 true | `fn` - 遍历函数(record, index, array) =&gt; boolean | boolean |
| every(fn, thisArg) | 根据函数遍历，当有返回值为 false 时，输出 false | `fn` - 遍历函数(record, index, array) =&gt; boolean | boolean |
| filter(fn, thisArg) | 根据函数过滤并返回记录集 | `fn` - 过滤函数(record, index, array) =&gt; boolean | Record[] |
| reduce(fn, initialValue) | 为数组中的所有元素调用指定的回调函数。 回调函数的返回值是累计结果，并在下次调用回调函数时作为参数提供 | `fn` - 过滤函数(previousValue, record, index, array) =&gt; value `initialValue` - 初始值 | typeof initialValue |
| reduceRight(fn, initialValue) | 按降序调用数组中所有元素的指定回调函数。 回调函数的返回值是累计结果，并在下次调用回调函数时作为参数提供 | `fn` - 过滤函数(previousValue, record, index, array) =&gt; value `initialValue` - 初始值 | typeof initialValue |
| indexOf(record, fromIndex) | 获取记录所在索引 | `record` - 记录；`fromIndex`&lt;optional&gt; - 开始检索的索引 | number |
| reverse() | 反转记录的顺序 |  | Record[] |
| select(record) | 选中记录 | `record` - 记录对象或记录的索引 |  |
| unSelect(record) | 取消选中记录 | `record` - 记录对象或记录的索引 |  |
| selectAll() | 全选当前页 |  |  |
| unSelectAll() | 取消全选当前页 |  |  |
| clearCachedSelected() | 清除缓存的选中记录 |  |  |
| get(index) | 获取指定索引的记录 | `index` - 记录索引 | Record |
| getFromTree(index) | 从树形数据中获取指定索引的根节点记录 | `index` - 记录索引 | Record |
| isModified() | 判断是否有新增、变更或者删除的记录 |  | boolean |
| validate(isSelected, noCascade) | 校验数据记录是否有效 | `isSelect` - 设为 `true` 时，校验选中的记录 `noCascade` - 为 true 时，不校验级联数据 | Promise&lt;boolean&gt; |
| getField(fieldName) | 根据字段名获取字段 | `fieldName` - 字段名 | Field |
| addField(fieldName, fieldProps) | 增加新字段 | `fieldName` - 字段名，`fieldProps` - 字段属性 | Field |
| toJSONData(isSelected, noCascade) | 转换成用于提交的 json 数据 | `isSelect` - 设为 `true` 时，只转换选中记录 `noCascade` - 为 true 时，不转换级联数据 | object[] |
| toData() | 转换成普通数据，不包含删除的数据 |  | object[] |
| bind(ds, name) | 绑定头 DataSet | `ds` - 头 DataSet 对象或 id `name` - 绑定名 |  |
| setQueryParameter(para, value) | 设置查询参数 | `para` - 参数名 `value` - 参数值 |  |
| loadData(data, total) | 加载数据 | `data` - 数据数组 `total` - 总数，可选，用于分页 |  |

### DataSet Events

| 事件名 | 说明 | 钩子参数 | 参数说明 |
| --- | --- | --- | --- |
| update | 值更新事件 | ({ dataSet, record, name, value, oldValue }) =&gt; void | `dataSet` - 数据集 `record` - 更新的记录 `name` - 更新的字段 `value` - 新值 `oldValue` - 旧值 |
| query | 查询事件，返回值为 false 将阻止查询 | ({ dataSet, params, data }) =&gt; boolean | `dataSet` - 数据集 `params` - 查询参数 `data` - 查询参数 |
| beforeLoad | 数据加载前的事件， 用于处理请求数据 | ({ dataSet, data }) =&gt; data | `dataSet` - 数据集 `data` - 请求数据 |
| load | 数据加载完后事件 | ({ dataSet }) =&gt; void | `dataSet` - 数据集 |
| loadFailed | 数据加载失败事件 | ({ dataSet }) =&gt; void | `dataSet` - 数据集 |
| submit | 提交事件，返回值为 false 将阻止提交 | ({ dataSet, data }) =&gt; boolean | `dataSet` - 数据集 `data` - json 数据 |
| submitSuccess | 提交成功事件 | ({ dataSet, data }) =&gt; void | `dataSet` - 数据集 `data` - 响应数据 |
| submitFailed | 提交失败事件 | ({ dataSet }) =&gt; void | `dataSet` - 数据集 |
| select | 选择记录事件 | ({ dataSet, record, previous }) =&gt; void | `dataSet` - 数据集 `record` - 选择的记录 `previous` - 之前选择的记录，单选模式下有效 |
| unSelect | 撤销选择记录事件 | ({ dataSet, record }) =&gt; void | `dataSet` - 数据集 `record` - 撤销选择的记录 |
| selectAll | 全选记录事件 | ({ dataSet }) =&gt; void | `dataSet` - 数据集 |
| unSelectAll | 撤销全选记录事件 | ({ dataSet }) =&gt; void | `dataSet` - 数据集 |
| indexChange | 当前记录变更事件 | ({ dataSet, record, previous }) =&gt; void | `dataSet` - 数据集 `record` - 新当前记录 `previous` - 旧当前记录 |
| fieldChange | 字段属性变更事件 | ({ dataSet, record, name, propsName, value, oldValue }) =&gt; void | `dataSet` - 数据集 `record` - 字段所属记录，dataSet 的字段无 record `name` - 字段名 `propsName` - 属性名 `value` - 新值 `oldValue` - 旧值 |
| create | 记录创建事件 | ({ dataSet, record }) =&gt; void | `dataSet` - 数据集 `record` - 创建的记录 |
| export | 导出事件，返回值为 false 将阻止导出 | ({ dataSet, params, data }) =&gt; boolean | `dataSet` - 数据集 `params` - 查询参数 `data` - 查询参数 |
| beforeDelete | 数据删除前的事件， 返回值为 false 将阻止删除 | ({ dataSet, records }) =&gt; boolean | `dataSet` - 数据集 `records` - 记录集 |

### Record Values

| 名称           | 说明                                            | 类型                      |
| -------------- | ----------------------------------------------- | ------------------------- |
| id             | 唯一 ID，自增长的数字                           | number                    |
| key            | 唯一键，主键字段或唯一索引键字段的值，默认同 id | string \| number          |
| status         | 状态， 可选值 `add` `update` `delete` `sync`    | observable&lt;string&gt;  |
| selectable     | 可选                                            | observable&lt;boolean&gt; |
| isSelected     | 是否选中                                        | observable&lt;boolean&gt; |
| isCurrent      | 是否当前记录                                    | observable&lt;boolean&gt; |
| children       | 树形子数据集                                    | Record[]\| undefined      |
| parent         | 树形父数据                                      | Record\| undefined        |
| previousRecord | 树形中前一条数据                                | Record\| undefined        |
| nextRecord     | 树形中后一条数据                                | Record\| undefined        |
| level          | 树形层级                                        | number                    |
| dirty          | 数据是否发生变更                                | boolean                   |
| cascadeParent  | 级联父数据                                      | Record\| undefined        |
| index          | 在数据源中的索引                                | number                    |

### Record Methods

| 名称 | 说明 | 参数 | 返回值 |
| --- | --- | --- | --- |
| get(fieldName) | 根据字段名获取字段值。注意：禁止通过 record.data\[fieldName\]的方式获取字段值。 | `fieldName` - 字段名 | any |
| getPristineValue(fieldName) | 根据字段名获取字段的原始值。 | `fieldName` - 字段名 | any |
| set(fieldName, value) | 给指定字段赋值 | `fieldName` - 字段名或者键值对对象；`value` - 值 |  |
| toJSONData(noCascade, isCascadeSelect) | 转换成用于提交的 json 数据 | `noCascade` - 为 true 时，不转换级联数据 `isCascadeSelect` - 只转换级联选中的记录 | object |
| toData() | 转换成普通数据 |  | object |
| validate(all, noCascade) | 校验记录 | `all` - 校验所有字段，默认为 false，只校验修改或新增字段 `noCascade` - 为 true 时，不校验级联数据 | Promise&lt;boolean&gt; |
| getCascadeRecords(childName) | 根据级联名获取子级联数据 | `childName` - 级联名 | Record[] |
| getField(fieldName) | 根据字段名获取字段 z | `fieldName` - 字段名 | Field |
| clone() | 克隆记录，自动剔除主键值 |  | Record |
| ready() | 判断记录是否准备就绪 |  | Promise |
| reset() | 重置更改 |  |  |
| save() | 保存当前数据至缓存 |  |  |
| restore() | 从缓存恢复保存的数据 |  |  |
| clear() | 清除所有数据 |  |  |

### Field Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| name | 字段名 | string |  |
| type | 字段类型，可选值：`boolean` `number` `string` `date` `dateTime` `time` `week` `month` `year` `email` `url` `intl` `object` | string | string |
| order | 排序类型，只支持单 field 排序， 如果多个 field 设置了 order，取第一个有 order 的 field，可选值：`asc` `desc` | string |  |
| label | 字段标签 | string |  |
| format | 字符串类型和日期类型字段值格式化。 字符串类型格式化可选值：'uppercase' 'lowercase' 'capitalize' | string |  |
| pattern | 正则校验 | string \| RegExp |  |
| maxLength | 最大长度 | number |  |
| minLength | 最小长度 | number |  |
| max | 最大值。 fieldName 指向当前记录的 fieldName 值作为最大值。 | number \| MomentInput \| fieldName |  |
| min | 最小值。 fieldName 指向当前记录的 fieldName 值作为最小值。 | number \| MomentInput \| fieldName |  |
| step | 步距 | number |  |
| validator | 校验器，当返回值为 false 或 涵盖错误信息的字符串，则为校验失败 | (value, name, record) =&gt; boolean \| string \| undefined |  |
| required | 是否必选 | boolean | false |
| readOnly | 是否只读 | boolean | false |
| textField | 值列表的文本字段 | string | meaning |
| valueField | 值列表的值字段 | string | value |
| trueValue | 类型为 boolean 时，true 对应的值 | boolean\|string\|number | true |
| falseValue | 类型为 boolean 时，false 对应的值 | boolean\|string\|number | false |
| options | 下拉框组件的菜单数据集 | DataSet |  |
| group | 是否分组，如果是 number，则为分组的顺序(暂无实装) | boolean\|number |  |
| defaultValue | 默认值 | any |  |
| multiple | 是否为值数组。 当为字符串时，作为数据分隔符，查询时会将字符串分割成数组，提交时会将数组拼接成字符串 | boolean\| string | false |
| range | 是否为范围值。 当为 true 时，则值为\[startValue, endValue\]；当为数组时，例如\['start', 'end'\]时，则值为{ start: startValue, end: endValue } | boolean\| \[string, string\] | false |
| unique | 唯一索引或联合唯一索引组名。multiple 和 range 字段不适用。当 column 的 editor 设为 true 时，编辑器只会在新增的记录显示，如果要对已有数据进行编辑，请自定义 editor | boolean\| string | false |
| lovCode | LOV 配置代码 | string |  |
| lovPara | LOV 查询参数对象 | object |  |
| lookupCode | 值列表代码 | string |  |
| lookupUrl | 值列表请求地址 | string \| (code) => string |  |
| lovDefineUrl | lov 配置请求地址 | string \| (code) => string |  |
| lovQueryUrl | lov 查询请求地址 | string \| (code, config) => string |  |
| lookupAxiosConfig | 值列表请求配置或返回配置的钩子，详见[AxiosRequestConfig](#AxiosRequestConfig) | AxiosRequestConfig\| ({ dataSet, record, params, lookupCode }) => AxiosRequestConfig |  |
| lovDefineAxiosConfig | lov 配置的请求配置或返回配置的钩子，优先级高于 lovDefineUrl，详见[AxiosRequestConfig](#AxiosRequestConfig) | AxiosRequestConfig\| (code) => AxiosRequestConfig |  |
| lovQueryAxiosConfig | lov 查询的请求配置或返回配置的钩子，优先级高于 lovQueryUrl，详见[AxiosRequestConfig](#AxiosRequestConfig) | AxiosRequestConfig\| (code, config, { dataSet, params, data }) => AxiosRequestConfig |  |
| bind | 内部字段别名绑定 | string |  |
| dynamicProps | 动态属性钩子 | ({ dataSet, record, name }) => object |  |
| cascadeMap | 快码和 LOV 查询时的级联参数映射。 例如：cascadeMap: { parentCodeValue: 'city' }，其中'city'是当前所在数据源的其他字段名，parentCodeValue 是快码和 LOV 的查询参数 | object |  |
| currency | 货币代码，详见[Current currency & funds code list.](https://www.currency-iso.org/en/home/tables/table-a1.html) | string |  |
| ignore | 忽略提交, 可选值: `always` - 总是忽略 `clean` - 值未变化时忽略 `never` - 从不忽略 | string | `never` |
| transformRequest | 在发送请求之前对数据进行处理 | (value: any) => any |  |
| transformResponse | 在获得响应之后对数据进行处理 | (value: any) => any |  |
| trim | 字符串值是否去掉首尾空格，可选值: `both` `left` `right` `none` | string | `both` |
| defaultValidationMessages | 默认校验信息，详见[ValidationMessages](/components/configure/#ValidationMessages) | ValidationMessages |  |

### Field Values

| 名称     | 说明     | 类型                      |
| -------- | -------- | ------------------------- |
| name     | 字段名   | readonly string           |
| type     | 类型     | observable&lt;string&gt;  |
| required | 是否必选 | observable&lt;boolean&gt; |
| readOnly | 是否只读 | observable&lt;boolean&gt; |

### Field Methods

| 名称 | 说明 | 参数 |
| --- | --- | --- |
| get(propsName) | 根据属性名获取属性值 | `propsName` - 属性名 |
| set(propsName, value) | 设置属性值 | `propsName` - 属性名；`value` - 属性值 |
| reset() | 重置设置的属性 |  |
| checkValidity() | 校验字段值 |  |
| setLovPara(para, value) | 设置 Lov 的查询参数 | `para` - 参数名；`value` - 参数值 |
| getValue() | 获取当前记录的本字段值 | `lookupValue` - lookup 值 |
| getText(lookupValue) | 根据 lookup 值获取 lookup 含义 | `lookupValue` - lookup 值，默认本字段值 |
| getLookupData(lookupValue) | 根据 lookup 值获取 lookup 对象 | `lookupValue` - lookup 值，默认本字段值 |
| isValid() | 是否校验通过 |  |
| getValidationMessage() | 获取校验信息 |  |

### Transport

| 属性 | 说明 | 类型 |
| --- | --- | --- |
| create | 新建请求的 axios 配置或 url 字符串 | AxiosRequestConfig \| ({ data, params, dataSet }) => AxiosRequestConfig \| string |
| read | 查询请求的 axios 配置或 url 字符串 | AxiosRequestConfig \| ({ data, params, dataSet }) => AxiosRequestConfig \| string |
| update | 更新请求的 axios 配置或 url 字符串 | AxiosRequestConfig \| ({ data, params, dataSet }) => AxiosRequestConfig \| string |
| destroy | 删除请求的 axios 配置或 url 字符串 | AxiosRequestConfig \| ({ data, params, dataSet }) => AxiosRequestConfig \| string |
| validate | 唯一性校验请求的 axios 配置或 url 字符串 | AxiosRequestConfig \| ({ data, params, dataSet }) => AxiosRequestConfig \| string |
| submit | create, update, destroy 的默认配置或 url 字符串 | AxiosRequestConfig \| ({ data, params, dataSet }) => AxiosRequestConfig \| string |
| tls | 多语言数据请求的 axios 配置或 url 字符串 | AxiosRequestConfig \| ({ data, params, dataSet }) => AxiosRequestConfig \| string |
| adapter | CRUD 配置适配器 | (config: AxiosRequestConfig, type: string) => AxiosRequestConfig |

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
