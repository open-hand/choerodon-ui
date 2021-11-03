---
order: 6
title: 更新日志
toc: false
timeline: true
---

`choerodon-ui` 严格遵循 [Semantic Versioning 2.0.0](http://semver.org/lang/zh-CN/) 语义化版本规范。

#### 发布周期

- 修订版本号：日常 bugfix 更新。（如果有紧急的 bugfix，则任何时候都可发布）
- 次版本号：发布一个带有新特性的向下兼容的版本。
- 主版本号：含有破坏性更新和新特性，不在发布周期内。

---

- 🌟 `<pro>SecretField`: 新增 SecretField 组件。
- 🌟 `<pro>Attachment.Group`: 新增 Attachment.Group 组件。
- 🌟 `<pro>NumberField`: 新增 keyboard 属性，控制UP DOWN键盘事件。
- 🌟 `configure`: 新增 numberFieldKeyboard 属性。
- 💄 `<pro>Modal`: 优化鼠标点击无遮罩的模态框时会自动置顶。
- 🐞 `<pro>Lov`: 修复在 popup 模式下搜索框置空时不查询的问题。
- 🐞 `<pro>Table`: 修复跨页全选时选中记录提示中显示的数量问题。
- 🐞 `<pro>Modal`: 修复打开无遮罩的模态框时会导致有遮罩的模态框遮罩消失的问题。
- 🐞 `<pro>DatePicker`: 修复在 range 模式和有 timeZone 的情况下连着输入值报错的问题。修复 maxLength 和 minLength 属性的错误限制。
- 🐞 `<pro>Validator`: 修复校验信息没有完全格式化，例如没有 label 时。
- 🐞 `<pro>NumberField`: 修复 maxLength 和 minLength 属性的错误限制。

## 1.5.0-beta.0

`2021-10-31`

- 🌟 `configure`: 新增 defaultActiveFirstOption 属性。
- 🌟 `Message`: 新增 message.config 方法参数 maxCount。
- 🌟 `Notification`: 新增 notification.config 方法参数 maxCount。
- 🌟 `Badge`: 新增 color, size, title 属性。
- 🌟 `<pro>Table`: 新增 summaryBarFieldWidth 属性处理 summaryBar 字段宽度。
- 🌟 `<pro>Select`: 新增 defaultActiveFirstOption 属性是否默认高亮第一个选项。
- 🌟 `<pro>DataSet`: 新增 cacheModified 属性， cachedModified, cachedRecords 值， clearCachedModified, clearCachedRecords 方法， query 和 loadData 新增 cache 参数。
- 🌟 `Upload`: 新增 showFileSize 属性，以及优化了组件样式。
- 🌟 `Tabs`: 新增 countRenderer 属性。
- 🌟 `<pro>Lov`: 新增 onSearchMatcherChange 属性。
- 🌟 `Steps`: 新增 type 属性。
- 🌟 `Steps`: 新增 onChange 回调。
- 🌟 `Tabs`: 新增 showMore 属性。
- 🌟 `<pro>SecretField`: 新增 SecretField 组件。
- 🌟 `ImageCrop.AvatarUploader`: 移除 minRectSize, subTitle 属性，defaultRectSize 更名为 rectSize。
- 💄 `<pro>DataSet`: 优化内存, 优化树形数据性能, 优化校验性能。
- 💄 `RcTrigger`: 使组件成为观察者。
- 💄 `<pro>Select`: 使用 options 数据源模式下，支持 searchMatcher 配置搜索参数。
- 💄 `<pro>PerformanceTable`: 优化大数据表格拖拽回调事件。
- 💄 `Upload`: 优化大写图片后缀缩略图显示。
- 💄 `<pro>Attachment`: 增强图片预览功能。
- 💄 `<pro>Attachment`: 优化缓存逻辑。
- 💄 `<pro>Attachment`: 在标签上显示必输星号
- 💄 `<pro>DateTimePicker`: 优化范围值在自动交换顺序时，由 defaultTime 设置的时间值不变。
- 💄 `<pro>Lov`: 优化按钮模式的 onClick 钩子允许通过调用 event.preventDefault() 阻止弹出模态框。
- 💄 `<pro>Lov`: 优化在按钮模式下，查询等待 loading 效果。
- 💄 `<pro>Lov`: 优化 在 popup 模式下，搜索框添加查询字段选择。
- 💄 `<pro>NumberField`: 优化 step 按钮执行效率。
- 💄 `ImageCrop.AvatarUploader`: 优化裁剪功能和界面样式。
- 🐞 `<pro>Table`：修复 selectable 为 false 时会清除已勾选的记录问题。
- 🐞 `<pro>Table`：修复虚拟单元格在校验失败或编辑器通过Tab键显示时没有进入视区的问题。
- 🐞 `<pro>Table`：修复通过 Modal 跨 iframe 时无法调整列宽。
- 🐞 `<pro>Table`：修复过滤条输入框中内容不能对齐的问题。
- 🐞 `<pro>Table`：修复 virtualCell 模式下 maxHeight 样式可能导致死循环的问题。
- 🐞 `<pro>Table.Column`：修复当没有对应字段时 editor 为 true 不起作用。
- 🐞 `<pro>Table.Column`： 修复 editor 为 true 时， 无法动态从 Select 切换成其他编辑器的问题。
- 🐞 `<pro>Attachment`： 修复点击查看附件按钮报错的问题。
- 🐞 `<pro>Attachment`： 修复上传按钮内容溢出并设置了 tooltip 时上传无反应的问题。
- 🐞 `<pro>Attachment`： 修复 accept 属性无法控制文件选择的问题。
- 🐞 `<pro>Attachment`： 修复附件数据没有 type 可能会报错的问题。
- 🐞 `<pro>Attachment`： 修复删除或者拖拽后图片预览问题。
- 🐞 `<pro>DataSet.Field`： 修复通过 dynamicProps 设置的校验属性首次校验无效果的问题。
- 🐞 `<pro>DataSet`： 修复 appendData total 参数更新问题。
- 🐞 `<pro>Validator`： 修复 stepMismatch 错误信息不全的问题。
- 🐞 `<pro>Output`： 修复显示冒号时会显示必输星号的问题。
- 🐞 `<pro>Modal`： 修复 drawerTransitionName 非法导致页面报错的问题。
- 🐞 `<pro>PerformanceTable`： 修复开启虚拟滚动导致合并行消失的问题。
- 🐞 `<pro>ColorPicker`：修复配置 clearButton 属性报错，以及选择#00000颜色时指针跳动问题。

## 1.4.5

`2021-09-29`

- 🌟 `configure`: 新增 tabsInkBarStyle, customizable, customizedSave, customizedLoad, tableButtonsLimit 属性, 废弃 tableCustomizedSave, tableCustomizedSave, tableCustomizable, performanceTableCustomizable, lovTableCustomizable 属性。
- 🌟 `Tabs`: 新增 inkBarStyle, customizable, customizedCode, hideOnlyGroup 属性，支持墨条样式修改。
- 🌟 `Tabs.TabPane`: 新增 title, showCount 属性, count 属性支持钩子。
- 🌟 `Tag`: 新增 gray 颜色。
- 🌟 `<pro>DataSet`: 新增 childrenField, forceValidate 属性。
- 🌟 `<pro>DatePicker`: 新增 editorInPopup, defaultTime 属性。
- 🌟 `<pro>Dropdown`: 新增 onHiddenBeforeChange 回调。
- 🌟 `<pro>Table`：新增 searchCode, autoWidth, rowBoxPlacement, buttonsLimit 属性, 优化 TableQueryBarType.filterBar 动态筛选条，支持保存筛选条件, 废弃 autoMaxWidth 属性。
- 🌟 `<pro>Pagination`: 新增 quickJumperPosition 属性。
- 💄 `Tabs`：优化 count 为零时不显示。
- 💄 `<pro>Pagination`: 优化 quickJumper 显示。
- 💄 `<pro>Attachment`：优化删除、拖拽、预览和标签显示, 优化删除错误状态的附件为直接删除。
- 💄 `<pro>TextField`： 优化多值模式下切换记录时关闭动画效果。
- 💄 `<pro>Table`： 支持按住 shift 进行多选。
- 💄 `<pro>Table`： 优化没有编辑器的单元格也能显示小三角和校验信息。
- 💄 `<pro>Table`： 重命名 onResize 为 onColumnResize 事件。
- 💄 `<pro>Lov`： 优化 lovQueryBar 优先级，去除 lovQueryBar 全局默认值。
- 💄 `<pro>Lov`： 搜索查询周期内，下拉禁用回车选中，保证选中正确的查询返回数据。
- 💄 `<pro>Tooltip`：优化样式对齐。
- 🐞 `<pro>DataSet`： 修复 cacheSelection 属性缓存的选中记录重新显示时变更的值被还原的问题。
- 🐞 `<pro>DataSet`： 修复当字段列表中没有 primaryKey 对应的字段时 dirty-field 模式会忽略主键值。
- 🐞 `<pro>Attachment`： 修复数量和附件列表不显示的问题。
- 🐞 `<pro>Attachment`: 修复当没有附件时 picture-card 模式下上传按钮不显示的问题。
- 🐞 `<pro>TimePicker`: 修复 12 小时格式分和秒选择框显示问题。
- 🐞 `<pro>DatePicker`: 修复 isFlat 和 range 模式下显示问题。
- 🐞 `<pro>DatePicker`: 修复 range 为 object 且 multiple 时设置的问题。
- 🐞 `<pro>DatePicker`：修复输入值时 defaultTime 不起作用的问题。
- 🐞 `<pro>DatePicker`：修复无法输入空格的问题。
- 🐞 `<pro>Table`：修复个性化表格最后一列单元格，非左对齐时的样式异常。
- 🐞 `<pro>Table`：修复 customizedCode 变更时且表格列不会刷新的问题。
- 🐞 `<pro>Table`：修复 virtual 在切换分页大小时行错位的问题。
- 🐞 `<pro>Table`：修复 virtualCell 导致编辑器错位的问题。
- 🐞 `<pro>Table`：修复查询字段 range 属性时过滤条渲染错误的问题。
- 🐞 `<pro>Table`：修复编辑器为多选 SelectBox 时的显示问题。
- 🐞 `<pro>Table`：修复个性化调整列顺序不准确的问题。
- 🐞 `<pro>Table`：修复使用 autoHeight 属性下 professionalBar 多次点击更多才会收起的问题。
- 🐞 `<pro>Tree`：修复异步加载的节点在 dataSet 重新加载时无法显示的问题。
- 🐞 `Tabs`：修墨条可能对不齐的问题。
- 🐞 `<pro>PerformanceTable`：修复行高亮点击报错问题。
- 🐞 `<pro>Lov`：修复单选模式表格 alwaysShowRowBox 为 true 时选值错误的问题。
- 🐞 `<pro>TriggerField`：修复 onPopupHiddenChange 有时不触发的问题。
- 🐞 `<pro>Button`：修复 tooltip 为 overflow 时内容没溢出也会显示 Tooltip 的问题。
- 🐞 `<pro>Lov`：修复 button 模式的 onClick 属性没效果的问题。
- 🐞 `<pro>Lov`：修复 multiple 模式下开启 noCache 选项重复的问题。
- 🐞 `<pro>Lov`：修复点击弹出 Modal 后搜索下拉未收起的问题。
- 🐞 `<pro>Lov`：修复 popup 模式表格颤抖的问题。
- 🐞 `<pro>Lov`：修复 searchFieldInPopup 模式下关闭弹出的 Modal 后下拉框无法弹出的问题。
- 🐞 `<pro>TextArea`：修复拖拽宽度时的样式问题。
- 🐞 `<pro>ColorPicker`：修复选择颜色时面板颜色变化的问题。

## 1.4.4

`2021-09-04`

- 🌟 `configure`: 新增 tableColumnAlign, tableShowRemovedRow, tooltip, showValidation, attachment, selectTrigger, lovQueryCachedSelected, queryBarProps, lovQueryBar, lovQueryBarProps 属性, tooltipTheme 属性支持钩子类型, 废弃 buttonTooltip, labelTooltip, selectOptionTooltip, tableColumnTooltip。
- 🌟 `<pro>Rate`: 新增 Rate 组件。
- 🌟 `<pro>Attachment`: 新增 Attachment 组件。
- 🌟 `<pro>Picture`: 新增 Picture 组件。
- 🌟 `<pro>Modal`: 新增 preview 方法。
- 🌟 `<pro>DataSet.Field`: 新增 bucketName, bucketDirectory, attachmentCount, showCheckedStrategy 属性。
- 🌟 `<pro>DataSet.AttachmentFile`: 新增 AttachmentFile 类。
- 🌟 `<pro>RichText`: 新增图片连续预览功能。
- 🌟 `<pro>Cascader`: 新增 async 和 loadData 属性，简化异步加载方案。
- 🌟 `<pro>PerformanceTable`: 新增 onCell 属性，单元格 rowSpan 属性，支持行合并。
- 🌟 `<pro>Form`: 新增 showValidation 属性控制校验信息提示方式。
- 🌟 `<pro>FormField`: 新增 showValidation 属性控制校验信息提示方式。
- 🌟 `Tree`：onCheck 回调新增 oldCheckedKeys 参数。
- 🌟 `Skeleton`：新增 grid 属性支持栅格占位配置。
- 🌟 `<pro>FormField`：新增 processValue 属性。
- 🌟 `<pro>DataSet.Field`：新增 processValue 属性，支持值变更时，拦截并返回一个新的值。
- 🌟 `<pro>DatePicker`：新增 processValue 属性。
- 🌟 `<pro>Table`：新增 showCachedSelection, onShowCachedSelectionChange 属性。
- 🌟 `<pro>Table`：新增 showRemovedRow 属性，控制临时移除行显隐。
- 🌟 `<pro>TriggerField`：新增 viewMode, getPopupAlignTarget 属性。
- 🌟 `<pro>Select`：新增 searchFieldInPopup, searchFieldProps 属性。
- 🌟 `<pro>Lov`：新增 onBeforeSelect 属性。
- 🌟 `<pro>PerformanceTable`: 新增 rowSelection 属性, 内置勾选列。
- 🌟 `<pro>PerformanceTable`: 新增 rowDraggable 属性，支持行拖拽。
- 🌟 `<pro>PerformanceTable`: 开启虚拟滚动，新增横行虚拟滚动。
- 🌟 `<pro>Table`: 新增 onResize 事件。
- 🌟 `Tabs`: 新增 TabGroup 组件。
- 🌟 `Tabs.TabPane`: 新增 count, overflowCount 属性。
- 🌟 `Icon`: 新增大量图标。
- 🌟 `<pro>Table`: 新增 autoQueryAfterReset 属性支持 ProfessionalBar & DynamicFilterBar 重置是否自动查询。
- 💄 `<pro>Table`：个性化聚合视图的保存受外部属性 aggregation 属性的控制。
- 💄 `<pro>Table`：性能和内存优化。
- 💄 `<pro>Pagination`：优化分页器宽度样式。
- 💄 `<pro>Select`：优化多选只读选项样式。
- 💄 `<pro>Tree`：优化 selectable 属性为 false 时 DataSet 相关数据、事件处理。
- 💄 `<pro>TextField`：优化 showLengthInfo 信息渲染位置。
- 💄 `<pro>Trigger`：支持 Fragment 子节点。
- 💄 `ImageCrop`：优化界面及操作方式。
- 💄 `<pro>PerformanceTable`：支持取消排序。
- 💄 `<pro>FormField`：优化空值判断。
- 💄 `<pro>FormField`：优化 hidden 属性，支持隐藏字段。
- 🐞 `configure`: 修复 tableFilterAdapter 类型。
- 🐞 `<pro>Table`：修复专业查询条动态查询参数未实时响应的问题。
- 🐞 `<pro>DataSet.Field`: 优化多次调用 fetchLookup 数据返回类型问题。
- 🐞 `<pro>DataSet`：修复分页全局配置参数传参问题。
- 🐞 `<pro>Table`：修复 CheckBox 编辑器所在单元格会显示 help 的问题。
- 🐞 `<pro>TextArea`：修复浮动标签必输样式问题。
- 🐞 `<pro>Trigger`: 修复穿越同域 iframe 时下拉窗口没对齐的问题。
- 🐞 `<pro>Table`：修复存在默认勾选且不可修改的勾选行时，全选和取消全选无效的问题。
- 🐞 `<pro>Table`：修复行内编辑模式的动态编辑器隐藏后无法再显示的问题。
- 🐞 `<pro>DatePicker`：修复 range 模式下自定义 renderer 的问题。
- 🐞 `<pro>PerformanceTable`：修复组合列中子列第一列设置 resizable 无法拖拽的问题。
- 🐞 `<pro>PerformanceTable`：修复组合列中只有一个子列时渲染报错问题。
- 🐞 `<pro>PerformanceTable`: 修复个性化配置表格高度无效问题。
- 🐞 `<pro>Tree`：修复收起状态下勾选框状态错误的问题。
- 🐞 `<pro>TreeSelect`：修复收起状态下勾选框状态错误的问题。
- 🐞 `<pro>Select`：修复多选模式下 trigger 为 hover 无效。
- 🐞 `<pro>FormField`：修复高亮模式下 valueChangeAction 为 input 时，校验报错会导致输入框失去焦点的问题。
- 🐞 `<pro>Lov`: 修复多选模式表格 selectionMode 为 click 时无法多选的问题。
- 🐞 `<pro>Lov`: 修复 showCheckedStrategy 属性 SHOW_ALL 值的逻辑问题。
- 🐞 `<pro>Select`: 修复同时使用 primitiveValue 和 combo 属性时渲染报错的问题。
- 🐞 `<pro>Table`: 修复虚拟单元格和最大高度可能导致死循环的问题。
- 🐞 `<pro>Table`: 修复编辑器会浮动到禁用单元格上的问题。
- 🐞 `<pro>NumberField`：修复 suffix，prefix 属性支持，样式。
- 🐞 `<pro>Output`: 修复使用 useColon 必输字段冒号无效的问题。
- 🐞 `<pro>Table`：修复过滤条过滤条件为数值0时渲染错误问题。
- 🐞 `<pro>Table`：修复 footer dom 位置。
- 🐞 `<pro>Table`：修复 queryBarProps onReset & onQuery 事件无效问题。

## 1.4.3

`2021-08-03`

- 🌟 `configure`: 新增 performanceTableColumnHideable, performanceTableColumnTitleEditable, performanceTableColumnDraggable, performanceTableCustomizable, tableVirtual 属性。
- 🌟 `<pro>Table.Column`: 新增 hiddenInAggregation 属性, command 钩子新增 aggregation 参数。
- 🌟 `<pro>PerformanceTable`: 新增 customizedCode, customizable, columnDraggable, columnTitleEditable, columnsDragRender 属性，支持个性化。
- 💄 `<pro>DataSet`：内存优化。
- 💄 `<pro>Select`：内存优化。
- 💄 `<pro>Table`：性能和内存优化。
- 💄 `<pro>Table`：优化调整列宽的性能和逻辑。
- 💄 `<pro>SelectBox`: 调整 checkValueOnOptionsChange 默认值为 false。
- 💄 `<pro>SelectBox`：优化 label 内容溢出提示。
- 💄 `<pro>Trigger`: 支持穿越同域 iframe。
- 💄 `<pro>Table`：优化动态筛选条样式交互。
- 💄 `<pro>PerformanceTable`：优化动态筛选条样式交互。
- 🐞 修复循环依赖问题。
- 🐞 `<pro>DataSet`: 修复新建记录数大于分页数时向前翻页问题。
- 🐞 `<pro>Table`: 修复列 tooltip 在单元格销毁时无法关闭的问题。
- 🐞 `<pro>Table`: 修复右侧锁定列脚样式问题。
- 🐞 `<pro>Table`: 修复 virtualCell 不起作用。
- 🐞 `<pro>Table`: 修复设置了 virtualCell 时拖拽行报错的问题。
- 🐞 `<pro>Table`: 修复 showHeader 为 false 时虚拟单元格不显示的问题。
- 🐞 `<pro>Table`: 修复 dateTime 类型列渲染格式问题。
- 🐞 `<pro>Table`: 修复 range 为数组类型列报错的问题。
- 🐞 `<pro>Table`: 修复 maxHeight 和 minHeight 可能导致列不撑满的问题。
- 🐞 `<pro>FormField`: 修复渲染器返回数字时不渲染的问题。
- 🐞 `<pro>SelectBox`: 修复数据源绑定后设置问题。
- 🐞 `<pro>PerformanceTable`: 修复设置自动高度时滚动条遮挡展示内容的问题。
- 🐞 `<pro>Lov`: 修复弹窗没有动画的问题。
- 🐞 `<pro>DataSet.Record`: 修复回写数据遗漏的问题。
- 🐞 `<pro>PerformanceTable`: 修复设置流体列宽后手动拖拽更改列宽后未触发更新的问题。
- 🐞 `<pro>PerformanceTable`: 修复动态调整列缺少滚轮监听及固定列失效问题。
- 🐞 `<pro>CodeArea`: 修复浮动标签样式。

## 1.4.2

`2021-07-21`

- 🌟 `configure`: 新增 tableVirtualCell, formatter.timeZone 属性。
- 🌟 `<pro>DataSet`: 新增 selectionStrategy 属性， selectionStrategy, treeSelected 值， treeSelect, treeUnSelect 方法。
- 🌟 `<pro>Lov`: 新增 showCheckedStrategy 属性。
- 🌟 `<pro>DatePicker`: 新增 timeZone 属性。
- 🌟 `<pro>Tooltip`: 新增单例模式, 添加 show 和 hide 静态方法。
- 🌟 `<pro>DataSet`: dataToJSON 新增 dirty-field, dirty-field-self 类型。
- 🌟 `<pro>DataSet.Field`: 新增 json 类型。
- 🌟 `<pro>DataSet`: 新增 combineSort 属性支持组合列排序传参。
- 🌟 `<pro>Select`: selectAllButton 新增钩子类型用于支持自定义按钮。
- 🌟 `<pro>PerformanceTable`: 新增 queryBar, toolbar 属性，用于支持查询条及工具栏。
- 🌟 `<pro>Table`: 新增 showHeader 属性。
- 💄 `<pro>Modal`: 支持穿越同域 iframe。
- 💄 `<pro>DataSet`: dataToJSON 属性的 all 值将校验所有记录。
- 💄 `<pro>DataSet`: 优化 addField 方法将自动创建已有 Record 对应的 Field。
- 💄 `<pro>Radio`：优化 label 内容溢出提示。
- 💄 `<pro>Table`：优化性能。
- 💄 `<pro>Table`：优化动态搜索条样式交互。
- 💄 `<pro>NumberField`：step 兼容移动端事件。
- 💄 `Progress`：优化动画性能。
- 💄 `<pro>Table.Column`： 优化货币类型的列默认靠右对齐。
- 💄 `<pro>Output`： 优化数字货币显示, 优化空值显示。
- 💄 `<pro>DataSet.Record`: 在没有 field 的情况下， addField 方法会对该 field 已有值进行处理。
- 💄 `<pro>NumberField`: 移除 suffix，prefix 属性支持。
- 🐞 `<pro>Table`: 修正 maxHeight 和 minHeight 的计算逻辑。
- 🐞 `<pro>Pagination`: 修复最大分页没有设置时，分页选项有超过默认最大100分页无法选择的问题。
- 🐞 `<pro>IconPicker`: 修复当点击分页按钮并按钮成禁用状态时，弹窗无法关闭的问题。
- 🐞 `<pro>Table`: 修复在孔雀蓝主题下，当Column的editor为function的时候，进入编辑态点击退出后会导致下次进入编辑态组件宽度不正确的问题
- 🐞 `<pro>Table`: 修复行内编辑时无法取消编辑的问题。
- 🐞 `<pro>PerformanceTable`: 修复滚动条事件。
- 🐞 `<pro>PerformanceTable`: 修复表格内点击无效问题。
- 🐞 `<pro>Form`: 修复嵌套表单的 dataSet 属性不起作用的问题。
- 🐞 `<pro>Select`: 修复自定义弹窗可能无法关闭的问题。
- 🐞 `<pro>TextField`: 修复禁用状态下无法显示渲染器渲染的值。
- 🐞 `<pro>Table`: 修复双击调整名字中带有.的列宽时报错。

## 1.4.1

`2021-06-28`

- 🌟 `configure`：新增 performanceEnabled, onPerformance, tooltipTheme, validationTooltipTheme 属性。
- 🌟 `Tooltip`：新增 theme 属性。
- 🌟 `<pro>Table`：新增 queryBarProps, showSelectionCachedButton 属性。
- 🌟 `<pro>Button`：新增 block 属性, funcType 新增 link 类型。
- 🌟 `<pro>Table.Column`: header 和 renderer 钩子新增 aggregation 参数。
- 🌟 `<pro>TriggerField`: 新增 tabIntoPopupContent 属性, popupContent 钩子新增 setValue 和 setPopup 参数。
- 🌟 `<pro>Select`: popupContent 钩子新增 content dataSet textField valueField setValue 和 setPopup 参数。
- 🌟 `<pro>TreeSelect`：新增 showCheckedStrategy 属性, 配置 treeCheckable 时，定义选中项回填的方式。
- 🌟 `<pro>PerformanceTable`：新增点击行高亮属性 highlightRow。
- 🌟 `<pro>DataSet.Record`: get 方法支持字段名数组参数。
- 🌟 `<pro>Table`：修复本地导出在超大数据量时的效果。
- 💄 `<pro>PerformanceTable`：兼容移动端拖拽列宽。
- 💄 `<pro>Table.Column`: 优化聚合列的 command 按钮纵向排列。
- 💄 `<pro>DataSet.Field`: intl类型的字段创建的各种语言字段支持 transformResponse 和 transformRequest 属性。
- 💄 `<pro>DataSet.Field`: 优化被绑定的字段也会因绑定字段的值变更而触发校验。
- 💄 `<pro>RichText`：优化预览样式及 RichTextViewer 样式。
- 🐞 `<pro>DataSet.Field`: 修复递归调用 dynamicProps 时的问题。
- 🐞 `<pro>TextField`: 修复有 addonBefore， addonAfter 或 help 时， Tooltip无法显示的问题。
- 🐞 `Menu`: 修复菜单事件报错。
- 🐞 `<pro>TextField`: 修复空值渲染时浮动标签和渲染值重叠的问题。
- 🐞 `<pro>TriggerField`: 修复 popupContent 中输入框无法获焦的问题， 修复IE下多选模式下拉框滚动条无法拖动的问题。
- 🐞 `<pro>DataSet.Record`: 修复 init 和 getPristineValue 中链式绑定的问题。
- 🐞 `Dropdown`: 修复 overlay 为钩子函数时 overlayProps 未定义的问题。
- 🐞 `<pro>Table.Column`： 修复 dynamicProps.label 对于列头无效的问题。
- 🐞 `<pro>Button`：修复样式问题。
- 🐞 `<pro>DataSet`：修复object类型字段使用transformRequest转成字符串值时绑定的字段为空值的问题。
- 🐞 `<pro>Modal`：修复 autoCenter 开启时宽度样式无效，影响抽屉和全屏模式的问题。
- 🐞 `<pro>Table`：修复冻结列 hover 穿透问题。
- 🐞 `<pro>Table`：修复导出问题,优化本地导出。
- 🐞 `<pro>PerformanceTable`：修复虚拟滚动下渲染异步导致的滚动条异常。
- 🐞 `<pro>PerformanceTable`：修复移动端滚动卡顿的问题。
- 🐞 `<pro>Screening`：修复dataSet没有初始值的时候的显示问题。

## 1.4.0

`2021-06-11`

- 🌟 `configure`: 新增 buttonTooltip, selectOptionTooltip, labelTooltip, showLengthInfo, showInvalidDate, showRequiredColorsOnlyEmpty, highlightRenderer, tableColumnEditorBorder, currencyFormatter, currencyFormatterOptions 属性, 废弃 excludeUseColonTagList 属性。
- 🌟 `<pro>Select`: 新增 optionTooltip 属性。
- 🌟 `<pro>Form.Item`: 新增 Item 组件。
- 🌟 `<pro>Form`: 新增 labelTooltip, highlightRenderer, layout 属性, 废弃 excludeUseColonTagList 属性。
- 🌟 `<pro>FormField`: 新增 labelTooltip, highlight, highlightRenderer, useColon 属性。
- 🌟 `<pro>Button`: 新增 tooltip 属性。
- 🌟 `<pro>DataSet`: 新增 setAllPageSelection, getQueryParameter, getValidationErrors 方法和 isAllPageSelection, unSelected, currentUnSelected 值。
- 🌟 `<pro>DataSet.Record`: 新增 getValidationErrors 方法。
- 🌟 `<pro>DataSet.Field`: 新增 computedProps, highlight 属性, 废弃 dynamicProps 属性。
- 🌟 `<pro>Table`: 新增 showAllPageSelectionButton, aggregation, onAggregationChange, cellHighlightRenderer, columnEditorBorder 属性。
- 🌟 `<pro>Table.Column`: 新增 aggregation, aggregationLimit, aggregationDefaultExpandedKeys, aggregationDefaultExpandAll, highlightRenderer 属性。
- 🌟 `<pro>TextField`: 新增 showLengthInfo 属性。
- 💄 `<pro>DataSet`: 优化 appendData 方法不受分页影响。
- 💄 `<pro>DataSet.Field`: 优化链式绑定的一些问题。
- 💄 `<pro>Select.Option`: 支持 ReactFragment 嵌套。
- 💄 `<pro>Table.Column`: 支持 ReactFragment 嵌套。
- 💄 `<pro>Form`: 支持 ReactFragment 嵌套子元素。
- 💄 `Tooltip`: title 和 overlay 属性支持钩子函数。
- 💄 `Dropdown`: overlay 属性支持钩子函数。
- 💄 `Popover`: title 和 content 属性支持钩子函数。
- 💄 `Popconfirm`: title 属性支持钩子函数。
- 💄 `<pro>Select.Option`: 属性如 className 和 style 可传递到下拉菜单选项。
- 💄 `<pro>NumberField`: 优化了在没有值的情况下点击步距器的处理。
- 💄 `<pro>Tooltip`: title 和 overlay 属性支持钩子函数。
- 💄 `<pro>Dropdown`: overlay 属性支持钩子函数。
- 💄 `<pro>Table`: 性能优化。
- 💄 `<pro>Table`: 支持 maxHeight 和 minHeight 样式属性。
- 💄 `<pro>Tree`: 优化扩展 showLine 属性。
- 💄 `<pro>Form`: 优化浮动标签 label 展示时机。
- 💄 `<pro>TextField`: 优化 clearButton 渲染交互。
- 💄 `<pro>Modal`: footer 增加 modal 回调参数。
- 💄 `<pro>TextField`: 优化 range 模式 label 渲染逻辑。
- 💄 `<pro>TextField`: 修改 autoComplete 属性类型为 string。
- 💄 `<pro>TextField`: restrict 属性支持正则类型。
- 💄 `<pro>NumberField`: 优化 precision 属性会转换小数点位数。
- 🐞 `<pro>Table.Column`: 修复编辑器 addonBefore 和 addonAfter 中的元素无法获取焦点的问题。
- 🐞 `<pro>Table`: 修复鼠标批量选择记录不准确的问题。
- 🐞 `<pro>DataSet`：修复清除object类型字段的值时，其绑定字段不会提交null值的问题。
- 🐞 `Responsive`：修复多个响应式组件其中一个禁用或销毁时其他组件无法触发响应的问题。
- 🐞 `Select`：修复 OptGroup 模式下全选失效问题。
- 🐞 `<pro>Modal`：修复没有取消按钮时 keyboardClosable 属性没有效果。
- 🐞 `<pro>Modal`：修复非 ModalProvider 提供的 Modal 的一些异常行为。
- 🐞 `<pro>DataSet`：修复在仅删除以及dataToJSON为selected的情况下，提交后对dataSet状态修改不正确的问题。
- 🐞 `<pro>Table`：修复编辑器在 DataSet 当前记录发生变化时的定位问题。
- 🐞 `<pro>RichText`：修复编辑器 onBlur 事件。
- 🐞 `<pro>FormField`：修复 ref 属性无效的问题。
- 🐞 `<pro>Select.Option`：修复 children 是 ReactNode 时渲染问题。
- 🐞 `<pro>Table`：修复 parityRow 展开行渲染问题。
- 🐞 `<pro>Table`：修复树形分页数据中 idField 为空导致死循环的问题。
- 🐞 `<pro>Paginition`：修复无数据翻页按钮渲染问题。
- 🐞 `<pro>Select`: 修复在多选模式下 Select 被 Tooltip 包裹时无法正确显示提示的问题。
- 🐞 `<pro>ColorPicker`: 修复在使用了 DataSet 的情况下，点击了下方的横向的颜色选择器后，reset 无法正确将显示恢复到初始状态的问题。
- 🐞 `<pro>DatePicker`: 修复在多选模式下选择日期报错的问题。
- 🐞 `<pro>TextField`: 修复 multiple 模式空值渲染。
- 🐞 `<pro>DatePicker`: 修复点击清除按钮是日历会弹出切无法关闭的问题。
- 🐞 `<pro>Button`: 修复异步等待后焦点错误问题。
- 🐞 `<pro>Lov`: 修复 autoSelectSingle 开启单条数据无法弹出的问题。
- 🐞 `<pro>Lov`: 修复多选模式下表格属性 selectionMode 为 click 时数据处理错误的问题。
- 🐞 `<pro>Table`: 修复 queryBar 多语言类型字段渲染问题。
- 🐞 `<pro>PerformanceTable`: 修复 ColumnGroup 中列不能排序的问题。


## 1.3.2

`2021-05-11`

- 🌟 `configure`: 新增 lovTableCustomizable，lovAutoSelectSingle，tableColumnOnCell 属性。
- 🌟 `<pro>Modal`：新增 closeOnLocationChange 属性。
- 🌟 `<pro>Table`: 个性化新增高度设置。
- 🌟 `<pro>Lov`: 新增 autoSelectSingle 属性，点击查询仅存在一条数据时自动选中且不弹窗。
- 🌟 `<pro>Table`：优化开启 autoLocateAfterRemove 属性后在删除过程中数据的指向。
- 🌟 `<pro>NumberField`：max 以及 min 属性设置默认值 Number.MAX_SAFE_INTEGER / Number.MIN_SAFE_INTEGER。
- 💄 `<pro>Table`: 高度样式支持 calc 属性。
- 💄 `<pro>Table`: 优化 professionalBar 展开收起 autoHeight 未响应的问题。
- 💄 `<pro>Select`: 优化点击清空自动弹出下拉的问题。
- 💄 `<pro>Form`: 优化 tooltip help 浮层优先级。
- 🐞 `<pro>Table`: 修复不停抖动的问题。
- 🐞 `<pro>Field`: 修复 getText 获取对象值报错。
- 🐞 `<pro>Select`: 修复值类型为对象时，全选反选错误的赋值。
- 🐞 `<pro>TextField`: 修复 form 标题为浮动时候字段为 range 配置出现的标题显示冲突。
- 🐞 `<pro>DataSet`：修复新建 defaultValue 对象校验无效问题。
- 🐞 `<pro>FormField`：修复值没变更时不会校验的问题。
- 🐞 `<pro>Modal`：修复非 ModalProvider 提供的 Modal 的一些异常行为。
- 🐞 `<pro>IntlField`: 修复 maxLengths 属性，未单独设置长度语言遵循字段属性配置。
- 🐞 `<pro>DataSet`：修复 create 方法传递带有 bind 属性的字段值且目标字段有默认值， 则目标字段会直接取默认值的问题。
- 🐞 `<pro>Table`：修复 customizable TS 类型错误。
- 🐞 `<pro>DatePicker`：修复 startDate 和 endDate 由 min 和 max 互相关联时， endDate 日期会触发两次更新的问题。

## 1.3.1

`2021-04-18`

- 🌟 `configure`: 新增 selectPagingOptionContent, selectSearchable 属性。
- 🌟 `<pro>DataSet`: 新增 setState, getState, modifiedCheck 方法。
- 🌟 `<pro>Paginition`: 新增 maxPageSize, pageSizeEditable 属性。
- 🌟 `<pro>FormField`: 新增 onBeforeChange 钩子。
- 🌟 `<pro>Select`: 新增 pagingOptionContent 属性。
- 🌟 `<pro>DatePicker`: 属性 filter 新增 mode 参数。
- 🌟 `<pro>Table`: 新增 ProfessionalBar 查询条 defaultExpanded 属性。
- 🌟 `<pro>Table`: 新增 treeQueryExpanded 属性支持树形结构 queryBar 查询自动触发展开树形结构。
- 💄 `<pro>Table`: 优化编辑器性能。
- 💄 `<pro>Table`: 优化虚拟滚动性能。
- 💄 `<pro>Table`: 优化边框样式问题。
- 💄 `<pro>Table`: 优化 ProfessionalBar 查询条 boolean 类型的查询字段默认显示为勾选框。
- 💄 `Popover`: 优化 trigger 为 click 模式下，弹窗中 Select 组件选择时无需设置 getPopupContainer 也能防止弹窗关闭。
- 💄 `<pro>Trigger`: 优化 getContainer 方式。
- 💄 `<pro>Select`: 优化只读模式下搜索样式。
- 🐞 `<pro>DatePicker`: 修复 maxLength 和 minLength 的错误限制。
- 🐞 `<pro>NumberField`: 修复 maxLength 和 minLength 的错误限制。
- 🐞 `<pro>DataSet.Field`：修复 maxLength 和 minLength 对日期和数字类型的错误限制及校验。
- 🐞 `<pro>DataSet.Field`：修复 dynamicProps.lovPara 和 cascadeMap 同时使用时卡顿的问题。
- 🐞 `<pro>Table`：修复 rowHeight:auto 时，输入数字不会换行显示的问题。
- 🐞 `<pro>Tooltip`：修复第一次显示时位置有偏移的问题。

## 1.3.0

`2021-04-09`

- 🌟 `<pro>LovConfig`: 新增 tableProps, dataSetProps 配置。
- 🌟 `configure`: 新增 tableCustomizable, tableColumnTooltip, drawerSectionBorder, tableShowSelectionTips, drawerTransitionName 属性。
- 🌟 `<pro>Table`: 新增选择记录的提示。
- 🌟 `<pro>Table`: 新增 clientExportQuantity 配置客户端导出查询数量和轮询导出。
- 🌟 `<pro>Cascader`: 新增 searchable, searchMatcher 实现可搜索配置。
- 🌟 `<pro>Table`: 新增 customizable, virtualCell, showSelectionTips 属性。
- 🌟 `<pro>DataSet.Field`: 新增 precision, numberGrouping, optionsProps 属性。
- 🌟 `<pro>NumberField`: 新增 precision, numberGrouping 属性。
- 🌟 `<pro>TextArea`: 新增 onResize 钩子。
- 🌟 `<pro>PerformanceTable`: 新增与 DataSet 数据源结合 demo。
- 🌟 `<pro>Modal`: 新增 drawerBorder 属性，与 modal border 属性区分控制。
- 🌟 `<pro>Table`: 新增 virtualRowHeight 属性, 实现配置虚拟滚动高度。
- 💄 `<pro>Table`: 优化编辑器性能。
- 💄 `<pro>Table`: 当编辑器为 TextArea 时，行高可随 TextArea 大小的变更调整大小。
- 💄 `<pro>Table`: 优化冻结列实现方式和性能。
- 💄 `<pro>PerformanceTable`: 优化样式，加载条。
- 💄 `<pro>TextField`: 优化当为 disabled 状态下 range 配置导致的无法复制选中值的问题。
- 💄 `<pro>Lov`: 废弃 lovEvents。
- 💄 `<pro>Lov`: 提高 searchable 属性值为 false 的优先级。
- 🐞 `<pro>TextField`: 修复 renderer 配置出现的样式问题。
- 🐞 `<pro>DatePicker`: 修复 DatePicker 年份选择的渲染空白问题。
- 🐞 `<pro>DatePicker`: 修复 DatePicker filter footer 位置当前日期不能过滤。
- 🐞 `<pro>FormField`: 修复 NumberField 当值为 0 配置 range 时候不会自动切换位置。
- 🐞 `<pro>Tooltip`: 修复样式优先级。
- 🐞 `<pro>PerformanceTable`: 修复大数据表格问题。
- 🐞 `<pro>Table`: 修复表格中 autoHeight 的计算问题。
- 🐞 `<pro>FormField`: 修复 defaultValue 值会被清理的问题。
- 🐞 `<pro>Table`: 修复虚拟滚动时编辑器获焦不会自动进入视区的问题。
- 🐞 `<pro>Table`: 修复表格虚拟滚动结合自动高度表格溢出问题。
- 🐞 `<pro>Table`: 修复当表格更新时会自动获取焦点的问题。
- 🐞 `<pro>Output`: 修复值集显示值是数字 0 时渲染为空的问题。
- 🐞 `<pro>DataSet.Field`：修复 dynamicProps 有概率报错的问题。

## 1.2.0

`2021-03-18`

- 🌟 `configure`: 新增 tableColumnTitleEditable、tableColumnHideable、tableColumnDraggable、tableRowDraggable、tableCustomizedSave、tableCustomizedLoad, modalMaskClosable 全局属性， 废弃 tableDragColumn、tableDragRow、 lovTriggerMode 属性。
- 🌟 `<pro>Table`: 新增表格个性化功能，包括新增 customizedCode、columnTitleEditable、columnHideable、columnDraggable、rowDraggable 属性， 废弃 columnsMergeCoverage、columnsOnChange、columnsEditType、dragColumn、dragRow 属性, Column 新增 titleEditable 属性。
- 🐞 `<pro>Table`: 修复边框样式问题。
- 🐞 `<pro>Select`: 修复可搜索时候，清空按钮会触发两次 onChange。
- 🐞 `<pro>Record`: 修复 reset 方法无法恢复记录状态的问题。
- 🐞 `<pro>NumberField`: 修复长按增减值按钮在出现校验失败时无法停止的问题。
- 🐞 `<pro>Form`: 修复表单各模式 placeholder 被填充为 label 值。

## 1.1.1

`2021-03-12`

- 🌟 `<pro>Select`: 新增选项分页功能。
- 🌟 `<pro>Lov`: 新增 searchAction，fetchSingle 属性。
- 💄 `configure`: 扩展 defaultRenderEmpty 全局属性，支持 Output 组件。
- 💄 `<pro>Modal`: 扩展 maskClosable 可选 true、false、click、dblclick。
- 💄 `<pro>Form`: 优化 labelLayout 为 placeholder 时候，可以在聚焦时候显示配置的 placeholder 值。
- 💄 `<pro>Select`: 优化搜索时候的搜索图标，和多选时候反选不可选值出现被删除。
- 💄 `<pro>TextArea`: 优化拖拽最小高度防止文字被遮蔽。
- 💄 `<pro>Lov`: 删除 triggerMode 属性，优化为双击触发弹窗。
- 💄 `<pro>Lov`: 优化 tableProps 支持 lov Table columns 属性合并。
- 🐞 `<pro>Field`: 修复部分动态属性配置无效的问题。
- 🐞 `<pro>Lov`: 修复 button mode 选值无效的问题。
- 🐞 `<pro>Lov`: 修复默认值存在全选某一页后导致的查询跳页问题。
- 🐞 `<pro>Tootip`: 修复当 Children 为 undefined 时候导致组件报错。
- 🐞 `<pro>Select`: 修复 searchMatcher 默认配置获取 textField 字段值可能为空时的报错。


## 1.1.0

`2021-03-02`

- 🌟 `configure`: 新增 tableParityRow 全局属性。
- 🌟 `<pro>TreeSelect`: 新增 TreeSelect 组件。
- 🌟 `<pro>Select`: 新增 selectAllButton 属性。
- 🌟 `<pro>SelectBox`:实现 optionsFilter searchable 属性。
- 🌟 `<pro>TextField`: 新增 valueChangeAction、wait、waitType 属性。
- 🌟 `<pro>Form`: labelWidth 新增 auto 值。
- 🌟 `<pro>Table`: column 存在 tooltip 属性时列头添加 HTML title。
- 🌟 `<pro>AutoComplete`: 新增 matcher 属性。
- 🌟 `<pro>LocaleContext`: 新增 setNumberFormatLanguage 方法。
- 🌟 `<pro>Tree`: 新增 async 属性，简化异步加载方案。
- 🌟 `<pro>Table`: 新增 treeAsync 和 treeLoadData 属性，简化异步加载方案。
- 🌟 `<pro>Table`: 新增 parityRow 和 rowNumber 属性。
- 💄 优化 TS 枚举类型导出。
- 💄 `<pro>Table`: 优化性能，修复虚拟滚动无法显示编辑器的问题。
- 💄 `<pro>DataSet`: 优化性能。
- 💄 `<pro>Trigger`: 优化性能。
- 💄 `<pro>Tree`: 优化性能。
- 💄 `<pro>Modal`: 优化 footer 为 null 时全屏显示和抽屉的样式。
- 💄 `<pro>Table`: 优化行样式，确保垂直居中。
- 💄 `<pro>Table`: boolean 类型的查询字段默认显示为下拉框。
- 💄 `<pro>Table`: 优化性能，行选择框操作时不触发当前行的变更。
- 💄 `<pro>Table`: 优化行列拖拽未开启时的性能。
- 💄 `<pro>Table`: 优化自动行高时锁定列同步行高的性能。
- 💄 `<pro>Table`: 扩展 highLightRow 属性支持 focus、click 独立交互。
- 💄 `<pro>IntlField`: 优化 intl disabled 和 readOnly 的值展现形式。
- 🐞 `Collapse`: 修复 expandIconPosition 无效问题。
- 🐞 `<pro>Table`: 修复虚拟滚动在有临时移除的记录时总高度错误的问题。
- 🐞 `<pro>Table`: 修复全选按钮在其他分页有选择记录显示时点击无效的问题。
- 🐞 `<pro>Table`: 修复最后一列无法调整列宽的问题。
- 🐞 `<pro>Table`: 修复拖拽列无法调整列宽的问题。
- 🐞 `<pro>Table`: 修复过滤条多语言问题。
- 🐞 `<pro>Table`: 修复在 modal 中可能出现的 overflowX 计算问题。
- 🐞 `<pro>FormField`: 修复数据源绑定时错误应用 defaultValidationMessages。
- 🐞 `<pro>Field`: 修复切换数据源时错误的返回对象渲染，更新 Table 动态编辑器 demo。
- 🐞 `<pro>DataSet`: 修复动态设置 lovPara 后，lookupData 部分情况下还是使用以前数据的问题。
- 🐞 `<pro>Currency`: 修复无法根据语言环境进行货币格式化的问题。

## 1.0.0

`2021-02-02`

- 🌟 `configure`: 新增 selectReverse，tableAutoHeightDiff 全局属性。
- 🌟 `<pro>Select`: 新增 reverse 属性控制多选是否可反选。
- 🌟 `<pro>Modal`: 新增 header，drawerOffset，okButton，cancelButton，contentStyle，bodyStyle 属性。
- 🌟 `<pro>DataSet`: 新增 beforeRemove 事件。
- 🌟 `<pro>DataSet`: 新增 validateBeforeQuery 属性。
- 🌟 `<pro>DataSet`: query 方法新增 params 参数。
- 🌟 `<pro>DataSet.Field`: 新增 lookupBatchAxiosConfig 属性。
- 💄 `Collapse`: 优化 Collapse 自定义 icon 样式。
- 💄 `<pro>DataSet`: 优化 placeholder 优先级。
- 💄 `<pro>Select`: 优化在数据源中找不到对应值时直接显示空的情况，现在显示返回值。
- 💄 `<pro>Select`: 优化 onOption disabled 配置的多选值显示。
- 💄 `<pro>Table.Column`: 优化 tooltip 为 overflow 时的性能。
- 💄 `<pro>Modal`: 优化关闭按钮与取消按钮的行为保持一致。
- 💄 `<pro>Table`: 优化 autoMaxWidth 的性能。
- 💄 `<pro>DataSet`: delete 和 deleteAll 的 confirmMessage 参数可以通过设置false禁止显示提示框。
- 💄 `<pro>Table`: 优化树展开合并的性能。
- 🐞 `<pro>Table`: 修复拖拽列无法失焦。
- 🐞 `<pro>Table`: 修复 filterBar 存在的交互问题。
- 🐞 `<pro>DataSet`: 修复仅删除提交后的修改数据状态。
- 🐞 `<pro>Lov`: 修复弹窗 modalProps 属性优先级问题。
- 🐞 `<pro>Lov`: 修复弹窗内 table queryBar 属性优先级问题。
- 🐞 `<pro>Record`: 修复 validate 错误的传参导致提交数据错误。
- 🐞 `<pro>Lov`: 修复多选弹窗列表取消勾选值后确认选值更改无效问题。
- 🐞 `<pro>Table`: 修复 buttons 不存在时 summaryBar 不渲染的问题。
- 🐞 `<pro>Pagination`: 修复页码 undefined 快速跳转报错问题。
- 🐞 `<pro>Pagination`: 修复页码切换时 modifiedCheckMessage 无效问题。
- 🐞 `<pro>Modal`: 修复在多个 ModalProvider 中分别同时打开多个 Modal 时显示问题。
- 🐞 `<pro>Form`: 修复清空数据源时表单控件值未清空的问题。
- 🐞 `<pro>DataSet.Field`: 修复 dynamicProps 的 defaultValue 属性不生效的问题。
- 🐞 `<pro>DataSet`: 修复 splice 方法的问题。
- 🐞 `<pro>DataSet`: 修复在父级联记录中查找深级联记录的问题。
- 🐞 `<pro>DataSet`: 修复布尔值类型未设置值时默认会设成false。
- 🐞 `<pro>DataSet.Record`: 优化 isExpanded 属性受控。
- 🐞 `<pro>Validator`: 修复 object 类型字段在组合唯一校验时传值的问题。
- 🐞 `<pro>DataSet.Record`: 修复 getCascadeRecords 方法可能会死循环的问题。

## 0.8.78

`2021-01-10`

- 🌟 `configure`: 新增 modalAutoCenter，modalKeyboard，tableKeyboard，tableFilterAdapter，tableFilterSuffix，tableFilterSearchText 全局属性。
- 🌟 `Tabs`: 新增 keyboard 属性。
- 🌟 `<pro>Select`: 新增 noCache 属性。
- 🌟 `<pro>Table`: 新增更多的表单快捷键。
- 🌟 `<pro>Table`: 新增 queryBar 类型 filterBar 筛选条。
- 🌟 `<pro>CodeArea`: 新增 editorDidMount 属性。
- 🌟 `<pro>Cascader`: 新增 onChoose, onUnChoose 属性。
- 🌟 `<pro>Modal`: 新增 autoCenter 属性控制居中显示。
- 🌟 `<pro>Modal`: 新增 keyboard 属性控制键盘 esc 关闭。
- 🌟 `<pro>Cascader`: 新增 changeOnSelect 属性控制可以满足父亲节点选择。
- 🌟 `<pro>DatePicker`: 新增 renderExtraFooter extraFooterPlacement 属性。
- 💄 `configure`: 优化 lookupCache 全局配置。
- 💄 `<pro>DataSet`: 优化 getText 属性。
- 💄 `<pro>Table`: 优化虚拟滚动固定列宽度及样式。
- 💄 `<pro>Select`: 优化选项 disabled 状态渲染问题。
- 💄 `<pro>Cascader`: 优化 Cascader 无选项的展示效果。
- 💄 `<pro>DatePicker`: 优化 DatePicker 中 DateTimePicker 的时间选择操作。
- 🐞 `Tabs`: 修复 Tab 在小屏幕上无法滚动问题。
- 🐞 `message`: 修复 message 导致的 Pro Feedback 组件请求报错节点插入错误。
- 🐞 `<pro>Lov`: 修复 bind 字段前置无法赋值问题。
- 🐞 `<pro>CheckBox`: 修复 CheckBox 受控使用方式问题。
- 🐞 `<pro>Output`: 修复值为 0 渲染为空的问题。
- 🐞 `<pro>Output`: 修复字段类型为 number 时值集渲染问题。
- 🐞 `<pro>FormField`: 修复校验 label 渲染问题。
- 🐞 `<pro>FormField`: 修复多选出现多个校验提示问题。
- 🐞 `<pro>Table`: 修复 multipleLine 模式下多字段冲突问题。
- 🐞 `<pro>Table`: 修复 tree 模式下点击查询出现自动触发 onExpand 问题。
- 🐞 `<pro>Table`: 修复 Table 头部低分辨率在 autoHeight 下面出现的错位问题。
- 🐞 `<pro>Table`: 修复在 useColon 的情况下，label 位置出现小部分错位的问题。
- 🐞 `<pro>DatePicker`: 修复在 range 情况下，清除设置不正常的情况。
- 🐞 `<pro>PerformanceTable`: 修复在 Modal 中滚动高度计算错误问题。
- 🐞 `<pro>Tooltip`: 修复在 bottom top 情况下，可能出现箭头不与目标中心对其的情况的问题。

## 0.8.77

`2020-12-09`

- 🌟 `<pro>NumberField`: 新增 longPressPlus 属性控制长按累加。
- 🌟 `<pro>Output`: 新增 currency 属性处理货币类型渲染。
- 🌟 `<pro>Lov`: 新增 popupContent 回调属性处理自定义查询下拉事件交互。
- 🌟 `<pro>Table`: 新增 autoFootHeight 属性控制单独处理 column footer。
- 💄 优化导出类型和枚举类型。
- 💄 `<pro>Cascader`: 优化多选选中样式。
- 💄 `<pro>Cascader`: 优化单选重复选择逻辑。
- 💄 `<pro>Table`: 优化 ProfessionalBar 查询输入条件回车触发查询。
- 🐞 `<pro>Tooltip`: 修复无法复制内容问题。
- 🐞 `<pro>Table`: 修复 Table tooltip 无法自动弹出问题。
- 🐞 `<pro>Table`: 修复 Table 设置自动高度为 maxHeight 高度计算和滚动异步问题。
- 🐞 `<pro>SelectBox`: 修复 optionRenderer 属性无效问题。

## 0.8.76

`2020-11-24`

- 🌟 `configure`: 新增 tableAutoFocus 全局属性。
- 🌟 `<pro>Select`: 多选模式新增反选功能。
- 🌟 `<pro>Lov`: 新增 lovEvents 属性处理 lov 数据源事件。
- 🌟 `<pro>Table`: 新增 expandIconAsCell 属性控制展开 icon 是否独占一列。
- 🌟 `<pro>Table`: 新增 autoFocus 属性控制是否新增行自动获焦至第一个可编辑字段。
- 🌟 `<pro>PerformanceTable`: 新增 showScrollArrow，clickScrollLength 属性，控制滚动条是否显示箭头点击。
- 💄 `<pro>FormField`: 优化当值为多选时候 validator 配置后也可以展示错误信息。
- 💄 `<pro>Lov`: 优化 lov tableProps 属性兼容 onRow。
- 💄 `<pro>TextField`: 优化 placeholder 超出宽度显示。
- 💄 `<pro>Table`: 优化多行 label 不存在时渲染占位问题。
- 🐞 `Collapse`: 修复 collapseExpandIcon 全局属性支持。
- 🐞 `TreeSelect`: 修复 TreeSelect 值为 undefined 导致的控制台报错。
- 🐞 `Modal`: 修复 Modal 关闭按钮位置错位问题。
- 🐞 `<Pro>Field`: 修复 fetchLookup lookupData 更新错误。
- 🐞 `<pro>Table`: 修复 Table 设置自动高度为 maxHeight 出现的列表错位问题。

## 0.8.75

`2020-11-01`

- 🌟 `<pro>IconPicker`: 新增 customFontName 属性以及相关配置。
- 🌟 `<pro>Table`: 新增 summaryBar，summaryFieldsLimit 属性，支持头部汇总条。
- 💄 `<pro>Modal`: 优化 header 样式。
- 💄 `<pro>TextField`: 优化 IE 下输入框包含 readOnly 属性导致键盘 BackSpace 页面后退。
- 🐞 `<pro>Tree`: 修复 Tree 文字不对齐问题。
- 🐞 `<pro>DataSet`: 修复缓存数据无法删除问题。
- 🐞 `<pro>Button`: 修复 button link 链接样式问题。
- 🐞 `<pro>Table`: 修复 table 头行处理新增行自动定位失效问题。
- 🐞 `<pro>Table`: 修复 autoHeight type:maxHeight 高度问题。
- 🐞 `<pro>Table`: 修复 table 出现滚动条 tree 模式下展开行自动收起的问题。
- 🐞 `<pro>Table`: 修复 table filterBar 输入后直接点击 clearButton 失效问题。
- 🐞 `<pro>Select`: 修复复合模式下中文输入法无法生成选项问题。
- 🐞 `<pro>Table`: 修复 table 组合列宽度调整，如果拖动多列后的单列会出现下一列表宽度异常。
- 🐞 `<pro>Table`: 修复出现横向滚动条时多行模式 lock 列错位问题。


## 0.8.74

`2020-10-14`

- 🌟 `Statistic`: 新增 Statistic 组件展示统计数据和描述。
- 🌟 `TreeSelect`: 新增 maxTagCount，maxTagPlaceholder，maxTagTextLength 属性。
- 🌟 `<pro>Screening`: 新增 Screening 组件。
- 🌟 `<pro>Field`: 新增 nonStrictStep 属性。
- 🌟 `<pro>Field`: 新增 multiLine 属性，支持 Table 单元格多行展示编辑。
- 💄 `<pro>Form`: 优化 Form 布局间隔配置。
- 💄 `<pro>Dropdown`: 支持 getPopupContainer 属性。
- 💄 `Table`: 修改拖拽 demo，升级 react-dnd ^11。
- 🐞 `<pro>Skeleton`: 重命名 skeletonTitle 属性。
- 🐞 `<pro>Select`: 修复 ie 下 Select 闪动问题。
- 🐞 `<pro>Select`: 修复 ie 下 Upload 与 Button 无法对齐。
- 🐞 `<pro>Table`: 修复 autoHeight 属性下横向滚动错位问题。
- 🐞 `<pro>Pagination`: 修复输入页面的时候，快速跳转框里面的数字不会自动清除。
- 🐞 `<pro>PerformanceTable`: 修复在 Tabs 中使用偶发的滚动条宽度计算错误问题。
- 🐞 `<pro>TextField`: 修复在多个 modal 下面低层级的 modal 框里面 input 没有被覆盖会导致重叠。
- 🐞 `<pro>NumberField`: 修复在绑定了数据源的情况下step无法进行正常的校验的问题。


## 0.8.73

`2020-09-21`

- 🌟 `configure`: 新增 drawerOkFirst 全局配置。
- 🌟 `Icon`: 新增 customFontName 属性满足当客户自定字体图标时候使用。
- 🌟 `<pro>Table`: 新增专业查询条 TableProfessionalBar。
- 🌟 `<pro>Table`: 添加 exportMode 属性 client 模式可以实现前端导出表格。
- 💄 `<pro>PerformanceTable`: 优化多语言展示，默认 bordered 开启。
- 💄 `<pro>PerformanceTable`: 优化 title 支持函数返回。
- 💄 `<pro>Table`: 优化查询条件未通过时点击查询出现 loading 效果。
- 💄 `<pro>Table`: 优化 TableButtonProps 类型,现在可以在 ts 中正确的使用 children 来改变预设按钮的文字。
- 🐞 `<pro>FormField`: 修复级联模式错误禁用子组件。
- 🐞 `<pro>Table`: 修复可编辑行自动定位至单选框问题。
- 🐞 `<pro>Table.advancedBar`: 修复高级搜索条多选清除 tag 渲染 undefined 问题。
- 🐞 `<pro>Switch`: 修复 Switch 在 labelLayout 等于 float 的时候出现表头丢失问题。

## 0.8.72

`2020-09-07`

- 🌟 `configure`: 新增 lovModalProps 全局配置。
- 🌟 `Progress`: 新增 showPointer 属性。
- 🌟 `<pro>Cascader`: 新增 Cascader 单列表模式。
- 🌟 `<pro>RichText`: 新增 RichText 富文本编辑组件。
- 🌟 `<pro>Table`: 新增拖拽放置前事件回调 onDragEndBefore。
- 💄 `Progress`: 更新 format 属性定义。
- 💄 `Breadcrumb`: 优化 Breadcrumb 符合 MD 设计。
- 💄 `<pro>Modal`: 优化 drawer 模式下 okFirst 属性。
- 💄 `<pro>Lov`: noCache 模式下面重新打开弹窗重置分页数。
- 🐞 `<pro>Upload`: 修复当使用 beforeUpload 和 uploadImmediately 导致文件类型报错。
- 🐞 `<pro>TextField`: 修复 Select Text 等在多值输入时遮盖问题。
- 🐞 `<pro>FormField`: 修复多选级联模式清空未禁用子组件。
- 🐞 `<pro>Table`: 修复 inline 模式下面无法显示 Tooltip。
- 🐞 `<pro>Table`: 修复 Column 错误的 children 类型,该错误会导致在 TS 中无法使用组合列。
- 🐞 `<pro>NumberField`: 修复在 Table 中使用的时候在某些情况下上下箭头会失效的问题。
- 🐞 `<pro>FormField`: 修复在 Form 中子组件的 newLine 属性在 TypeScript 中类型出现报错的问题。
- 🐞 `<pro>DatePicker`: 修复 DatePicker 中设置 readonly ,但依旧可以让光标显示的问题。
- 🐞 `Table`: 修复基础 Table 出现的展开 icon 无法响应展开事件。
- 🐞 `Tabs`: 修复在 Modal 中使用的时候当设置的 defaultActiveKey 不为第一个的时候, activeBar 的位置不正确的问题。


## 0.8.71

`2020-08-21`

- 🌟 `configure`: 新增 numberFieldFormatter, numberFieldFormatterOptions 全局配置，renderEmpty文档修改。
- 🌟 `Upload`: 新增 dragUploadList，onDragEnd 属性。
- 🌟 `Breadcrumb`: 新增 breadcrumbItem menuList overlay 属性。
- 🌟 `Cascader`: 新增 Cascader menuMode 单弹框属性，支持singleMenuStyle，singleMenuItemStyle，singlePleaseRender，singleMenuItemRender 属性配置。
- 🌟 `<pro>Lov`: 新增 paramMatcher 参数匹配器属性。
- 🌟 `<pro>NumberField`: 新增 formatter, formatterOptions 属性。
- 🌟 `<pro>Table`: 新增 columnsMergeCoverage columnsOnChange columnsEdictType 属性实现表头修改。
- 💄 修改 peerDependencies 中 mobx-react 依赖限制。
- 💄 `<pro>Table`: 优化排序交互，增加点击切换中间态。
- 💄 `<pro>Table`: 可编辑行自动定位至第一个可编辑单元格。
- 💄 `<pro>FormField`: 优化 label 类型,可以同时接收 string 以及 ReactNode。同时修改了 DataSet.Field Props label 类型。
- 🐞 `Steps`: 修复 Steps typescript 报错问题。
- 🐞 `DatePicker`: 修复 disabled 在 icon 上不生效的问题。
- 🐞 `<pro>Form`: 修复 useColon 与全局配置的冲突。
- 🐞 `<pro>Table`: 修复拖拽样式问题，添加拖拽渲染行例子。
- 🐞 `<pro>Table`: 修复表头文字长度过长导致排序以及提示 icon 不可见。
- 🐞 `<pro>TriggerField`: 修复 getPopupContainer API。
- 🐞 `<pro>TextArea`: 修复 TextArea 组件必输、禁用样式问题。
- 🐞 `<pro>DatePicker`: 修复 TimePicker 在 Firefox 下无法滚动的问题。
- 🐞 `<pro>FormField`: 修复 _inTable 下给 Fragment 设置了属性的错误。
- 🐞 `<pro>TextField`: 修复 TextField 在中文输入无法正确的控制 maxLength 的问题，并优化中文输入体验。

## 0.8.69

`2020-08-07`

- 🌟 `configure`: 新增 numberFieldNonStrictStep 全局配置。
- 🌟 `ImageCrop`:新增 AvatarUpload 头像上传组件。
- 🌟 `<pro>NumberField`: 新增 nonStrictStep 属性。
- 💄 `Select`: 优化 Select tags 样式。
- 💄 `<pro>Form`: 优化 Form readOnly 类名。
- 🐞 `Menu`: 修复下拉键盘事件报错。
- 🐞 `<pro>PerformanceTable`: 修复 Scrollbar 重渲染计算规则。
- 🐞 `<pro>TextField`: 修复在 table 中使用 addon 出现宽度超出。
- 🐞 `<pro>Table`: 修复 table Tree 中使用 expandField 绑定逻辑操作错误。
- 🐞 `<pro>Table`: 修复在 table 中对 CheckBox 以及 Switch 进行校验的时候会有两个校验框的错误。

## 0.8.68

`2020-07-28`

- 🌟 `Result`: 新增 Result 组件。
- 🌟 `ImageCrop`: 新增 ImageCrop 组件。
- 🌟 `Upload`: 新增 requestFileKeys 上传文件属性。
- 🌟 `configure`: 新增 `textFieldAutoComplete`, `resultStatusRenderer`, `tableEditorNextKeyEnterDown`, `tableDragRow`, `tableDragColumn`, `tableDragColumnAlign` 全局配置。
- 🌟 `<pro>PerformanceTable`: 新增 PerformanceTable 组件。
- 🌟 `<pro>DataSet`: 新增 DataSet validate 校验事件。
- 🌟 `<pro>Form`: 新增提交校验自动定位到校验未通过组件功能。
- 🌟 `<pro>Table`: 新增 table tree 展开类名。
- 🌟 `<pro>Table`: 新增提交校验自动定位到校验未通过单元格功能。
- 🌟 `<pro>Table`: 新增控制行内编辑器回车跳转下一行编辑器属性 editorNextKeyEnterDown。
- 🐞 `<pro>Table`: 修复在 IE 浏览器下滑动条回弹问题。
- 🐞 `<pro>Table`: 修复使用 inline 模式出现 lookup 自动收起问题。
- 🐞 `<pro>Table`: 修复 table autoHeight 为auto时候出现样式问题。
- 🐞 `<pro>Table`: 修复在 IE && 火狐浏览器下 scrollIntoViewIfNeeded 方法兼容性问题。
- 🐞 `<pro>Table`: 修复在 autoHeight 属性 type: maxHeight 下固定列滑动不同步问题。
- 🐞 `<pro>Table`: 修改了 useMouseBatchChoose 的判定机制，修复在全局设置与组件设置优先级问题。
- 🐞 `<pro>Form`: 修改了在冒号模式下,必填项与非必填项的label颜色不一致的问题。
- 🐞 `<pro>Button`: 修改 loading 机制，修复 query 按钮在 Table 中不进入 loading 状态的问题。
- 🐞 `<pro>TextArea`: 修复在 Form 中同时设置了 required 跟 resize 属性后，背景色不跟着宽高一起变化的问题。


## 0.8.67

`2020-07-14`

- 🌟 `<pro>Table`: 新增Table拖拽功能。
- 🌟 `Steps`: 新增 Steps.Group 组件可以配置Step分组。
- 🌟 `configure`: 新增 collapseExpandIconPosition, collapseExpandIcon, collapseTrigger 全局配置。
- 🌟 `Collapse`: 新增 expandIcon, expandIconPosition, trigger 属性。
- 🌟 `<pro>Select`: 新增 commonItem, maxCommonTagPlaceholder, maxCommonTagCount, maxCommonTagTextLength 常用项相关属性。
- 🐞 `Progress`: 修复无法修改 Circle Progress strokeColor属性颜色的问题。
- 🐞 `<pro>DatePciker`: 文档修复。
- 🐞 `<pro>Select`: 修复点击全选按钮导致禁用选项也被勾选的问题。
- 🐞 `<pro>Form`: 修复当设置 useColon为true, labelLayout为vertical 的时候 required 的字段 label 显示不正确的问题.
- 🐞 `<pro>Form`: 修复在 typescript 中使用的 Form 的时候,无法使用 pristine 属性的问题.
- 🐞 `<pro>Lov`: 修复在单选模式下lov table自动定位到数据第一条并且在显示rowbox的情况点击确定会选择current作为选项即使此时没有选中选项.
- 🐞 `<pro>DataSet`: 修复在设置了primaryKey的情况下,在新增一条未提交的情况下删除一条数据,当接口返回204时,会将response作为数据填入到record中的问题。

## 0.8.66

`2020-06-28`

- 🌟 `configure`: 新增 lovTableProps 属性全局配置。
- 💄 `Icon`: 更新 Icon 列表。
- 🐞 `<pro>Lov`: 修复当blur的时候触发了 onChange 事件的问题。
- 🐞 `<pro>Lov`: 调整tableProps中selectionMode的优先级为最高.
- 🐞 `<pro>Select`: 修复 Select 对于 restrict 的效果支持, 实现文字输入限制。
- 🐞 `<pro>Select`: 修复 Select 在 IE 无法使用 element.scrollTo 的方法。
- 🐞 `<pro>Form`: 修复 Form 中只有单个的 FormVirtualGroup 的时候没有 label 的问题。
- 🐞 `<pro>Table`: 修复 autoLocateFirst 在table切换页面时候也存在自动定位第一条问题。
- 🐞 `<pro>Table`: 修复设置 mask 为 false 的情况下隐藏 modal 后 body 未恢复滚动的问题。

## 0.8.65

`2020-06-15`

- 🌟 `configure`: 新增 tableDefaultRenderer 属性。
- 🌟 `<pro>Form`: 新增 FormVirtualGroup 子组件。
- 🌟 `<pro>DataSet`: 新增 modifiedCheckMessage 属性。
- 💄 `<pro>Table`: 修改 handleSelection 触发时机，导出 modal添加 closable。
- 💄 `<pro>Form`: 新增 FormVirtualGroup 子组件。
- 🐞 修复 select lov 等组件的 suffix icon 消失的问题。
- 🐞 `<pro>Table`: 修复 alwaysShowRowBox 优先级问题。
- 🐞 `<pro>TextArea`: 修复 TextArea autofocus 无效问题。
- 🐞 `<pro>DatePicker`: 修复range模式下设置disabled后点击第二个input依旧会弹出选择框的问题。

## 0.8.64

`2020-06-10`

- 🌟 `Avatar`: 增加 alt 属性描述。
- 🌟 `DatePicker`: 增加 onPanelChange, mode 属性描述。
- 🌟 `Progress`: 增加 strokeColor 属性。
- 🌟 `Table`: 增加 pagination 全局配置和导出例子。
- 🌟 `Switch`: 增加 checkedValue, unCheckedValue 属性。
- 🌟 `TreeSelect`: 新增 searchValue 和 autoClearSearchValue 属性。
- 🌟 `Modal`: 增加 keyboard, okButtonProps, cancelButtonProps 属性。
- 🌟 `<pro>Cascader`: 新增 Cascader Pro 组件。
- 🌟 `<pro>AutoComplete`: 新增 AutoComplete Pro 组件。
- 🌟 `<pro>Form`: 新增 useColon, excludeUseColonTagList 属性以及全局配置。
- 🌟 `<pro>Table`: 新增 autoMaxWidth 属性实现双击自适应最大宽度以及导出案例。
- 🌟 `<pro>Table`: 新增 alwaysShowRowBox 属性以及全局配置 tableAlwaysShowRowBox。
- 🌟 `<pro>Table`: 新增 useMouseBatchChoose 属性以及全局配置 tableUseMouseBatchChoose。
- 🌟 `<pro>Pagination`: 增加 pagination pager 的类名区别。
- 🐞 修复基础组件 input,form, autoComplete 的样式问题。
- 🐞 `Table`: 修复table 勾选后样式无法取消。
- 🐞 `Cascader`: 修复 Cascader 缺失展开符号的问题。
- 🐞 `Pagination`: 修复pagination在不同size下样式错位问题。
- 🐞 `<pro>Table`: 修复 Table 中 pagination 可以输入pageSize的问题。
- 🐞 `<pro>Form`: 修复 Form 单行 colSpan 不生效问题。
- 🐞 `<pro>Select`: 修复 ie11 设置 dropdownMatchSelectWidth 文字显示不全。
- 🐞 `<pro>Table`: 修复在非 rowbox 模式下,对点击已选择的内容无法取消选择的问题以及hover类在current行上不被添加的问题。

## 0.8.63

`2020-05-24`

- 🌟 `configure`: 新增 dropdownMatchSelectWidth, lovTriggerMode 属性全局配置。
- 🌟 `<pro>Table`: 新增 autoHeight 属性，支持高度自适应。
- 🌟 `<pro>Trigger`: 新增 getPopupContainer 属性。
- 🌟 `<pro>Lov`: 新增 tableProps triggerMode 属性。
- 🌟 `<pro>Modal`: 新增 mask, maskStyle, maskClass 属性，支持Modal自定义遮罩样式。
- 💄 `<pro>Table`: 优化切换 pageSize 未保存提示。
- 🐞 `<pro>DatePicker`: 修复 range 模式下必输校验错误问题。
- 🐞 `<pro>Lov`: 修复未关闭路由切换后无法打开问题。
- 🐞 `<pro>Table.FilterSelect`: 修复 FilterSelect 编辑器下拉宽度。
- 🐞 `<pro>CodeArea`: 修复在绑定dataSet的情况下,手动修改过codeArea中的数据后使用record.set更新数据但是组件视图不更新的问题。
- 🐞 `<pro>Form`: 修复 Form disabled 由 true 改为 false 后，TextField & TextArea 只读的问题。

## 0.8.62

`2020-05-11`

- 🌟 `configure`: 新增 tableSelectedHighLightRow 属性。
- 🌟 `<pro>Table`: 添加 tree Table 对于分页的支持.
- 🌟 `<pro>Table`: 添加 selectedHighLightRow 属性，支持勾选行高亮。
- 💄 优化在create-react-app中使用的文档。
- 🐞 `<pro>Table`: 修复 filterBar 下拉样式。
- 🐞 `<pro>Table`: 修复使用 column 属性支持不全面。
- 🐞 `<pro>SelectBox`: 修复 DataSet 必输控制样式。
- 🐞 `<pro>DatePicker`: 修复 max/min 限制清空之后不可选问题。
- 🐞 `<pro>DatePicker`: 修复 range 模式下清除后无法继续选值及弹窗交互问题。
- 🐞 `<pro>Trigger`: 修复双击选择后失去焦点弹出框重新弹出的问题。

## 0.8.61

`2020-04-28`

- 🌟 `<pro>Currency`: 添加精度控制 demo。
- 🌟 `<pro>Table`: 添加切换字段编辑器（lov / select）demo。
- 🌟 `<pro>Tree`: 添加 TreeNodeRenderer 属性支持客制化 tree node 结点渲染。
- 💄 `AutoComplete`: 优化 dataSource 属性的类型。
- 💄 `<pro>Tree`: 优化了 treePro, 使用treeData来构造子节点。
- 🐞 `<pro>Form`: 修复 label 样式。
- 🐞 `<pro>Upload`: 修复上传成功response解析问题。
- 🐞 `<pro>DatePicker`: 修复多选出现无法赋值的问题。
- 🐞 `inputNumber`: 修复数字输入框银行家舍入改为四舍五入。
- 🐞 `<pro>Select`: 修复 dropdownMatchSelectWidth 属性无效的问题。
- 🐞 `<pro>Table`: 修复虚拟滚动下 table 的居右的表格出现滚动条空白问题。

## 0.8.60

`2020-04-21`

- 🌟 `<pro>IntlField`: 新增 maxLengths 属性。
- 🌟 `<pro>Table`: 新增 virtual 属性，支持虚拟滚动，新增demo。
- 🐞 `<pro>Table`: 修复新增行横向滚动 lock 列错误错位问题。
- 🐞 `<pro>DatePicker`: 修复选择后 onChange 多次触发的问题。
- 🐞 `<pro>Tooltip`: 修复 Button disabled 状态下不触发问题。
- 🐞 `<pro>Tree`: 修复当 Tree 使用 DataSet.remove 后 tree 子结点没有没删除。
- 🐞 `<pro>Field`: 修复 DataSet 的 Field 无法获取 valueField 和 textField 默认值的问题。
- 🐞 `Collapse.CollapsePanel`: 修复 CollapsePanel TS 使用问题。
- 🐞 `<pro>Trigger`: 修复 Trigger IE11 下点击滚动条导致弹出框消失的问题。

## 0.8.59

`2020-04-01`

- 🐞 `TreeSelect`: 修复样式和tree check事件错误。
- 🐞 `<pro>Tooltip`: 修复 button disabled 状态下无法触发显示。
- 🐞 `<pro>TextArea`: 修复 autoSize 属性。
- 🐞 `<pro>CodeArea`: 修复失焦更新错误。
- 🐞 `<pro>Pagination`: 修复分页计算错误。
- 🐞 `<pro>Table.pagination`: 修复 `pageSizeOptions` 修改报错。
- 🐞 `<pro>DataSet`: 修复提交失败后 current 指向问题。

## 0.8.58

`2020-03-27`

- 🌟 `Icon`: 增加新的图标。
- 🌟 `Tree`: 支持虚拟滚动。
- 🌟 `Tree`: 新增 onLoad 回调。
- 🌟 `Tree`: 新增 treeDatatreeNodes, treeData, blockNode 属性。
- 🌟 `Tree.TreeNode`: 新增 checkable 属性。
- 🌟 `Tree.DirectoryTree`: 新增内置的目录树。
- 🌟 `Skeleton`: 新增Skeleton组件。
- 🌟 `configure`: 新增 tableSpinProps 全局配置。
- 🌟 `<pro>Spin`: 新增绑定数据源demo。
- 🌟 `<pro>DataSet.Field`: 新增 disabled 属性。
- 🌟 `<pro>DataSet.Field`: 扩展 step 属性，用于时间组件的步距限制。
- 🌟 `<pro>TimePicker`: format 和 step 能影响组件的显示。
- 🌟 `<pro>Table`: 扩展 spin 配置，新增 spin & custom inline demo。
- 🌟 `<pro>Skeleton`: 新增 Skeleton Pro 组件。
- 🌟 `<pro>Tree`: 支持虚拟滚动。
- 🌟 `<pro>Tree`: 新增 defaultExpandAll, defaultExpandedKeys, defaultCheckedKeys, defaultSelectKeys 属性。
- 🌟 `<pro>TextArea`: 新增 autoSize属性。
- 🌟 `<pro>Pagination`: 新增 hideOnSinglePage 属性。
- 🌟 `<pro>Upload`: 新增 beforeUpload, onRemoveFile 回调。
- 🌟 `<pro>Upload`: 新增 defaultFileList, uploadFileList, withCredentials, appendUpload, partialUpload 属性。
- 💄 `<pro>Table`: 优化 table tooltip、table border-bottom 样式问题。
- 💄 `<pro>Upload`: 完善Upload文档。
- 💄 `<pro>LocaleContext`: 优化日语配置, 完善文档。
- 💄 `<pro>Pagination`: 优化 showTotal, showQuickJumper 属性。
- 💄 `<pro>DataSet`: 优化 autoLocateAfterRemove, 删除失败后重置保留选中状态并定位到删除项第一条。
- 🐞 `Spin`: 修复 size 属性无效问题。
- 🐞 `<pro>Upload`: 修复 IE 11 兼容问题。
- 🐞 `<pro>Table`: 修复 editor 属性类型定义。
- 🐞 `<pro>Table`: 修复 filterBar 值集类型选择值 undefined。
- 🐞 `<pro>DataSet.Field`: 修复动态属性空值判断比较。
- 🐞 `<pro>TimePicker`: 修复 chrome 下鼠标滚轮报错的问题。

## 0.8.57

`2020-03-12`

- 🌟 `<pro>Lov`: 添加 queryBar, fieldProps 配置。
- 🌟 `<pro>DataSet`: 新增 cascadeParams 属性。
- 🌟 `<pro>Field`: 添加 Form 下 Tooltip 特有样式名称。
- 💄 `<pro>DataSet`: 优化 ready 方法的性能。
- 💄 `<pro>DataSet.Record`: 使用 merge 方法来回写 object 类型字段。
- 🐞 `<pro>DatePicker`: 修复 DatePicker 设置默认值时，最大值日期无法选择最小默认值问题。
- 🐞 `<pro>CodeArea`: 修复 CodeArea text 受控问题。
- 🐞 `<pro>SelectBox`: 修复 SelectBox multiple disable 状态无法查看文本。
- 🐞 `<pro>DataSet`: 修复校验未应用 dataToJSON 配置。
- 🐞 修复全量依赖样式时基础组件和 pro 组件存在同名预变量冲突的问题。
- 🐞 `<pro>Lov`: 修复通过 dynamicProps 获得 lovCode 时，lov 配置中的 valueField 和 textField 无效的问题。
- 🐞 `<pro>Select`: 修复 lovCode 字段类型为 string 时无选项的问题。
- 🐞 `<pro>TableEditor`: 修复表格的 editor 在弹框中，然后变更窗口大小，会定位不对的问题。

## 0.8.56

`2020-02-18`

- 🌟 添加 xhr-mock mock 配置供测试使用。
- 🐞 `<pro>Button`: 修复演示样式显示不全的问题。
- 🐞 `<pro>Table`: 修复行内编辑 Lov 渲染问题。

## 0.8.55

`2020-02-13`

- 🌟 `<pro>Table`: 添加 table spin indicator 属性配置。
- 🐞 修复在线数据 mock 问题。
- 🐞 `<pro>Table.queryBar`: 修复 queryBar 过滤条错误渲染 bind 字段。
- 🐞 `<pro>Table`: 修复 table 出现的浮动列高度不对齐问题。
- 🐞 `<pro>Pagination`: 修复 pagination disabled 属性配置。
- 🐞 `<pro>Lov`: 修复 DataSet 重新实例化后 lovQueryAxiosConfig 中获得的 record 是旧 DataSet 实例的记录的问题。

## 0.8.54

`2020-01-20`

- 🐞 `<pro>NumberField`: 修复校验问题。
- 🐞 `<pro>NumberField`: 修复 range 值不能通过键盘删除的问题。

## 0.8.53

`2020-01-19`

- 🌟 `<pro>NumberField`: 实装 range 属性。
- 🐞 `<pro>DataSet.Record`: 修复 toJSONData 丢失 \_\_id 属性的问题。
- 🐞 `<pro>DataSet.Field`: 修复 type 为 object 时， transformRequest 不起作用的问题。

## 0.8.52

`2020-01-17`

- 🌟 `configure`: 新增 tableButtonProps、tableCommandProps、buttonColor 属性。
- 🌟 `<pro>Table`: TableButton 和 TableCommand 的内置按钮可添加 afterClick 钩子， 用于执行除了默认行为外的动作。

## 0.8.51

`2020-01-16`

- 🌟 `<pro>ModalProvider`: 新增 ModalProvider 组件。
- 🌟 `<pro>Upload`: 新增 showUploadList 属性。
- 🌟 `<pro>DataSet.Field`: transformRequest 和 transformResponse 新增参数。
- 💄 修改 jest 配置，更新快照。
- 🐞 `<pro>Select`: 修复动态查询 lookup 选项重复问题。
- 🐞 `<pro>DataSet`: 修复多层级联的问题。

## 0.8.50

`2020-01-07`

- 🐞 修复在线代码编辑器。
- 🐞 `Tree`: 修复 disabled 状态下 defaultCheckedKeys 失效的问题。
- 🐞 `<pro>Lov`: 修复唯一校验不显示错误的问题。

## 0.8.49

`2019-12-30`

- 🌟 `<pro>DataSet.Record`: 新增 setState、getState 方法。
- 💄 `<pro>DataSet.Field`: 优化 options 属性。
- 💄 `<pro>ViewComponent`: 优化 onBlur 钩子可根据 preventDefault 阻止失焦。
- 🐞 `Transfer`: 修复 icon。
- 🐞 `<pro>DataSet`: 修复 dataToJson 为 normal 时, 仅删除记录的情况下状态不为 dirty 的问题。
- 🐞 `<pro>DataSet`: 修复级联的问题。

## 0.8.48

`2019-12-23`

- 🌟 `<pro>Table`: 开放 Table queryBar 组件。
- 🌟 `<pro>Pagination`: 新增 showQuickJumper 属性。
- 🐞 `<pro>DataSet.Record`: 修复 status 错误导致 dirty 错误问题。
- 🐞 `<pro>Select`: 修复 multiple 的 Select 全选按钮会将过滤掉的记录选中的问题。

## 0.8.47

`2019-12-15`

- 🐞 `<pro>DataSet.Field`: 修复 dynamicProps 中对象参数含有函数时死循环的问题。
- 🐞 `<pro>DataSet.Record`: 修复在级联情况下树形节点的 parent 和 children 不正确的问题。
- 🐞 `<pro>DataSet`: 修复 dataToJSON 为 normal, 提交数据回写失败的问题。

## 0.8.46

`2019-12-09`

- 🌟 `configure`: 新增 lookupBatchAxiosConfig 属性。
- 🌟 `<pro>DataSet`: 新增 dirty 属性, 废弃 isModified 方法。
- 💄 `<pro>DataSet.Record`: 优化 dirty 属性, 其包含级联数据是否变更。
- 🐞 `<pro>Table`: 修复 Table 树形结构右固定列展开图标问题。

## 0.8.45

`2019-12-07`

- 🐞 `Progress`: 修复 Progress IE 动画样式。
- 🐞 `<pro>DataSet.Field`: 修复 dynamicProps 中对象参数死循环。

## 0.8.44

`2019-12-05`

- 🌟 `<pro>DataSet`: 新增 dataToJSON 属性, 废弃 toJSONData 等方法的参数。
- 🐞 `<pro>FormField`: 修复 cascadeMap 参数值为 0/false 禁用子级的问题。
- 🐞 `<pro>Select`: 修复多选模式下取消勾选选项消失的问题。
- 🐞 `<pro>DatePicker`: 修复 dateTime mode 下仅选择时间未更新值的问题。
- 🐞 `<pro>DatePicker`: 修复 week mode 下跨年选周显示问题以及禁止输入。

## 0.8.43

`2019-12-02`

- 🐞 `<pro>DataSet`: 修复 splice 方法的问题。

## 0.8.42

`2019-12-01`

- 🌟 `<pro>DataSet`: 新增 autoLocateAfterCreate 属性。
- 🐞 `<pro>DataSet.Field`: 修复 min / max 校验类型判断。

## 0.8.41

`2019-11-27`

- 🌟 `<pro>DataSet`: 新增 remove 事件。
- 🌟 `<pro>DataSet`: 新增 autoLocateAfterRemove 属性。
- 💄 `<pro>DataSet`: 优化 remove 方法的性能。

## 0.8.40

`2019-11-22`

- 🐞 修复循环依赖的问题。
- 🐞 `<pro>Table`: 修复 time 类型字段编辑器的问题。

## 0.8.39

`2019-11-22`

- 🌟 `<pro>Modal`: 新增 drawerTransitionName 属性。
- 💄 `<pro>DataSet.Field`: 调整 textField 和 valueField 优先级高于 Lov 配置中的值。
- 🐞 `<pro>CheckBox`: 修复 Table 勾选框在 IE11 上的样式问题。
- 🐞 `<pro>Table`: 修复数字编辑器进度丢失的问题。
- 🐞 `<pro>Select`: 修复非复合搜索模式下生成 option 并可点击的问题。
- 🐞 `<pro>DataSet.Field`: 修复 dynamicProps 中 lookupUrl 相关属性不起作用的问题。

## 0.8.38

`2019-11-18`

- 🌟 `Upload`: 新增 onSuccess, onProgress, onError 属性。
- 🐞 `<pro>Table`: 修复 filterBar 的一些问题。

## 0.8.37

`2019-11-13`

- 💄 `<pro>CodeArea`: 更新各语言 lint 的例子。
- 🐞 `<pro>Table`: 修复编辑中的值在切换行时会更新到新行的问题。
- 🐞 `<pro>NumberField`: 修复 max 和 min 为字段名时不校验的问题。
- 🐞 `<pro>Lov`: 修复 valueField 设置不正确时控件上会显示弹出框中第一条数据的 textField 值的问题。
- 🐞 `<pro>Table.Column`: 修复 editor 钩子返回值为 true 时编辑器失效的问题。

## 0.8.36

`2019-11-11`

- 🌟 `configure`: 新增 tableExpandIcon 属性。
- 🌟 `<pro>Table`: 新增 expandIcon 属性。
- 💄 `<pro>CodeArea`: 更新 json 格式化的例子。
- 🐞 `<pro>Table`: 修复在 Modal 中不显示横向滚动条的问题。

## 0.8.35

`2019-11-08`

- 🌟 `<pro>Table`: selectionMode 新增 mousedown 模式。
- 💄 `<pro>Table`: 优化行内编辑模式下的新增记录。
- 🐞 `<pro>DataSet.Record`: 修复新增状态的记录重置后状态变为同步的问题。
- 🐞 `<pro>DataSet`: 修复级联行的 autoCreate 不起作用的问题。

## 0.8.34

`2019-11-07`

- 💄 `<pro>Lov`: 弹窗显示关闭图标按钮。
- 💄 `<pro>Validator`: 去除绑定字段校验的逻辑。
- 🐞 `<pro>Lov`: 修复按钮模式下失去焦点时会清空值的问题。
- 🐞 `<pro>Lov`: 修复输入查询在有 cascadeMap 的情况下无结果的问题。
- 🐞 `<pro>Select`: 修复键盘操作报错的问题。
- 🐞 `<pro>Table`: 修复高级过滤条模糊搜索会出现重复值的问题。

## 0.8.33

`2019-11-05`

- 🌟 `configure`: 日期格式化加入全局配置。
- 🌟 `<pro>Table`: 单选按钮可通过点击撤销选择。
- 🌟 `<pro>Table`: 新增 onExpand 属性。
- 🐞 `<pro>IntlField`: 修复单条记录有多个多语言控件时的冲突问题。
- 🐞 `<pro>DataSet.Field`: 动态 lookupUrl 不显示值的问题。

## 0.8.32

`2019-11-05`

- 🌟 `<pro>DataSet.Record`: 新增 init 方法。
- 🌟 `<pro>DataSet.Transport`: tls 钩子增加 record 参数。
- 🐞 `<pro>DataSet.Field`: 动态 lovCode 不显示值的问题。

## 0.8.31

`2019-11-02`

- 🌟 `<pro>DataSet.Transport`: tls 钩子增加字段名 name 参数。
- 💄 `<pro>DataSet.Field`: dynamicProps 钩子将在 v1.0 版本中废弃，请使用 dynamicProps 对象。
- 🐞 `<pro>DataSet`: 修复级联行的更改在头配了 transport.update 而没配 transport.submit 时无法提交的问题。
- 🐞 `<pro>DataSet`: 修复多层级联的问题。
- 🐞 `<pro>Table`: 修复切换 dataset 时，过滤条报错的问题。
- 🐞 `<pro>Table`: 修复树形全选的问题。
- 🐞 `<pro>Lov`: 修复按回车会输入自定义值的问题。

## 0.8.30

`2019-10-31`

- 🌟 `<pro>DatePicker`: 可输入。
- 🌟 `<pro>DataSet`: 新增 feedback 属性。
- 🌟 `<pro>DataSet.Field`: 新增 labelWidth 属性。
- 🌟 `configure`: 新增 lookupCache 属性。
- 💄 `configure`: 优化全局配置 transport 的默认逻辑，由整体配置覆盖改为局部配置覆盖。
- 💄 `<pro>DataSet.Field`: 去除唯一性校验调用接口时分页数必须大于 1 的限制。
- 💄 `<pro>Table`: 优化滚动条。
- 🐞 `<pro>Button`: 修复点击事件无法阻止冒泡的问题。
- 🐞 `<pro>Tooltip`: 修复内容不换行，hidden 属性不受控, defaultHidden 属性不起作用等问题。
- 🐞 `<pro>Lov`: 修复拥有相同 textField 值的多条记录，只能选中其中的第一条的问题。
- 🐞 `<pro>DataSet.Record`: 修复新增状态下也会查询多语言的问题。
- 🐞 `<pro>DatePicker`: 修复 range 模式重置无法清空值的问题。

## 0.8.29

`2019-10-27`

- 💄 `<pro>Field`: 优化 lookup 缓存机制。
- 🐞 `<pro>Select`: 修复使用 lovCode 时，lovQueryAxiosConfig 不起作用的问题。
- 🐞 `<pro>Select`: 修复 searchMatcher 的问题。
- 🐞 `<pro>Table`: 修复行内编辑模式下未编辑状态的行 CheckBox 没禁用的问题。

## 0.8.28

`2019-10-25`

- 🌟 `configure`: 增加全局配置 transport、lookupAxiosConfig、iconfontPrefix、icons。
- 🌟 `Icon`: 可自定义 iconfont 资源。
- 💄 `<pro>DataSet.Field`: 优化 lookupAxiosConfig、lovDefineAxiosConfig、lovQueryAxiosConfig 的相关逻辑。
- 💄 `<pro>Table`: 优化滚动条。
- 🐞 `Alert`: 修复图标不显示的问题。
- 🐞 `<pro>Form`: 修复子元素的 labelWidth 为非数字时的问题。

## 0.8.27

`2019-10-22`

- 🌟 `<pro>Form`: 子元素可设置 labelWidth 属性。
- 🐞 `<pro>Table`: 修复 ResizeObserver loop limit exceeded 错误。
- 🐞 修复循环依赖的问题。
- 🐞 `Button`: 修复 loading 图标不显示的问题。

## 0.8.26

`2019-10-21`

- 🌟 `<pro>DataSet`: 新增 autoQueryAfterSubmit 属性。
- 💄 `<pro>DataSet`: 优化提交数据回写逻辑。
- 🐞 `<pro>NumberField`: 修复步距按钮的问题。

## 0.8.25

`2019-10-19`

- 🐞 `<pro>DataSet`: 修复数据在提交之后若有回写数据但没有\_id 属性时无法回写的问题。
- 🐞 `<pro>Lov`: 修复多选 Lov 无法选值的问题。

## 0.8.24

`2019-10-18`

- 💄 `<pro>Table`: 调整 advance bar 按钮类型。

## 0.8.23

`2019-10-18`

- 💄 `<pro>Table`: 性能优化。
- 💄 `<pro>Lov`: 缓存下时不清空查询条件。
- 🐞 `<pro>Table`: 修复 advance bar 高级查询条件条显示普通查询字段的问题。
- 🐞 `<pro>Table`: 修复删除记录失败时记录无法操作的问题。
- 🐞 `<pro>DataSet`: 修复提交报错后，再次提交为缓存数据的问题。
- 🐞 `<pro>Lov`: 修复可编辑状态下无法清空值的问题。
- 🐞 `<pro>Select`: 修复多选下拉框全选导致值重复的问题。

## 0.8.22

`2019-10-17`

- 🌟 `<pro>Field`: dynamicProps 属性支持对象类型，对象为字段属性和返回该字段值的钩子的键值对。
- 🌟 `<pro>DataSet`: delete 和 deleteAll 方法 confirmMessage 参数支持传 Modal 的属性。
- 💄 `<pro>Output`: 调整在 Form 中的行间距。
- 💄 `Button`: 调整 loading 状态与 pro 的 Button 一致。
- 💄 `<pro>Modal`: 调整 confirm、info、success、error、warning 样式与基础组件的样式一致。
- 🐞 `<pro>DatePicker`: 修复 range 空值的显示问题。
- 🐞 `<pro>Table`: 修复宽度为某两个固定值之间切换时列显示不正确的问题。

## 0.8.21

`2019-10-14`

- 💄 `<pro>Lov`: 调整 Lov 弹窗的最小高度。
- 🐞 `<pro>Lov`: 修复唯一校验不显示错误的问题。
- 🐞 `<pro>Table.Column`: 修复 tooltip 属性的问题。
- 🐞 `Modal.SideBar`: 修复 closable 属性不起作用的问题。

## 0.8.20

`2019-10-13`

- 🌟 `configure`: 新增 defaultValidationMessages 全局配置。
- 🌟 `<pro>DataSet.Field`: 新增 defaultValidationMessages 属性。
- 🌟 `<pro>DataSet`: delete 和 deleteAll 方法新增 confirmMessage 参数。
- 🌟 `<pro>FormField`: 新增 validationRenderer 属性。
- 💄 `<pro>Table`: 树形表格展开状态持久化。
- 🐞 `<pro>Table`: 修复树形表格合并按钮有时无法关闭节点的问题。
- 🐞 `<pro>Validator`: 修复 unique 联合唯一校验的问题。
- 🐞 `<pro>NumberField`: 修复多选模式下步距按钮的问题。

## 0.8.19

`2019-10-11`

- 🌟 `configure`: 增加 pagination 全局配置。
- 🌟 `<pro>Select`: 增加 notFoundContent、onOption 属性。
- 💄 `<pro>FormField`: renderer 返回值支持 ReactNode。
- 💄 `<pro>Table`: 树形表格默认高亮第一条根节点记录。

## 0.8.18

`2019-10-10`

- 🌟 `<pro>Select`: 多选增加全选和取消全选按钮。
- 🐞 `<pro>Table`: 修复单元格内容为块级元素时会换行的问题。
- 🐞 `<pro>Select`: 修复加载状态不停止的问题。

## 0.8.16

`2019-10-09`

- 🌟 `<pro>Table.Column`: 新增 tooltip 属性。
- 🌟 `<pro>Select`: 新增 searchMatcher 属性。
- 🌟 `<pro>Pagination`: 新增 showSizeChangerLabel、sizeChangerPosition、sizeChangerOptionRenderer 属性。
- 🌟 `<pro>DataSet.Field`: format 属性新增 uppercase lowercase capitalize 值。
- 🌟 `<pro>DataSet.Field`: 新增 lovDefineAxiosConfig、lovQueryAxiosConfig 属性。
- 🌟 `<pro>TriggerField`: 新增 onPopupHiddenChange 属性。
- 🌟 `<pro>`: 新增日语。
- 💄 `<pro>Table`: 重构高级查询条。
- 🐞 `<pro>DataSet`: 修复 ready 方法时序不正确的问题，如 queryDataSet 未准备好时就执行了查询。
- 🐞 `<pro>Table`: 修复复合列错位的问题。
- 🐞 `<pro>DatePicker`: 修复自定义校验 range 值的问题。
- 🐞 `Radio.Button`: 修复选中样式不更新的问题。

## 0.8.15

`2019-09-27`

- 🐞 `<pro>DataSet`: 修复 dataKey 的问题。

## 0.8.14

`2019-09-26`

- 🌟 `<pro>Field`: 新增 trim 属性 。
- 🌟 `<pro>DataSet`: dataKey 和 totalKey 支持深层匹配，如 dataKey = "demo.list" 。
- 🐞 `<pro>Table`: 修复 Table querybar 的问题。
- 🐞 `<pro>Field`: 修复 float label 在 firefox 下不生效的问题。

## 0.8.13

`2019-09-26`

- 🌟 `<pro>Table`: 属性 queryBar 支持钩子类型。
- 🐞 `<pro>DataSet.Field`: 修复 dynamicProps 在某些情况不起作用的问题。

## 0.8.12

`2019-09-25`

- 🌟 `<pro>Lov`: 新增 button 模式。
- 💄 `<pro>Lov`: 多选 Lov 弹出窗中的 Table 能选中已有的值。
- 💄 `<pro>Table`: 调整 advancedBar 的间距。
- 💄 `<pro>Button`: 调整 Button 的高度为 .3rem。
- 💄 `<pro>Modal`: 更新样式。
- 🐞 `<pro>Table`: 修复隐藏列造成的问题。
- 🐞 `<pro>Table`: 修复锁定列编辑器不显示的问题。
- 🐞 `<pro>Table`: 修复切换 DataSet 后查询条值变更不会自动查询的问题。
- 🐞 `<pro>CodeArea`: 修复不受控的问题。
- 🐞 `<pro>NumberField`: 修复精度问题。
- 🐞 修复循环依赖的问题。

## 0.8.11

`2019-09-16`

- 💄 `<pro>Table`: 调整查询条的模糊条件限制只能输入一个。

## 0.8.10

`2019-09-16`

- 🐞 `Input`: 修复报错白屏的问题。
- 🐞 `<pro>DataSet`: 修复 isModified 方法的问题。

## 0.8.9

`2019-09-12`

- 🌟 升级 webpack4, babel7, eslint, stylelint。
- 🌟 `configure`: 增加全局配置新属性。
- 🌟 `<pro>DataSet`: 新增 beforeDelete 事件。
- 🌟 `<pro>DataSet.Record`: 新增 save 和 restore 方法。
- 🌟 `<pro>Table.Filter`: 优化过滤条 placeholder 文字与光标的位置，调整过滤条高度为 40px。
- 🌟 `<pro>Table`: 临时删除的行显示为禁用状态，提交失败时重置状态。
- 🌟 `<pro>Table`: 编辑器支持 SelectBox。
- 🌟 `<pro>Lov`: 增加 `conditionFieldRequired` 配置。
- 🐞 `<pro>Table`: 修复 Table 有 Column 的 lock="right"的时候，非固定和固定列之间会没有 border 的问题。
- 🐞 `<pro>Table`: 修复键盘的上下键操作时行高亮定位问题。
- 🐞 `<pro>DataSet`: 修复 dataKey 为 null 时的问题。
- 🐞 `<pro>DataSet`: 修复必须要设置 exportUrl 才能导出的问题。
- 🐞 `<pro>Form`: 修复 FormField 设了 className 时，宽度不是 100%的问题。
- 🐞 `<pro>TextField`: 修复 float label 的 autofill 及 prefix 的样式问题。
- 🐞 `<pro>DatePicker`: 修复 range 为数组时的问题。
- 🐞 `<pro>DataSet.Field`: 修复 dynamicProps 死循环的问题。

## 0.8.8

`2019-08-23`

- 🌟 `Responsive`: 新增 Responsive 组件。
- 🌟 `<pro>DataSet`: Transport 增加 exports 配置，导出的 url 拼接 axios 的 baseUrl，增加 export 事件。
- 💄 `<pro>Form`: 优化响应式。
- 🐞 `<pro>Lov`: 修复多选翻页时无法缓存选中的记录。
- 🐞 `<pro>DataSet.Record`: 修复序列化数据的问题。
- 🐞 `<pro>Table`: 优化并修复高级查询条的一些问题。
- 🐞 `<pro>Select`: 修复错误信息遮盖下拉框的问题。

## 0.8.7

`2019-08-22`

- 🐞 `<pro>IntlField`: 修复多语言必填及数据变更显示的问题。

## 0.8.6

`2019-08-21`

- 🐞 `<pro>Table`: 修复 filter bar 值变更时不会自动查询的问题。
- 🐞 `<pro>Table`: 修复 dataSet 变更时，行内编辑的问题。

## 0.8.5

`2019-08-21`

- 🌟 `configure`: 增加全局配置新属性。
- 🌟 `<pro>DataSet.Record`: toJSONData 方法增加 isCascadeSelect 参数。
- 💄 `<pro>IntlField`: 重构代码，支持直接从 Record 数据中获取多语言值。
- 🐞 `<pro>Tabs`: 修复禁用的样式问题。

## 0.8.4

`2019-08-16`

- 🌟 `configure`: 增加全局配置新属性。
- 🌟 `getConfig`: 暴露 getConfig 方法。
- 🌟 `<pro>Field`: 新增 range 属性。
- 🌟 `<pro>DatePicker`: 新增 multiple 和 range 模式。
- 🌟 `<pro>Button`: 新增 primary 颜色。
- 🌟 `<pro>Table`: 高级搜索增加重置按钮。
- 🌟 `<pro>Table.Column`: command 属性新增钩子类型。
- 🐞 `<pro>DataSet`: 修复响应值为空时报错。
- 🐞 `<pro>Tooltip`: 修复层级比下拉框低的问题。
- 🐞 `<pro>Table`: 修复 filterBar 的值不受控的问题。

## 0.8.3

`2019-08-08`

- 💄 `<pro>Popup`: 展开时与滚动同步。
- 💄 `<pro>DatePicker`: 补全国际化。
- 🐞 `<pro>SelectBox`: 修复 SelectBox 在 Form 下多选值的问题。
- 🐞 `<pro>Anchor`: 修复 getContainer 属性无效的问题。

## 0.8.2

`2019-08-06`

- 🌟 `<pro>configure`: 钩子 generatePageQuery 增加 sortName 和 sortOrder 参数。
- 🌟 `<pro>Form`: 增加 pristine 属性，用于显示记录的初始值。
- 🌟 `<pro>FormField`: 增加 pristine 属性，用于显示记录的初始值。
- 🌟 `<pro>Table`: 增加 pristine 属性，用于显示记录的初始值。
- 💄 `<pro>Range`: 更新浮动标签下的样式。
- 💄 `<pro>CheckBox`: 更新浮动标签下的样式。
- 💄 `<pro>Switch`: 更新浮动标签下的样式。
- 🐞 `<pro>Radio`: `label`替代`children`后，浮动标签布局下不渲染`label`。
- 🐞 `<pro>CheckBox`: `label`替代`children`后，浮动标签布局下不渲染`label`。

## 0.8.1

`2019-08-02`

- 🐞 `<pro>Table`: 修复 CheckBox 编辑器显示 label 的问题。

## 0.8.0

`2019-08-02`

- 🌟 `configure`: 增加全局配置新属性。
- 🌟 `<pro>Modal`: Modal 和内部注入 modal 对象增加 update 方法。
- 🌟 `<pro>Modal`: 新增 okProps, cancelProps, okFirst, border 属性。
- 🌟 `<pro>DataSet.Field`: 增加`requestTransform`和`responseTransform`输入属性。
- 🌟 `<pro>Table`: `queryBar`属性新增`advancedBar`类型。
- 🌟 `message`: 新增 placement 配置。
- 🌟 `<pro>DataSet.Record`: set 方法可以传一个键值对的对象。
- 🌟 `<pro>DataSet`: 新增 reverse、reduce、reduceRight、removeAll、deleteAll 方法。
- 🌟 `<pro>Select`: 新增`optionRenderer`输入属性。
- 💄 `Password`: 变更为通过点击揭示密码。
- 💄 `Input`: 更新样式。
- 💄 `DatePicker`: 更新样式。
- 💄 `Select`: 更新样式。
- 💄 `<pro>Form`: 优化行列合并。
- 💄 `<pro>FormField`: 更新浮动标签下的样式。
- 💄 `<pro>DataSet`: query 和 submit 事件返回值为 false 可阻止查询和提交。
- 💄 `<pro>Popup`: 提升样式 z-index。
- 💄 `SelectBox`: 更新样式（浮动标签状态下）。
- 💄 `TexaArea`: 更新样式。
- 💄 `Tabs`: 更新样式。
- 💄 `<pro>Table`: 更新`ColumnFilter`样式。
- 💄 `<pro>DataSet.Field`: 动态属性变更时只重置校验，不自动触发校验。
- 💄 `<pro>DataSet`: 取消`Validator.checkValidity`方法的缓存策略。
- 💄 `<pro>Modal`: `footer`属性支持函数类型。
- 💄 `<pro>Select`: 当没有匹配选项时，显示值，而不是自动清空值，除了级联。
- 💄 `<pro>Select`: 当可搜索且没有匹配选项时，下拉框显示`没有匹配项`。
- 💄 `<pro>DataSet.Field`: lookupAxiosConfig 支持钩子。
- 💄 `<pro>Modal`: 调整`drawer`类型的 Modal 页脚至视口底部。
- 💄 `<pro>Radio`: 没有`children`时使用`label`代替。
- 💄 `<pro>CheckBox`: 没有`children`时使用`label`代替。
- 🐞 `<pro>FormField`: 修复 label 为 ReactNode 时的问题。
- 🐞 `<pro>TextField`: 修复 TextField(和子类)使用 addon 时的 display 样式。
- 🐞 `<pro>Modal`: 修复 body 无滚动条时，Modal 弹出会影响布局的问题。
- 🐞 `<pro>Modal`: 修复在抽屉类型的`Modal`中使用浮动标签`Form`时，验证和帮助信息无法随页面滚动。
- 🐞 `<pro>FormField`: 修复多值组件的标签样式。
- 🐞 `<pro>Form`: 修复 disabled 属性无法传递给子 Form 的问题。
- 🐞 `<pro>DataSet`: 修复 Transport 的钩子没有传递 params 的问题。
- 🐞 `<pro>Lov`: 修复 Field.type 为 string 时，不显示文案的问题。
- 🐞 `<pro>SelectBox`: 修复 children 变化不渲染的问题。
- 🐞 `Modal`: 修复`SideBar`组件`width`属性无效的问题。

## 0.7.6

`2019-07-09`

- 💄 `<pro>DataSet`: 优化性能。
- 💄 `<pro>Validator`: 优化校验。
- 🐞 `<pro>Select`: 修复复合多选的 bug。
- 🐞 `<pro>Select`: 修复 searchable 情况下，两个相同文案的选项始终选择的是第一个的问题。
- 🐞 `<pro>DataSet`: 修复 Field 的 ignore 属性会忽略 bind 的字段。

## 0.7.5

## 0.6.14

`2019-06-28`

- 🐞 `<pro>TextArea`: 修复未受控值无法保留的问题。

## 0.7.3

## 0.6.12

`2019-06-27`

- 💄 `<pro>Validator`: 优化 email,url,color 在 Output 中显示的校验信息。
- 🐞 `<pro>Table`: 校验失败的下拉框重新选择值后，其他编辑器无法激活。
- 🐞 `<pro>Select`: 修复 primitive 属性的问题。

## 0.7.1

## 0.6.10

`2019-06-25`

- 🌟 `configure`: 增加全局配置新属性。
- 💄 `<pro>TextField`: 更新 labelLayout 为 float 时输入框的样式。
- 🐞 `<pro>Select`: 修复 combo 属性的 bug。
- 🐞 `Checkbox`: 修复半选样式问题。
- 🐞 `<pro>Validator`: Transport 设置 validate 时，唯一校验问题。
- 🐞 `<pro>DataSet`: 修复 Field.dirty 属性会有循环计算的问题。
- 🐞 `<pro>DataSet`: 修复 lookup 的复合值在 Output 中不显示的问题。

## 0.7.0

## 0.6.9

`2019-06-19`

- 🌟 `<pro>DataSet`: Field 新增 lookupAxiosConfig 属性，用于适配 lookup 请求的配置。
- 🌟 `configure`: 增加全局配置新属性。
- 🌟 `<pro>DataSet`: 属性 transport 支持钩子。
- 💄 `<pro>TextField`: 更新 float labelLayout 状态下，禁用时的样式。
- 💄 `<pro>Table`: 优化空数据显示。
- 🐞 `<pro>Table`: 修复过滤条 placeholder 始终显示的问题。
- 🐞 `<pro>DataSet`: 修复提交响应值为空时报错的问题。
- 🐞 `<pro>DataSet`: 修复 indexChange 触发的时机问题。
- 🐞 `<pro>DataSet`: 修复 query 事件查询参数不正确的问题。
- 🐞 `<pro>DataSet`: 修复级联子数据源数据无法提交的问题。
- 🐞 `<pro>DataSet`: 修复 ignore 为 clean 的多语言字段无法正确提交的问题。

## 0.6.8

`2019-06-13`

- 💄 `<pro>DataSet`: 查询时如果是 get 请求，自动将查询条件并入 params。
- 🐞 `<pro>Table`: 修复列的 header 属性不支持 ReactNode。

## 0.6.7

`2019-06-13`

- 🌟 `<pro>DataSet`: 属性 transport 新增 adapter 钩子属性，用于适配 CRUD 请求的配置。
- 🐞 `<pro>DataSet`: 修复 submit 方法无返回值。

## 0.6.6

`2019-06-12`

- 🌟 `<pro>DataSet`: 新增 transport 属性，用于配置 CRUD 的请求。
- 💄 `Message`: 默认 placement 属性设为 leftBottom。
- 🐞 `<pro>DatePicker`: 修复 placeholder 不显示的问题。

## 0.6.5

`2019-06-07`

- 💄 `<pro>TextField`: 更新 labelLayout 为 float 时输入框的样式。
- 💄 `<pro>DataSet`: 优化内存不释放的问题。
- 🐞 `<pro>Upload`: 修复弹窗无法关闭的问题。

## 0.6.4

`2019-05-25`

- 🌟 `<pro>FormField`: 新增 maxTagPlaceholder、maxTagCount、maxTagTextLength 属性。
- 🌟 `<pro>Field`: 新增 ignore 属性。
- 🌟 `<pro>Select`: 新增 primitiveValue 属性。
- 🌟 `<pro>Tranfer`: 新增 Transfer 组件。
- 🌟 `<pro>DataSet`: 废弃 beforeSelect 事件，新增 create 事件。
- 🌟 `Ripple`: 增加 disabled 属性，用于禁用波纹效果。
- 💄 `<pro>Table`: 优化尺寸变化时的性能。
- 💄 `Pagination`: 优化 10 页以内的分页效果。
- 💄 `<pro>Lov`: 提升 placeholder 属性优先级大于配置的 placeholder。
- 🐞 `<pro>Table`: 修复绑定的数据源新增记录时，行内编辑框不显示的问题。
- 🐞 `<pro>Select`: 在不可编辑的情况下始终显示 renderer 的值。

## 0.6.3

`2019-05-24`

- 🐞 `Tree`: 修复样式。
- 🐞 `Button`: 修复小按钮样式。

## 0.6.2

`2019-04-25`

- 🌟 `<pro>Form`: 实装 disabled 属性。
- 🌟 `<pro>TextField`: 新增 restrict 属性，用于限制可输入的字符。
- 🌟 `<pro>Table`: 新增行内编辑模式。
- 🌟 `<pro>Table`: 新增 pagination 属性。
- 🌟 `<pro>Pagination`: 新增 showTotal、showPager、itemRender 属性。
- 💄 `<pro>Table`: 优化必选和可编辑单元格的显示。
- 🐞 `<pro>Form`: 修复在有空子元素时布局的问题。
- 🐞 `<pro>Lov`: 修复配置中 lovItems 为 null 时报错的问题。
- 🐞 `<pro>NumberField`: 修复加减按钮在大于 1000 数字时结果不正确的问题。

## 0.6.1

`2019-04-18`

- 🌟 `<pro>Form`: 属性 labelLayout 新增 float 值。
- 🌟 `<pro>Table`: 弃用属性 showQueryBar，新增 queryBar 属性，可选值为`normal` `bar` `none`。
- 🌟 `<pro>Table`: 新增展开行渲染功能。
- 🌟 `<pro>Table`: 新增 onCell 用于设置单元格属性。
- 🌟 `<pro>Table`: 废弃属性 rowRenderer，新增 onRow 用于设置行属性。
- 🌟 `<pro>Lov`: 新增 searchable 属性，LovConfig 新增 editableFlag 配置，用于输入时可获取 lov 值。
- 💄 `<pro>Table`: 优化组合列。
- 🐞 `<pro>Field`: 修复属性 pattern 不支持正则常量。
- 🐞 `<pro>Lov`: 修复列序号不生效的问题。
- 🐞 `<pro>NumberField`: 修复只读时能点击加减按钮的问题。
- 🐞 `Tabs`: 修复 Tab 没有传 key 时无法切换的问题。

## 0.6.0

`2019-04-01`

- 🌟 并入`choerodon-ui/pro` 组件库。
- 🌟 默认 ant 前缀改为 c7n，如要使用 ant 前缀，请[修改主题变量@c7n-prefix](https://choerodon.github.io/choerodon-ui/docs/react/customize-theme-cn)，并使用[全局化配置](https://choerodon.github.io/choerodon-ui/components/configure-cn)。

## 0.5.7

`2019-04-26`

- 🐞 `Icon`: 修复图标尺寸问题。

## 0.5.6

`2019-04-25`

- 🌟 `Icon`: 增加新的图标。

## 0.5.5

`2019-04-20`

- 🐞 修复 0.5.4 发布文件错乱的问题。

## 0.5.4 (deprecated)

`2019-04-19`

- 🌟 `Icon`: 增加新的图标。

## 0.5.3

`2019-03-20`

- 💄 `Input`: Input 输入到达字符限制时显示提示。
- 🌟 `Modal`: Modal 添加 disableOk 和 disableCancel 属性。
- 🌟 `TreeNode`: TreeNode 添加 wrapper 属性。
- 🌟 `Icon`: 增加新的图标。
- 🌟 `IconSelect`: 增加 showAll 属性。

## 0.5.2

`2019-02-22`

- 💄 `Table`: 修复 Table 中过滤的确认按钮固定在选择框底部样式被覆盖。
- 🌟 `Sidebar`: 增加属性 alwaysCanCancel。

## 0.5.1

`2019-02-19`

- 💄 `Form.Item`: Form.Item 验证为 error 时不隐藏后缀图标。
- 💄 `Table`: Table 过滤失去焦点后不清空。
- 💄 `Table`: Table 过滤的清空 icon 在有内容时就显示。
- 💄 `Table`: Table 中过滤的确认按钮固定在选择框底部。
- 🌟 `Icon`: 增加新的图标。

## 0.5.0

`2019-01-10`

- 更改图标字体文件的来源，更改为从 npm 库中获取并打包到本地。
- 💄 `IconSelect`: 优化了图标选择器，图标更大，且只保留常用图标.
- 💄 `table`: 优化 table 翻页时自动回到第一条元素

## 0.4.5

`2018-12-11`

- 🌟 `Icon`: 增加新的图标。
- 💄 `Select`: select 全选和无更改为不对禁用的选项生效

## 0.4.4

`2018-12-3`

- 💄 `Menu`: 修复了一个依赖错误。

## 0.4.3

`2018-11-29`

- 🌟 `Select`: 增加`onPopupFocus`，在下拉弹出框被 focus 时调用。
- 💄 `Select`: select 搜索框内可以使用上下选择然后回车确定。
- 💄 `Select`: 多选框：删除标签，不打开 select 弹框。
- 💄 `Select`: 去除 select 中标签悬停后的 title 信息。
- 💄 `Menu`: 升级 rc-menu 组件为社区版。

## 0.4.2

`2018-11-13`

- 🌟 `Icon`: 增加新的图标。
- 🌟 `Table`: 增加`noFilters`，用于阻止默认的过滤筛选功能。
- 🌟 `Table.Column`: 增加`disableClick`, 用于 `Table` 筛选项禁用勾选。
- 💄 `Tag`: 修复热门标签显示问题。
- 💄 `Select`: Select 全选和无的逻辑优化。

## 0.4.1

`2018-10-26`

- 🌟 `Icon`: 增加新的图标。
- 🌟 `Table`: 增加 onColumnFilterChange，在表格列过滤器变化时触发。
- 💄 `Demo`: 修复使用 bisheng 生成的文档网站无法展开样例代码的 bug。
- 💄 `Avatar`: 修复头像中文字定位不准确。

## 0.4.0

`2018-09-28`

- 🌟 `Select`: select 有 maxTagCount 且超出限制时显示的标签可以自定样式,且去除默认的背景颜色。
- 💄 `Input`: 修复 input 的 showLengthInfo 为 false 时在某些情况下仍显示字数限制信息的问题。
- 💄 `Select`: 回滚 select 的部分样式至 0.3.4 版本。

## 0.3.10

`2018-09-14`

- 🌟 `List`: List 添加`empty`属性。
- 🌟 `Table`: Table 添加`empty`属性。
- 🌟 `Icon`: 增加新的图标。
- 💄 `Select`: 修复 Select 使用方向键选择时样式缺失的 bug。
- 💄 `Cascader`: 级联选择器 修复样式问题。
- 💄 `Table`: 修复可编辑单元格示例无法编辑单元格的 bug。

## 0.3.9

`2018-09-07`

- 🌟 `Icon`: 增加新的图标。
- 🌟 `Card`: Card 添加`onHeadClick`属性。
- 💄 `Input`: 修复 input 有字数限制且在 formitem 中存在验证时 formitem 之间上下间距不对。
- 💄 `Sidebar`: 修复 Sidebar 没有`getContainer`属性的 bug。

`2018-09-04`

- 🌟 `Input`: Input 添加`showPasswordEye`属性用来控制显示密码的控件。
- 💄 `IconSelect`: IconSelect 现在的搜索不区分大小写了。

## 0.3.8

`2018-08-31`

- 🌟 `Icon`: 增加新的图标。。
- 💄 `Input`: Input 和 select 在 compact 模式和正常模式下都能对齐了。
- 💄 `FormItem`: 表单输入框带有字数限制时，优化为报错提示时报错信息与横线无间距，且隐藏字数限制提示。

## 0.3.7

- 💄 `Table`: 样式修改
- 💄 `Input`: input 框禁用时 hover 上去显示默认禁用图标
- 💄 `Spin`: 修复加载图标未置于顶层的问题。

## 0.3.6

`2018-08-16`

- 🌟 `Icon`: 增加新的图标。

## 0.3.5

`2018-08-03`

- 💄 `Switch`: 样式修改。
- 🌟 `Icon`: 增加新的图标。

## 0.3.4

`2018-07-19`

- 🌟 `Icon`: 增加新的图标。

## 0.3.3

`2018-07-06`

- 🌟 `Select`: 增加 `onChoiceRemove` 属性。
- 🌟 `Input`: 增加 `showLengthInfo` 属性。
- 🌟 `Modal`: 增加 `center` 属性。
- 💄 `Select`: 样式调整。
- 💄 `Tree`: 样式调整。
- 💄 `Modal.Sidebar`: 样式调整。
- 💄 `InputNumber`: 样式调整。
- 💄 `Select`: 实现 `filterInput` 自动获取焦点。
- 🐞 `Table`: 修复 `onChange` 返回值错误.
- 🐞 `Select`: 修复点击下拉按钮不能触发 focus.
- 🐞 `Table`: 修复过滤框无法弹出默认过滤内容.

## 0.3.2

`2018-06-28`

- 🌟 `Icon`: 增加新的图标。
- 🌟 `Form`: 增加 `isModifiedFields` `isModifiedField` 方法。
- 💄 `Table`: 排序图标样式调整。
- 💄 `Select` `Input` `Radio` `DatePicker`: 样式调整。

## 0.3.1

`2018-06-08`

- 🐞 `Table`: 修复列选择下拉框一直会处于 loading 状态。

## 0.3.0

`2018-06-08`

- 🌟 `Select`: 增加 loading 属性。
- 💄 `Collapse`:修改 icon 图标样式。
- 💄 `Modal`: 调整 footer 的 button 样式。
- 🌟 增加 `IconSelect` 组件。
- 💄 `Table`: 调整 `FilterSelect` 功能。
- 💄 `Table`: 调整弹出窗位置。

## 0.2.4

`2018-06-01`

- 💄 `Select`: 调整 icon 样式。
- 💄 `Input`: 调整 icon 样式。
- 🌟 `Icon`: 增加新的图标。

## 0.2.2

`2018-05-31`

- 💄 `Radio`: 禁用样式调整。
- 💄 `Pagination`: 下选框样式调整。
- 💄 `Select`: 多选样式调整。
- 🐞 `Select`: 修复没有数据时不能选中输入值。

## 0.2.1

`2018-05-28`

- 💄 `Select`: 多选样式调整。

## 0.2.0

`2018-05-18`

- 🌟 迁移至 npmjs

## 0.1.11

`2018-05-15`

- 💄 `Button`: 调整禁用时的背景色。
- 💄 `Modal.Sidebar`: title 样式调整。

## 0.1.10

`2018-05-14`

- 🐞 `Table`: 修正过滤条删除选中值时会影响当前`state`的`filteredValue`值。
- 💄 `Select`: 禁用时样式调整。

## 0.1.9

`2018-05-13`

- 💄 `Form`: 调整校验反馈时的图标。
- 💄 `Popover`: 调整图标。
- 🐞 `Table`: 修正当`column`的 `filters` 属性中 `value` 不是字符串时，过滤条选中的值显示错误。
- 🌟 `Table`: `column` 增加 `filterTitle` 属性。

## 0.1.8

`2018-05-12`

- 🐞 `Table`: 修正当`childrenColumnName`属性不是`children`，所有数据中第一层的选择框禁用而其他数据的选择框是启用的时候, 全选选择框为禁用状态。
- 🐞 `Select`: Form 下全选拿不到值。

## 0.1.7

`2018-05-12`

- 💄 `Icon`: 样式属性 font-weight 改为 inherit。
- 🐞 `Select`: 查询过后再次打开下拉框不能重查。

## 0.1.6

`2018-05-11`

- 💄 `Pagination`: 样式调整。
- 💄 `Modal.Sidebar`: content 滚动。
- 💄 `Select`: 样式调整。
- 🌟 `Select`: 增加 choiceRender 属性。

## 0.1.5

`2018-05-10`

- 🐞 `Ripple`: 修复引用 Ripple 的组件的样式依赖。
- 🐞 `Icon`: 修复不同字体大小下的图标尺寸不自适应。
- 🌟 `Checkbox`: 增加 label 属性。
- 🌟 `Radio`: 增加 label 属性。
- 💄 `Select`: 对于 label 不存在时的调整。
- 🐞 `Input`: 默认值和 label 重叠。

## 0.1.4

`2018-05-08`

- 🐞 `Ripple`: 修正内部节点的样式属性 position 为 static 时的错误。

## 0.1.3

`2018-05-07`

- 🌟 `Model.Sidebar`: 新增 footer
- 💄 `Spin`: 调整旋转效果
- 🐞 `Table`: 修正过滤条无法过滤 Column 没有 dataindex 属性时数据的错误

## 0.1.2

`2018-05-03`

- 🌟 `Pagination`: 新增`tiny`属性，用于 Table 风格的分页
- 💄 `Tab`: 调整 icon
- 🐞 `Table`: 修复过滤条选择的值的问题
- 🐞 `Ripple`: 修复子节点 style 的问题
- 🌟 `Icon`: 新增 icon 样式
- 🐞 `Input`: 前后缀问题

## 0.1.1

`2018-05-02`

- Table
  - 🌟 `FilterBar`: 新增设置`column.filterMultiple`可多选功能。
  - 🐞 `FilterBar`: 修复列过滤的问题。
  - 🐞 修复展开图标不按中心旋转的问题。
- 🐞 `Modal.Sidebar`: 按钮 loading 状态显示问题。

## 0.1.0

`2018-04-28`

- 💄 `Ripple`: 优化并抽象成组件.
- 🐞 `Select`: 修复内容超长显示问题。
- 💄 `Table`: 调整行的展开图标。
- 💄 `Table`: 当列的`filters`为空数组时，`filterBar`也能显示可选列。

## 0.0.5

`2018-04-26`

- 💄 调整 Table 行的展开图标。
- 🐞 修复 rc-components 在 IE9 下的 bug.
- 🌟 message 新增 `placement` 用于消息位置。
- 🌟 message.config 新增 `bottom`。
- 🌟 Select 新增 `footer`。

## 0.0.4

`2018-04-25`

- 💄 调整 Table 的 filter bar，默认不能有 OR 逻辑。
- 💄 调整 Select 组件清除图标样式。
- 🌟 Modal 新增 `funcType` 用于按钮功能。

## 0.0.3

`2018-04-24`

- 🐞 修复 Form 的 Input 组件赋值问题。
- 🐞 修复 Select 组件主题样式兼容问题。
- 🐞 修复 Input 组件主题样式兼容问题。
- 🐞 修复 AutoComplete 组件主题样式兼容问题。
- 💄 调整 Radio 组件主题样式。
- 💄 调整 Upload 组件主题样式。
- 💄 调整 Dropdown 组件弹出位置。
- 💄 调整 Button 组件 loading 样式。

## 0.0.2

`2018-04-20`

- 🐞 修复 `rc-components` 各组件未引入的依赖。
- 🐞 修复 Table 的 filterBar 的问题。
- 💄 调整 Button 组件主题样式。
- 💄 调整 Menu 组件主题样式。
- 💄 调整 Modal 组件主题样式。
- 💄 调整 Progress 组件主题样式。
- 💄 调整 Select 组件主题样式。
- 💄 调整 Input 组件主题样式。
- 🌟 Progress 的 `type` 属性新增 `loading` 值。
- 🌟 新增 Modal.SideBar 组件。
- 🌟 Input 新增 `copy` 和 `onCopy` 用于复制。

## 0.0.1

`2018-04-11`

- Table
  - 🌟 新增 `filterBar` 用于开启过滤条功能。
  - 🌟 新增 `filters` 用于控制过滤条已选过滤条件。
- 🌟 各表单控件 新增 `label` 用于显示浮动文字。
- 💄 调整各组件主题样式。

## 0.0.0

`2018-04-01`

- 🌟 基于 [Ant Design@3.4.0](https://github.com/ant-design/ant-design/blob/master/CHANGELOG.zh-CN.md#340)
