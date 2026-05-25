---
title: DataSet
abstract: true
---

DataSet.

**Notes**

> It is recommended to read the Getting Started tutorial when first using this component library. See [Introduction](/en/tutorials/introduction).

## API

### DataSet Props

| Property | Description | Type | Default | Version |
| --- | --- | --- | --- | --- |
| [name](/en/datasetapi/dataset-props/name) | Backend DS name; automatically generates the conventional submitUrl, queryUrl, tlsUrl, validateUrl | Array&lt;string&gt; |  |    |
| [data](/en/datasetapi/dataset-props/data) | Initial data | Array&lt;object&gt; |  |  |
| autoCount | Notify backend to automatically count totals during query for pagination. When false, query parameters include count=N by default; names and values configurable via global generatePageQuery. When the query result’s countKey value is Y, a counting request is sent to the same read URL with onlyCount=Y; both names and values configurable via generatePageQuery. | boolean | [autoCount](/en/procmp/configure/configure) | 1.5.5 |
| autoQuery | Automatically query after initialization | boolean | false |  |
| autoQueryAfterSubmit | Automatically query when response data after successful submit doesn’t meet write-back conditions. Note: write-back means the response contains submitted data; data are grouped by status and written back sequentially. For accurate write-back, the response should contain the submitted \_\_id field value. | boolean | true | |
| [autoCreate](/en/datasetapi/dataset-props/auto-create) | On initialization, if there are no records and autoQuery is false, create a record automatically | boolean | false |  |
| autoLocateFirst | Automatically locate the first record after data load | boolean | true |   |
| autoLocateAfterCreate | Automatically locate the newly created record | boolean | true | |
| autoLocateAfterRemove | Automatically locate another record after the current data is deleted | boolean | true | |
| validateBeforeQuery | Whether to validate query fields or the query dataset when querying | boolean | true | 1.0.0  |
| [selection](/en/tutorials/table-select-record) | Selection mode; options: false 'multiple' 'single' | boolean \| string | multiple |    |
| selectionStrategy | Tree selection strategy: SHOW\_ALL \| SHOW\_CHILD \| SHOW\_PARENT | string | 'SHOW_ALL' | 1.4.2 |
| modifiedCheck | Before paged query, whether to warn when records have been modified | boolean | true |   |
| modifiedCheckMessage | Warning message shown before paged query if records have been modified | ReactNode \| ModalProps |  |    |
| pageSize | Page size | number | 10 |   |
| strictPageSize | Strict page size; the frontend truncates data exceeding pageSize | boolean | true |  1.5.1  |
| [paging](/en/procmp/data-display/table#Tree%20data%20asynchronous%20paging) | Whether to paginate. server mode is mainly for Table’s Tree mode; total is the number of root nodes, and index positioning is based on root nodes. In server mode ensure idField and parentField both exist (root node empty or undefined); otherwise behavior matches previous versions. noCount enables paging without total count. | boolean \| 'server'\| 'noCount'| true |   |
| dataKey | Key in returned JSON for the data. When null, the entire JSON is used as data; if JSON is not an array it is wrapped as the first element of a new array | string \| null |  [dataKey](/en/procmp/configure/configure) | |
| totalKey | Key in returned JSON for the total count | string | [totalKey](/en/procmp/configure/configure) | |
| countKey | Key in returned JSON indicating whether asynchronous counting is needed | string | [countKey](/en/procmp/configure/configure) | 1.5.5 |
| [queryDataSet](/en/datasetapi/dataset-props/query-data-set) | Query condition data source | DataSet |  |  |
| queryUrl | Query request URL. When name is set, defaults to /dataset/{name}/queries | string |  |    |
| queryParameter | Initial parameters for the query request | object |  | |
| submitUrl | Record submit request URL. When name is set, defaults to /dataset/{name}/mutations | string |  | |
| tlsUrl | Multi-language query request URL. When name is set, defaults to /dataset/{name}/languages | string |  | |
| validateUrl | Remote validation request URL. When name is set, defaults to /dataset/{name}/validate | string |  |   |
| exportUrl | Export request URL. When name is set, defaults to /dataset/{name}/export | string |  |   |
| [transport](/en/tutorials/dataSet-more#transport) | Custom CRUD request configuration; see [Transport](#transport) and [AxiosRequestConfig](/en/procmp/configure/configure/#axiosrequestconfig) | Transport |  |    |
| feedback | Feedback configuration for query and submit; see [Feedback](#feedback) | Feedback |  |    |
| [children](/en/datasetapi/dataset-props/children) | Cascade line datasets, e.g., { name_1: dataSet1, name_2: dataSet2 } | { name: DataSet } |  | |
| primaryKey | Primary key field name, typically used as the query field for cascade row tables | string |  | |
| [idField](/en/datasetapi/dataset-props/id-field) | Tree data current node id field name, used with parentField. For flat data; change node hierarchy by modifying values of idField and parentField | string |  | |
| [parentField](/en/datasetapi/dataset-props/id-field) | Tree data current parent node id field name, used with idField. For flat data; change node hierarchy by modifying values of idField and parentField | string |  | |
| [childrenField](/en/datasetapi/dataset-props/id-field) | Tree data child dataset field name. To load child nodes asynchronously, set idField and parentField or use appendData. For tree data; change hierarchy via record.parent and record.children | string |  | 1.4.5 |
| [expandField](/en/datasetapi/dataset-props/id-field) | Tree data field marking whether a node is expanded | string |  |  |
| [treeCheckStrictly](/en/datasetapi/dataset-props/id-field) | Whether tree node selection is controlled independently (parent-child selection states no longer linked) | boolean | | 1.5.3 |
| [checkField](/en/datasetapi/dataset-props/id-field) | Tree data field marking whether a node is selected; a checkbox is shown after the expand button | string |  |  |
| fields | Field props array; see [Field Props](#field-props) | object\[\] |  |  |
| record | Record props; see [Record Props](#record-props) | object |  |
| [queryFields](/en/datasetapi/dataset-props/query-data-set) | Query field props array. Internally generates queryDataSet and has higher priority than queryDataSet; see [Field Props](#field-props) | object\[\] |  |  |
| cacheSelection | Cache selected records to retain selection when switching pages. Effective only when primaryKey is set or some field has unique | boolean | false |   |
| cacheModified | Cache modified records to retain changes when switching pages. Effective only when primaryKey is set or some field has unique | boolean | false | 1.5.0-beta.0 |
| axios | Override default axios | AxiosInstance |  |   |
| [dataToJSON](/en/datasetapi/dataset-props/data-to-json) | How data are converted to JSON; see [DataToJSON](#datatojson) | DataToJSON | dirty |   |
| [cascadeParams](/en/datasetapi/dataset-props/children) | Cascade query parameters | (record, primaryKey) => object | (record, primaryKey) => primaryKey ? record.get(primaryKey) : record.toData() |   |
| exportMode | Export mode: frontend export or backend export | client \| server | server |   |
| combineSort | Whether to enable component column sorting parameter passing; see Table API for frontend and backend sorting configuration | boolean | false | 1.4.2 |
| [forceValidate](/en/datasetapi/dataset-props/force-validate) | Always validate all data | boolean | false | 1.4.5 |
| [validationRules](/en/datasetapi/dataset-props/validation-rules) | Validation rules for the DataSet body; see [ValidationRule](#validationrule) | ValidationRule\[\] |  |  1.5.1  |
| customIntlFun | Customize internationalized text. lang is the current language; component and key correspond to library i18n key-value pairs; defaultIntl is the default text | ({ component, key, lang, defaultIntl }) => string |  | 1.6.7 |

### DataSet Values

| Name | Description | Type | Version |
| --- | --- | --- | --- |
| current | Get or set the current record | observable&lt;Record&gt; |   |
| currentPage | Current page number | readonly observable&lt;number&gt; |  |
| currentIndex | Current cursor index | observable&lt;number&gt; |  |
| totalCount | Total record count | observable&lt;number&gt; |    |
| totalPage | Total pages | readonly observable&lt;number&gt; |  |
| pageSize | Page size | observable&lt;number&gt; |  |
| paging | Whether paginated | observable&lt;boolean&gt; |   |
| counting | Whether performing asynchronous counting query | observable&lt;boolean&gt; | 1.5.5 |
| [status](/en/datasetapi/dataset-values/status) | Status: loading \| submitting \| ready | observable&lt;string&gt; |  |
| selection | Selection mode; options: false 'multiple' 'single' | observable&lt;string\|boolean&gt; |   |
| selectionStrategy | Tree selection strategy: SHOW_ALL \| SHOW_CHILD \| SHOW_PARENT | observable&lt;string[]&gt; |   |
| [records](/en/datasetapi/dataset-values/records) | All records | observable&lt;Record[]&gt; | |
| [fields](/en/datasetapi/dataset-values/fields) | All fields | ObservableMap<string, Field> | 1.5.0-beta.0 |
| all | All records, including cached records | observable&lt;Record[]&gt; | |
| data | Data, excluding records in deleted status | observable&lt;Record[]&gt; |   |
| created | Newly created data | readonly observable&lt;Record[]&gt; |  |
| updated | Updated data | readonly observable&lt;Record[]&gt; |  |
| destroyed | Temporarily destroyed data | readonly observable&lt;Record[]&gt; |    |
| selected | Selected records, including cached selected records when isAllPageSelection is false | readonly observable&lt;Record[]&gt; |    |
| unSelected | Unselected records, including cached unselected records when isAllPageSelection is true | readonly observable&lt;Record[]&gt; |   |
| currentSelected | Selected records of the current page | readonly observable&lt;Record[]&gt; | 1.4.0 |
| currentUnSelected | Unselected records of the current page | readonly observable&lt;Record[]&gt; | 1.4.0 |
| cachedSelected | Cached selected records when isAllPageSelection is false, or cached unselected records when isAllPageSelection is true | readonly observable&lt;Record[]&gt; |    |
| cachedModified | Cached modified records | observable&lt;Record[]&gt; | 1.5.0-beta.0 |
| cachedRecords | Cached records, including cachedSelected and cachedModified | observable&lt;Record[]&gt; | 1.5.0-beta.0 |
| treeSelected | Tree selected records; affected by selectionStrategy | readonly observable&lt;Record[]&gt; | 1.4.2  |
| length | Data size | readonly observable&lt;number&gt; | |
| queryDataSet | Query dataset | observable&lt;DataSet&gt; |   |
| parent | Cascade head dataset | readonly observable&lt;DataSet&gt; |  |
| children | All cascade line datasets | readonly \[key:string\]: DataSet} | |
| dirty | Records whose status is not 'sync' and records with dirty=true | readonly observable&lt;boolean&gt;} |   |
| isAllPageSelection | Whether in cross-page select-all state; use with unSelected to submit cross-page selection; requires backend support | readonly observable&lt;boolean&gt;} | 1.4.0 |
| sortedTreeData | Flattened tree data after sorting | Record[] | 1.6.7 |

### DataSet Methods

| Name | Description | Property | Return Type | Version |
| --- | --- | --- | --- | --- |
| ready() | Check whether the data source is ready |  | Promise |   |
| query(page, params, cache) | Query | `page`&lt;optional,default:1&gt; - target page `params`&lt;optional&gt; - temporary query parameters  `cache`&lt;optional&gt;(1.5.0-beta.0) - whether to retain cached modified records  | Promise&lt;any&gt; | |
| queryMore(page, params) | Query more while keeping existing data | page&lt;optional,default:1&gt; - target page params&lt;optional&gt; - temporary query parameters  | Promise&lt;any&gt; | 1.1.0 |
| [submit()](/en/datasetapi/dataset-methods/submit) | Validate added/deleted/updated records and submit remotely. submit throws request exceptions; handle them via promise.catch or try-await-catch. |  | Promise&lt;any&gt; false - validation failed; undefined - no data to submit or submit configuration incomplete (e.g., missing submitUrl) | |
| submitRecord(record, strictPageSize = false) | Validate and submit a single record remotely. submit throws request exceptions; handle them via promise.catch or try-await-catch. |  | Promise&lt;any&gt; `false` - validation failed; `undefined` - no data to submit or submit configuration incomplete (e.g., missing submitUrl) | 1.6.5 |
| forceSubmit() | Force submit, bypassing validation | | Promise&lt;any&gt; undefined - no data to submit or submit configuration incomplete (e.g., missing submitUrl) | 1.5.2 |
| [reset()](/en/datasetapi/dataset-methods/reset) | Reset changes and clear validation state |  |  |    |
| locate(index) | Locate to the specified record. If paging is true and server, performs remote query. In server mode, indices refer to root nodes | index - record index | Promise&lt;Record&gt; |  |
| page(page) | Locate to the specified page. If paging is true and server, performs remote query | page - page number | Promise&lt;any&gt; |    |
| first() | Locate to the first record. If paging is true and server, performs remote query (first root node) |  | Promise&lt;Record&gt; |  |
| last() | Locate to the last record. If paging is true and server, performs remote query (last root node)  | | Promise&lt;Record&gt; |   |
| pre() | Locate to the previous record. If paging is true and server, performs remote query (previous root node of current root) |  | Promise&lt;Record&gt; |    |
| next() | Locate to the next record. If paging is true and server, performs remote query (next root node of current root) |  | Promise&lt;Record&gt; |   |
| firstPage() | Locate to the first page. If paging is true and server, performs remote query |  | Promise&lt;any&gt; |  |
| lastPage() | Locate to the last page. If paging is true and server, performs remote query |  | Promise&lt;any&gt; | |
| prePage() | Locate to the previous page. If paging is true and server, performs remote query |  | Promise&lt;any&gt; |    |
| nextPage() | Locate to the next page. If paging is true and server, performs remote query |  | Promise&lt;any&gt; |   |
| [create(data, index)](/en/datasetapi/dataset-methods/create) | Create a record | data - record data object; index&lt;optional,default:dataSet.records.length&gt; - index position | Record | |
| [delete(records, confirmMessage: ReactNode \| ModalProps)](/en/datasetapi/dataset-methods/delete) | Delete records immediately | records - records or record group to delete; confirmMessage - custom prompt or modal props; when false, delete without confirmation |  |  |
| [remove(records, forceRemove)](/en/datasetapi/dataset-methods/delete) | Temporarily delete records | records - records or record group to delete; forceRemove(1.5.1) - whether to force delete |  |
| [deleteAll(confirmMessage: ReactNode \| ModalProps)](/en/datasetapi/dataset-methods/delete) | Delete all records immediately | confirmMessage - custom prompt or modal props; when false, delete without confirmation |  |   |
| [removeAll(forceRemove)](/en/datasetapi/dataset-methods/delete) | Temporarily delete all records | forceRemove(1.5.1) - whether to force delete |  |    |
| push(...records) | Insert several records at the top of the stack | records - list of records to insert | number | |
| unshift(...records) | Insert several records at the bottom of the stack | records - list of records to insert | number |  |
| pop() | Get a record from the top of the stack |  | Record |  |
| shift() | Get a record from the bottom of the stack |  | Record |    |
| splice(from, deleteCount, ...records) | Delete records at a specified index and optionally insert new records | from&lt;optional,default:0&gt; - start index; deleteCount&lt;optional,default:0&gt; - number to delete; records - new records to insert | Record[] |  |
| slice(start, end) | Take a range of records by index without changing the original stack | start&lt;optional,default:0&gt; - start index; end&lt;optional,default:stack length&gt; - end index | Record[] | |
| find(fn) | Find and return the first record by predicate function | fn - predicate (record, index, array) =&gt; boolean | Record |  |
| findIndex(fn) | Find the index of a record by predicate function | fn - predicate (record, index, array) =&gt; boolean | number |   |
| forEach(fn, thisArg) | Iterate using a function | fn - iterator (record, index, array) =&gt; void |  |   |
| map(fn, thisArg) | Iterate and output a new array | fn - mapper (record, index, array) =&gt; any | any[] |   |
| some(fn, thisArg) | Iterate; return true if any predicate returns true | fn - predicate (record, index, array) =&gt; boolean | boolean |   |
| every(fn, thisArg) | Iterate; return false if any predicate returns false | fn - predicate (record, index, array) =&gt; boolean | boolean |    |
| filter(fn, thisArg) | Filter and return a record set | fn - filter (record, index, array) =&gt; boolean | Record[] | |
| reduce(fn, initialValue) | Call a callback for all elements. The callback’s return value accumulates and is provided as an argument on the next call | fn - reducer (previousValue, record, index, array) =&gt; value; initialValue - initial value | typeof initialValue |   |
| reduceRight(fn, initialValue) | Call the specified callback for all elements in descending order. The callback’s return value accumulates and is provided as an argument on the next call | fn - reducer (previousValue, record, index, array) =&gt; value; initialValue - initial value | typeof initialValue |    |
| indexOf(record, fromIndex) | Get the index of a record | record - record; fromIndex&lt;optional&gt; - start index | number |  |
| reverse() | Reverse the order of records |  | Record[] |    |
| select(recordOrIndex) | Select a record | recordOrIndex - record object or index |  |    |
| unSelect(recordOrIndex) | Unselect a record | recordOrIndex - record object or index |  |  |
| selectAll() | Select all records of the current page |  |  |  |
| unSelectAll() | Unselect all records of the current page |  |  |    |
| batchSelect(recordOrId) | Batch select records | recordOrId - record object or set of record ids |  | |
| batchUnSelect(recordOrId) | Cancel batch selection of records | recordOrId - record object or set of record ids | |    |
| treeSelect(record) | Select a record and its children | record - record object |  | 1.4.2   |
| treeUnSelect(record) | Unselect a record and its children | record - record object |  |  |
| clearCachedSelected() | Clear cached selected records |  |  |    |
| clearCachedModified() | Clear cached modified records |  |  | 1.5.0-beta.0 |
| clearCachedRecords() | Clear all cached records |  |  | 1.5.0-beta.0 |
| get(index) | Get the record at the specified index | index - record index | Record |   |
| getFromTree(index) | Get the root record at the specified index from tree data | index - record index | Record | |
| validate() | Validate whether data records are valid |  | Promise&lt;boolean&gt; |   |
| [getField(fieldName)](/en/datasetapi/dataset-methods/get-field) | Get a field by field name | fieldName - field name | Field | |
| [addField(fieldName, fieldProps)](/en/datasetapi/dataset-methods/add-field) | Add a new field | fieldName - field name; fieldProps - field props | Field |    |
| toJSONData() | Convert to JSON data for submission |  | object[] | |
| toData() | Convert to plain data, excluding deleted data |  | object[] |   |
| bind(ds, name) | Bind head DataSet | ds - head DataSet object or id; name - binding name |  |    |
| [setQueryParameter(para, value)](/en/datasetapi/dataset-methods/set-query-parameter) | Set query parameter | para - parameter name; value - parameter value |  | |
| [getQueryParameter(para)](/en/datasetapi/dataset-methods/set-query-parameter) | Get query parameter | para - parameter name |  | 1.4.0 |
| [loadData(data, total, cache)](/en/datasetapi/dataset-methods/load-data) | Load data | `data` - data array; `total` - total count, optional, used for paging; `cache`(1.5.0-beat.0) - whether to retain cached modified records | | |
| [appendData(data, parentRecord, index)](/en/datasetapi/dataset-methods/load-data) | Append data. When setting idField and parentField, index is the positioning in the parent; when setting childrenField and passing in parentRecord, index is the positioning in the parent. | `data` - data array; `parentRecord` - parent node, optional, used in childrenField tree data mode; `index` - Data insertion position, optional(1.6.8) | | |
| [setState(key, value)](/en/datasetapi/other/state) | Set a custom state value | key - key name or key-value object; value - value |  | 1.3.1 |
| [getState(key)](/en/datasetapi/other/state) | Get a custom state value | key - key name |  |  1.3.1  |
| modifiedCheck(message) | Change check | message - same as modifiedCheckMessage; higher priority than modifiedCheckMessage | | 1.3.1 |
| setAllPageSelection(enabled) | Toggle cross-page select-all | enabled - whether enabled |  | 1.4.0 |
| getValidationErrors() | Get validation error information |  |  | 1.4.0 |
| generateOrderQueryString() | Get sorting information. When combineSort is true, returns a string array like \['age,desc', 'name,asc'\]; otherwise returns an object |  | { sortname?: string; sortorder?: string; } \| string[] | 1.6.4 |

### DataSet Events

| Event | Description | Hook Parameters | Parameter Description | Async | Version  |
| --- | --- | --- | --- | --- | --- |
| update | Value update event | ({ dataSet, record, name, value, oldValue }) =&gt; void | dataSet - dataset; record - updated record; name - field; value - new value; oldValue - old value | Yes |  |
| query | Query event; returning false prevents the query | ({ dataSet, params, data }) =&gt; boolean | dataSet - dataset; params - query params; data - query data | Yes | |
| beforeLoad | Event before data load; used to process request data | ({ dataSet, data }) =&gt; void | dataSet - dataset; data - request data | Yes |   |
| load | Event after data load | ({ dataSet }) =&gt; void | dataSet - dataset | Yes |    |
| beforeAppend | Event before data append; used to process request data | ({ dataSet, data }) =&gt; void | dataSet - dataset; data - request data | Yes | |
| append | Event after data append | ({ dataSet }) =&gt; void | dataSet - dataset | Yes | 1.1.0 |
| loadFailed | Data load failed event | ({ dataSet }) =&gt; void | dataSet - dataset | Yes |  |
| submit | Submit event; returning false prevents submit | ({ dataSet, data }) =&gt; boolean | dataSet - dataset; data - JSON data | Yes |   |
| submitSuccess | Submit succeeded event | ({ dataSet, data }) =&gt; void | dataSet - dataset; data - response data | Yes |   |
| submitFailed | Submit failed event | ({ dataSet }) =&gt; void | dataSet - dataset | Yes |    |
| select | Select record event | ({ dataSet, record, previous }) =&gt; void | dataSet - dataset; record - selected record; previous - previous selected record (single-select) | Yes |  |
| unSelect | Unselect record event | ({ dataSet, record }) =&gt; void | dataSet - dataset; record - unselected record | Yes |  |
| selectAll | &lt;Deprecated&gt; Select all records event | ({ dataSet }) =&gt; void | dataSet - dataset | Yes | |
| unSelectAll | &lt;Deprecated&gt; Unselect all records event | ({ dataSet }) =&gt; void | dataSet - dataset | Yes |   |
| batchSelect | Batch select records event; triggered by select, selectAll, batchSelect and treeSelect methods | ({ dataSet, records }) =&gt; void | dataSet - dataset; records - selected record set | Yes | |
| batchUnSelect | Batch unselect records event; triggered by unSelect, unSelectAll, batchUnSelect and treeUnSelect methods | ({ dataSet, records }) =&gt; void | dataSet - dataset; records - selected record set | Yes | 1.4.2  |
| selectAllPage | Cross-page select-all event | ({ dataSet }) =&gt; void | dataSet - dataset  | Yes | 1.5.3 |
| unSelectAllPage | Cancel cross-page select-all event | ({ dataSet }) =&gt; void | dataSet - dataset | Yes | 1.5.3 |
| indexChange | Current record change event | ({ dataSet, record, previous }) =&gt; void | dataSet - dataset; record - new current record; previous - old current record | Yes | |
| fieldChange | Field property change event | ({ dataSet, record, name, propsName, value, oldValue }) =&gt; void | dataSet - dataset; record - record of field (DataSet fields have no record); name - field name; propsName - property name; value - new value; oldValue - old value | Yes |    |
| create | Record create event | ({ dataSet, record }) =&gt; void | dataSet - dataset; record - created record | Yes |    |
| remove | Record remove event | ({ dataSet, records }) =&gt; void | dataSet - dataset; records - removed records | Yes |  |
| export | Export event; returning false prevents export | ({ dataSet, params, data }) =&gt; boolean | dataSet - dataset; params - query params; data - query data | Yes |    |
| beforeRemove | Event before temporary deletion; returning false prevents temporary deletion | ({ dataSet, records }) =&gt; boolean | dataSet - dataset; records - record set | No | |
| beforeDelete | Event before deletion; returning false prevents deletion | ({ dataSet, records }) =&gt; boolean | dataSet - dataset; records - record set | Yes | 1.0.0 |
| reset | Data reset event | ({ dataSet, records }) =&gt; void | dataSet - dataset; records - record set | Yes |   |
| validate | Validation event for DS data; different from validateSelf | ({ dataSet, result }) =&gt; void | dataSet - dataset; result - validation results | Yes |  |
| validateSelf | Validate DataSet event; validation only targets the DS body; see ValidationRule | ({ dataSet, result }) =&gt; void | `dataSet` - dataset; `result` - validation results | Yes |  1.5.1  |


### Record Props

> Properties added in version 1.5.0. More examples: [Form](/en/procmp/data-entry/form#禁用) & [Table](/en/procmp/data-display/table#功能总和).

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| [disabled](/en/datasetapi/record-props/disabled) | Whether disabled | boolean | false |
| selectable | Whether selectable | boolean | true |
| defaultSelected | Whether selected by default | boolean | false |
| defaultExpanded | Whether expanded by default | boolean | false |
| [dynamicProps](/en/datasetapi/other/dynamic-props) | Dynamic props object: key-value pairs of record props and hooks returning those values | { recordProp: (record) => value } |  |

### Record Values

> Details: [Record](/en/tutorials/dataSet-more#record-%E5%AF%B9%E8%B1%A1)

| Name           | Description                                     | Type                      |
| -------------- | ----------------------------------------------- | ------------------------- |
| id             | Unique ID, auto-increment number                | number                    |
| key            | Unique key; primary key field or unique index field value; defaults to id | string \| number          |
| status         | Status; options add \| update \| delete \| sync  | observable&lt;string&gt;  |
| disabled(1.5.0)       | Disabled                                        | observable&lt;boolean&gt; |
| selectable     | Selectable                                      | observable&lt;boolean&gt; |
| selectedTimestamp（1.5.3） | Selected timestamp; can be used for sorting | observable&lt;number&gt; |
| isSelected     | Whether selected                                 | observable&lt;boolean&gt; |
| isCurrent      | Whether current record                           | observable&lt;boolean&gt; |
| isExpanded | Whether tree node is expanded | observable&lt;boolean&gt; |
| children       | Tree child dataset                               | Record[] \| undefined      |
| parent         | Tree parent data                                 | Record \| undefined        |
| previousRecord | Previous record in tree                          | Record \| undefined        |
| nextRecord     | Next record in tree                              | Record \| undefined        |
| level          | Tree level                                       | number                    |
| dirty          | Whether data changed, including cascade data     | boolean                   |
| cascadeParent  | Cascade parent data                              | Record \| undefined        |
| index          | Index in data source                             | number                    |
| editing        | Editing state                                    | boolean                    |
| pending        | Pending state, including asynchronous loading of tree child data | boolean                    |

### Record Methods

> Details: [Record](/en/tutorials/dataSet-more#record-%E5%AF%B9%E8%B1%A1)

| Name | Description | Property | Return Type | Version|
| --- | --- | --- | --- | --- |
| get(fieldName) | Get a field value by name, or get an object mapping field names to values by passing an array. Note: do not access values via record.data\[fieldName\]. | fieldName - field name or array of field names | any |  |
| getPristineValue(fieldName) | Get the original value of a field by name | fieldName - field name | any | |
| [set(fieldName, value)](/en/datasetapi/record-methods/set) | Set a value to the specified field | fieldName - field name or key-value object; value - value |  |    |
| [init(fieldName, value)](/en/datasetapi/record-methods/set) | Initialize the specified field’s value; the field becomes pristine | fieldName - field name or key-value object; value - value |  |   |
| [setState(key, value)](/en/datasetapi/other/state) | Set a custom state value | key - key name or key-value object; value - value |  | |
| [getState(key)](/en/datasetapi/other/state) | Get a custom state value | key - key name |  |    |
| [toJSONData()](/en/datasetapi/dataset-props/data-to-json) | Convert to JSON data for submission; affected by the DataSet’s dataToJSON property |  | object |  |
| [toData()](/en/datasetapi/dataset-props/data-to-json) | Convert to plain data, including all cascade data. Note: do not use the returned data to get values; use the higher-performance get method instead | | object |    |
| validate(all, noCascade) | Validate a record | all - validate all fields (default false; validates only modified or new fields); noCascade - when true, do not validate cascade data | Promise&lt;boolean&gt; |    |
| getCascadeRecords(childName) | Get child cascade data by cascade name | childName - cascade name | Record[] |   |
| [getField(fieldName)](/en/datasetapi/dataset-methods/get-field) | Get a field by name. Note: since 1.5.0-beta.0 prefer dataSet.getField for performance; to get recordField properties use dsField.get(name, record) | `fieldName` - field name | Field |
| addField(fieldName, fieldProps) | Add a new field. Since 1.5.0-beta.0, if the field is not record-specific, prefer dataSet.addField | `fieldName` - field name; `fieldProps` - field props | Field |
| clone() | Clone a record, automatically removing the primary key value |  | Record |  |
| ready() | Check whether the record is ready |  | Promise | |
| [reset()](/en/datasetapi/dataset-methods/reset) | Reset changes |  |  |    |
| save() | Save current data to cache |  |  |   |
| restore() | Restore saved data from cache |  |  |  |
| clear() | Clear all data |  |  |    |
| getValidationErrors() | Get validation error information | | | 1.4.0   |

### Field Props

> Details: [Field](/en/tutorials/dataSet-more#fields)

| Property | Description | Type | Default | Version |
| --- | --- | --- | --- | --- |
| name | Field name | string |  |   |
| [type](/en/datasetapi/field-props/type) | Field type; options: boolean \| number \| string \| date \| dateTime \| time \| week \| month \| quarter \| year \| email \| url \| intl \| object \| attachment \| json \| bigNumber(1.5.1) | string | auto |  |
| order | Sort type; supports single-field sorting. If multiple fields set order, the first field with order is used. Options: asc \| desc | string |  |    |
| label | Field label | string \| ReactNode |  |    |
| labelWidth | Field label width | number |  |   |
| format | Format string and date field values. String options: 'uppercase' 'lowercase' 'capitalize' | string |  |    |
| [pattern](/en/datasetapi/other/validate) | Regular expression validation | string \| RegExp |  |    |
| [maxLength](/en/datasetapi/other/validate) | Maximum length | number |  |    |
| [minLength](/en/datasetapi/other/validate) | Minimum length | number |  |    |
| [max](/en/datasetapi/other/validate) | Maximum value. A fieldName points to the current record’s field value as the maximum | BigNumber.Value \| MomentInput \| fieldName | Infinity |  | |
| [min](/en/datasetapi/other/validate) | Minimum value. A fieldName points to the current record’s field value as the minimum | BigNumber.Value \| MomentInput \| fieldName | -Infinity |   | |
| maxExcl | Exclusive maximum value. A fieldName points to the current record’s field value as the maximum | BigNumber.Value \| MomentInput \| fieldName  | Infinity | 1.6.6 |
| minExcl | Exclusive minimum value. A fieldName points to the current record’s field value as the minimum | BigNumber.Value \| MomentInput \| fieldName  | -Infinity | 1.6.6 |
| [step](/en/datasetapi/field-props/precision) | Step | BigNumber.Value \| number \| { hour: number, minute: number, second: number } \| string |  | |
| nonStrictStep | Non-strict step: allows input not a multiple of step plus the minimum; also allows decimals when step is an integer   | boolean | false |    |
| [precision](/en/datasetapi/field-props/precision) | Decimal precision; truncated on submit | number |  | 1.3.0 |
| numberGrouping | Thousand separator grouping display | boolean | true | 1.3.0   |
| [formatterOptions](/en/datasetapi/field-props/precision) | Number and currency formatting options | FormatNumberFuncOptions: { lang?: string, options?: [Intl.NumberFormatOptions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat) } | | 1.5.1 |
| [validator](/en/datasetapi/other/validate) | Validator: validation fails when returning false or an error string | (value, name, record) =&gt; boolean \| string \| undefined |  |  |
| [required](/en/datasetapi/other/validate) | Whether required | boolean | false |   |
| readOnly | Whether read-only | boolean | false |   |
| disabled | Whether disabled | boolean | false |   |
| [textField](/en/datasetapi/field-props/text-field) | Text field of value list | string | meaning | |
| [valueField](/en/datasetapi/field-props/text-field) | Value field of value list | string | value |    |
| [trueValue](/en/datasetapi/field-props/true-value) | When type is boolean, value for true. When array, defaults to the first value; other values are compatible for display | boolean \|string \|number\|any[] | true | |
| [falseValue](/en/datasetapi/field-props/true-value) | When type is boolean, value for false. When array, defaults to the first value; other values are compatible for display | boolean \|string \|number\|any[] | false |   |
| options | Menu dataset of dropdown component | DataSet |  |   |
| [optionsProps](/en/datasetapi/field-props/options-props) | Dataset configuration for value-set components | DataSetProps \| (DataSetProps) => DataSetProps |  | |
| group | Whether grouped; if number, indicates group order | boolean \|number |  | |
| defaultValue | Default value | any |  |  |
| multiple | Whether the value is an array. When a string, used as a separator; query splits the string into an array; submit joins the array into a string | boolean \| string | false |  |
| [range](/en/datasetapi/field-props/range)  | Whether the value is a range. When true, value is \[startValue, endValue\]; when an array like \['start', 'end'\], value is { start: startValue, end: endValue } | boolean \| \[string, string\] | false |   |
| unique | Unique index or composite unique key group name. Not applicable to multiple and range fields. When a column’s editor is true, the editor only appears on new records; to edit existing data, customize the editor | boolean \| string | false |  |
| lovCode | LOV configuration code | string |  |  |
| lovPara | LOV or Lookup query parameter object | object |  |    |
| lookupCode | Lookup code | string |  | |
| lookupUrl | Lookup request URL | string \| (code) => string |  |  |
| lovDefineUrl | LOV configuration request URL | string \| (code) => string |  | |
| lovQueryUrl | LOV query request URL | string \| (code: string, lovConfig?: LovConfig, { dataSet, params, data, lovQueryDetail }) => string |  |   |
| lookupAxiosConfig | Lookup request config or hook; see [AxiosRequestConfig](/en/procmp/configure/configure#axiosrequestconfig). Defaults: url=lookupUrl, method=post | AxiosRequestConfig\| ({ dataSet, record, params, lookupCode }) => AxiosRequestConfig |  |  |
| lovDefineAxiosConfig | LOV configuration request config or hook; see [AxiosRequestConfig](/en/procmp/configure/configure#axiosrequestconfig). Defaults: url=lovDefineUrl, method=post | AxiosRequestConfig\| (code: string, field?: Field) => AxiosRequestConfig |  |  |
| lovDefineBatchAxiosConfig | Hook returning batch query config for LOV configuration; priority over global lovDefineBatchAxiosConfig. Performs batch queries based on returned url; see [AxiosRequestConfig](/components/configure/#AxiosRequestConfig). | (codes: string[]) => AxiosRequestConfig | - | 1.6.3 |
| lovQueryAxiosConfig | LOV query request config or hook; see [AxiosRequestConfig](/en/procmp/configure/configure#axiosrequestconfig). Defaults: url=lovQueryUrl, method=post | AxiosRequestConfig\| (code, config, { dataSet, params, data, lovQueryDetail }) => AxiosRequestConfig |  | |
| lookupBatchAxiosConfig | Hook returning batch lookup query config; priority over global lookupBatchAxiosConfig. Performs batch queries based on returned url; see [AxiosRequestConfig](/en/procmp/configure/configure#axiosrequestconfig). | (codes: string[]) => AxiosRequestConfig | - | 1.0.0 |
| bind | Internal field alias binding. The bound field’s type must be set for formatting, validation, etc. | string |  | |
| [dynamicProps](/en/datasetapi/other/dynamic-props) | [Dynamic props object](/en/tutorials/dataSet-more#dynamicprops). Key-value pairs of field props and hooks returning those values | { fieldProp: ({ dataSet, record, name }) => value } |  |  |
| [computedProps](/en/datasetapi/other/dynamic-props) | Computed props object. Same function and usage as dynamicProps, with mobx computed caching. Used for heavy computation scenarios to avoid repeated calculations and improve performance. Ensure dependent values are observable.  | { fieldProp: ({ dataSet, record, name }) => value } |  | 1.4.0 |
| cascadeMap | Cascade parameter mapping for quick code and LOV queries; see [Cascade](/en/tutorials/select#级联) | object |  |   |
| currency | Currency code; see [Current currency & funds code list.](https://www.currency-iso.org/en/home/tables/table-a1.html) | string |  |   |
| ignore | Ignore submission. Options: always - always ignore; clean - ignore when value unchanged; never - never ignore | string | |   |
| [transformRequest](/en/datasetapi/field-props/transform-request) | Process data before sending requests | (value: any, record: Record) => any |  |    |
| transformResponse | Process data after receiving responses | (value: any, object: any) => any |  |  |
| trim | Whether to trim whitespace for string values; options: both \| left \| right \| none | string | both |  |
| defaultValidationMessages | Default validation messages; see [ValidationMessages](/en/procmp/configure/configure#validationmessages) | ValidationMessages |  |  |
| highlight | Highlight; if a string or ReactElement, shows a Tooltip | boolean \| ReactNode |  | 1.4.0 |
| showCheckedStrategy | In tree multi-select, defines how selected items are displayed. SHOW_CHILD: show only child nodes; SHOW_PARENT: show only parent nodes (when all child nodes are selected); default shows all selected nodes (including parents) | string | SHOW_ALL | 1.4.4 |
| bucketName | Bucket name for attachment upload | string |  | 1.4.4 |
| bucketDirectory | Bucket directory for attachment upload | string |  | 1.4.4 |
| storageCode | Attachment storage code | string |  | 1.4.4 |
| template | Attachment template | { bucketName?: string, bucketDirectory?: string, storageCode?:string, attachmentUUID: string, isPublic?: boolean } |  | 1.5.5 |
| attachmentCount | Attachment count. Typically use dynamicProps to get a field value in the record as the count; lower priority than attachments.length | string |  | 1.4.4 |
| fileKey | Attachment upload property name | string | [AttachmentConfig.defaultFileKey](/en/procmp/configure/configure#attachmentconfig) | 1.5.2 |
| fileSize | Attachment size limit | number | [AttachmentConfig.defaultFileSize](/en/procmp/configure/configure#attachmentconfig) | 1.5.2 |
| useChunk | Enable chunk upload for attachments | string |  | 1.5.2 |
| chunkSize | Attachment chunk size | number | [AttachmentConfig.defaultChunkSize](/en/procmp/configure/configure#attachmentconfig)  | 1.5.2 |
| chunkThreads | Attachment chunk upload concurrency | number | [AttachmentConfig.defaultChunkThreads](/en/procmp/configure/configure#attachmentconfig) | 1.5.2 |
| processValue | Intercept and return a new value when the value changes | (value: any, range?: 0 \| 1) => any |   | 1.4.4 |
| help | Additional information, often used for tips | ReactNode |  |
| dateMode | Date component display mode; options: `date` `dateTime` `time` `year` `month` `quarter` `week` | string | date  | 1.5.6 |
| accept | Attachment accepted file types [input accept Attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#attr-accept) | string[] |  | 1.5.7 |
| useLookupBatch | Whether to use batch lookup code query | (code: string, field?: Field) => boolean |  | 1.6.5 |
| useLovDefineBatch | Whether to use batch LOV configuration query | (code: string, field?: Field) => boolean |  | 1.6.5 |
| numberRoundMode | Number rounding mode; default is round-half-up | round \| ceil \| floor |  | 1.6.7  |

### Field Values

> Details: [Field](/en/tutorials/dataSet-more#fields)

| Name     | Description     | Type                      | Version |
| -------- | -------- | ------------------------- | --- |
| name     | Field name   | readonly string           | |
| type     | Type     | observable&lt;string&gt;  | |

### Field Methods

> Details: [Field](/en/tutorials/dataSet-more#fields)

* When a field is obtained via ds.getField, methods that accept a record parameter are equivalent to calling the corresponding methods of the field obtained via record.getField. Version: 1.5.0-beta.0+

| Name | Description | Property | Return Type | Version |
| --- | --- | --- | --- | --- |
| get(propsName, record) | Get a property value by property name | `propsName` - property name `record` - record | any |
| set(propsName, value) | Set a property value | propsName - property name；value - property value |  |
| reset() | Reset set properties |  |  |
| checkValidity(record) | Validate field value | `record` - record | boolean |
| setLovPara(para, value, record) | Set Lov query parameters | `para` - parameter name；`value` - parameter value `record` - record | - |
| getOptions(record) | Get option dataset; applies to fields with lookupCode and lovCode | `record` - record | DataSet |
| getValue(record) | Get this field’s value of the current record | `record` - record | any |
| getText(lookupValue, showValueIfNotFound, record) | Get lookup text by lookup value | `lookupValue` - lookup value (defaults to this field’s value) `showValueIfNotFound` - show value when text not found `record` - record | string |
| getLookupData(lookupValue, record) | Get lookup data object by lookup value | `lookupValue` - lookup value (defaults to this field’s value) `record` - record | object |
| fetchLookup(noCache, record) | Request lookup data; returns cached data when available |  `noCache` - disable cache `record` - record | Promise&lt;object[]&gt; |
| isValid(record) | Whether validation passes |  `record` - record | boolean ||
| isDirty(record) | Whether value has changed |  `record` - record | boolean ||
| getValidationMessage(record) | Get validation message |  `record` - record | string |
| getValidationErrorValues(record) | Get validation results |  `record` - record | ValidationResult[] | 1.5.0-beta.0 |
| getAttachments(record) | Get attachment list |  `record` - record | AttachmentFile[] | 1.5.0-beta.0 |
| getAttachmentCount(record) | Get attachment count |  `record` - record | number | 1.5.0-beta.0 |

### Group Values

> Properties added in version 1.5.1

| Name     | Description     | Type                      |
| -------- | -------- | ------------------------- |
| name     | Group name, corresponds to field name   | readonly string           |
| value    | Group value, corresponds to field value     | readonly any  |
| records    | Group dataset; when there are child groups, this is an empty array     | Record[]  |
| totalRecords    | Total dataset, covering all child groups     | Record[]  |
| subGroups    | Non-sibling child groups     | Group[]  |
| parentGroup    | Non-sibling parent group     | Group  |
| children    | In-group tree child groups     | Group[]  |
| parent    | In-group tree parent group     | Group  |
| index    | Index     | number  |

### Group Methods

> Properties added in version 1.5.1

| Name | Description | Property | Return Type |
| --- | --- | --- | --- |
| [setState(key, value)](/en/datasetapi/other/state) | Set a custom state value | key - key name or key-value object; value - value |  |
| [getState(key)](/en/datasetapi/other/state) | Get a custom state value | key - key name |  |

### Transport

> Details: [Transport](/en/tutorials/dataSet-more#transport)

| Property | Description | Type |
| --- | --- | --- |
| create | Axios config or URL string for create request | AxiosRequestConfig \| ({ data, params, dataSet }) => AxiosRequestConfig \| string |
| read | Axios config or URL string for read query | AxiosRequestConfig \| ({ data, params, dataSet }) => AxiosRequestConfig \| string |
| update | Axios config or URL string for update request | AxiosRequestConfig \| ({ data, params, dataSet }) => AxiosRequestConfig \| string |
| destroy | Axios config or URL string for delete request | AxiosRequestConfig \| ({ data, params, dataSet }) => AxiosRequestConfig \| string |
| validate | Axios config or URL string for uniqueness validation request. When a field has unique and there is no duplicate in the current dataset, remote unique validation is performed. Request data format: { unique: \[{fieldName1: fieldValue1, fieldName2: fieldValue2...}\] }; response format: boolean \| boolean\[\]. | AxiosRequestConfig \| ({ data, params, dataSet }) => AxiosRequestConfig \| string |
| submit | Default config or URL string for create/update/destroy | AxiosRequestConfig \| ({ data, params, dataSet }) => AxiosRequestConfig \| string |
| tls | Axios config or URL string for multi-language data. UI expected response format: \[{ name: { zh_CN: 'Simplified Chinese', en_US: 'American English', ... }}\]\, where name is the field name. Use global transport.tls hook to process. | AxiosRequestConfig \| ({ data, params, dataSet, record, name }) => AxiosRequestConfig \| string |
| exports | Export config or URL string | AxiosRequestConfig \| ({ data, params, dataSet }) => AxiosRequestConfig \| string |
| adapter | CRUD config adapter | (config: AxiosRequestConfig, type: string) => AxiosRequestConfig |

### Feedback

| Property                | Description                                       | Type     |
| ------------------- | ------------------------------------------ | -------- |
| loadSuccess(resp)   | DataSet query success feedback; resp - response value    | Function |
| loadFailed(error)   | DataSet query failure feedback; error - exception object | Function |
| submitSuccess(resp) | DataSet submit success feedback; resp - response value    | Function |
| submitFailed(error) | DataSet submit failure feedback; error - exception object | Function |

### DataToJSON

> Details: [DataToJSON](/en/tutorials/dataSet-more#datatojson)

| Enum | Description | Version  |
| --- | --- | --- |
| dirty | Convert only changed data, including data itself unchanged but cascade changed |  |
| dirty-field | Convert only fields changed in the data (including primary key, unique, and fields with ignore=never), including data itself unchanged but cascade changed | 1.4.2  |
| selected | Convert only selected data, regardless of change state | |
| all | Convert all data |  |
| normal | Convert all data to plain JSON; does not include \_\_status, \_\_id etc., and temporary deletions do not appear; generally used for large JSON fields |    |
| dirty-self | Same as dirty, but do not convert cascade data |    |
| dirty-field-self | Same as dirty-field, but do not convert cascade data | 1.4.2   |
| selected-self | Same as selected, but do not convert cascade data |  |
| all-self | Same as all, but do not convert cascade data |    |
| normal-self | Same as normal, but do not convert cascade data |  |

### AttachmentFile

> Properties added in version 1.4.4

| Property                | Description                                       | Type     |
| ------------------- | ------------------------------------------ | -------- |
| name   | Full file name    | string |
| size   | File size    | number |
| type   | File type    | string |
| lastModified   | Last modified timestamp    | number |
| creationDate   | Upload time    | Date |
| uid   | Unique identifier    | string |
| url   | URL address    | string |
| filename   | File name (without extension)    | string |
| ext   | File extension    | string |
| status   | Status error \| success \| uploading \| deleting \| done    | string |
| percent   | Upload progress, 0 to 100   | number |
| error   | Upload error object  | AxiosError |
| errorMessage   | Error message  | string |
| invalid   | Validation failed; if true, cannot re-upload  | boolean |
| originFileObj   | Original file object; only attachments selected via upload button have this object  | File |

### AttachmentFileChunk

> Properties added in version 1.5.2

| Property                | Description                                       | Type     |
| ------------------- | ------------------------------------------ | -------- |
| file   | AttachmentFile object    | AttachmentFile |
| total   | Total file size    | number |
| start   | Chunk start position    | number |
| end   | Chunk end position    | number |
| index   | Chunk index    | number |
| status   | Status error \| success \| uploading    | string |
| percent   | Upload progress, 0 to 100   | number |

### ValidationRule

> Properties added in version 1.5.1

| Property                | Description                                       | Type     |
| ------------------- | ------------------------------------------ | -------- |
| name | Validation name; options: minLength \| maxLength | string |
| value | Validation value | number |
| message | Validation message  | string |
| disabled(1.5.2) | Disabled  | boolean \| ({ dataSet }) => boolean |
