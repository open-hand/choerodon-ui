---
order: 6
title: Change Log
toc: false
timeline: true
---

`choerodon-ui` strictly follows [Semantic Versioning 2.0.0](http://semver.org/).

#### Release Schedule

- Weekly release: patch version at the end of every week for routine bugfix (anytime for urgent bugfix).
- Monthly release: minor version at the end of every month for new features.
- Major version release is not included in this schedule for breaking change and new features.

---

- 🌟 `configure`: Added `showValueIfNotFound` property.
- 🌟 `<pro>FormField`: Added `overMaxTagCountTooltip` property.
- 🌟 `<pro>Transfer`: Added `placeholderOperations` property.
- 🌟 `<pro>DataSet.Field` : Added `maxExcl`, `minExcl` strictly compares the size properties.
- 🌟 `<pro>Attachment`: Added `filesLengthLimitNotice`, `countTextRenderer` properties.
- 🌟 `<pro>Board`: Added card default width `cardWidth` and content custom rendering `contentRenderer` properties.
- 🌟 `<pro>Table.DynamicFilterBar`: Added `fuzzyQueryProps` property.
- 💄 `<pro>Tooltip`: Compatible with `hover` trigger mode of mobile terminal.
- 💄 `<pro>DataSet`: If `lookupAxiosConfig` is configured, the batch query logic is not executed.
- 💄 `<pro>CodeArea`: Optimize component styles after asynchronous loading. Optimizes the style after modifying the `style` property.
- 💄 `<pro>DataSet`: Optimize single line save logic.
- 💄 `<pro>Board`: The dropdown option to optimize the grouping displays the logic.
- 💄 `<pro>NumberField`: Optimize the digital change logic of click step button on mobile terminal.
- 🐞 `<pro>Radio`: Fixed the issue that if the `onChange` is not used in controlled mode, the component will become `readOnly`.
- 🐞 `<pro>Table`: Fixed the issue that if you enabled `cacheSelection`, you could not unselect all.
- 🐞 `<pro>Table`: Fixed an issue where query fields were displayed incorrectly when using the `DynamicFilterBar` component alone.
- 🐞 `<pro>Table`: Fixed an issue where non-asynchronous trees reported an error when using `treeAsync`.
- 🐞 `<pro>Table`: Fixed the issue of adding a new row when copying and pasting the second page of data in both directions.
- 🐞 `<pro>Table`: Fixed the issue of incorrect batch assignment quantity in bidirectional replication.
- 🐞 `<pro>FormField`: Fixed the issue that the min-width of the non-empty multiple input was abnormal.

## 1.6.5

`2024-05-16`

- 🌟 `configure`: Added `modalAutoFocus`, `modalButtonTrigger`, `strictPageSize`, `separateSpacing`, `labelWidth`, `labelWordBreak`, `pictureCardShowName`, `noPagingParams`, `datePickerComboRangeMode`, `attachment.orderField`, `treeCheckboxPosition`, `tabsShowInvalidTips` property.
- 🌟 `<pro>PerformanceTable`: Added `components` property.
- 🌟 `<pro>Form`: Added `labelWordBreak` property.
- 🌟 `<pro>Table.DynamicFilterBar`: Added `showSingleLine` property.
- 🌟 `Tabs`: Added `renderTabBar`, `showMorePopupClassName`, `showInvalidTips` property.
- 🌟 `Upload`: Added `pictureCardShowName` property.
- 🌟 `<pro>Upload`: Added the `previewImageRenderer` property and optimized the display of file lists.
- 🌟 `<pro>DatePicker`: Added `comboRangeMode` property.
- 🌟 `<pro>Attachment`: Added `removeImmediately`, `onTempRemovedAttachmentsChange` properties and `remove`, `reset` instance methods.
- 🌟 `Tree`: Added `checkboxPosition` property.
- 🌟 `<pro>Table`: Adds batch filling and counting functions in Excel.
- 🌟 `<pro>IntlField`: Added support for the language field to support the `trim` attribute of the main field.
- 🌟 `<pro>DataSet`: Added `submitRecord` method.
- 🌟 `<pro>Picture`: The `loading` state is added to the `status` attribute.
- 🌟 `<pro>Table`: Bidirectional replication adds `hiddenTip` hidden prompt attribute.
- 🌟 `<pro>DataSet.Field`: Added `useLookupBatch`, `useLovDefineBatch` property.
- 🌟 `<pro>Table`: Added `rowNumberColumnProps` property.
- 💄 Optimize some warnings.
- 💄 `Tabs`: Optimize the algorithm logic for calculating showMore.
- 💄 `BarCode`: Optimize internal monitoring of value changes within components.
- 💄 `ImageCrop`: Optimized support for blank cropping and no restriction on cropping area.
- 💄 `<pro>Table`: Optimized the display of placeholders when there is no data in the column grouping of the personalized panel.
- 💄 `<pro>Output`: Optimizes `tooltip` display logic when pop-ups are rendered inside the `Output`.
- 💄 `<pro>Lov`: Optimizes the style of displaying selected records in `drawer` mode.
- 💄 `<pro>Lov`: Optimized support for enabling asynchronous tree loading through view interface configuration.
- 💄 `<pro>Lov`: Optimized the suffix to display loading normally when there is a value.
- 💄 `<pro>Cascader`: Optimizes parent-selected interactions in `changeOnSelect` mode.
- 💄 `<pro>Output`: Optimize the line feed style of text for long word scenes.
- 💄 `<pro>Select`: Optimize automatic front-end pagination when drop-down data is loaded at one time.
- 💄 `<pro>Table`: Optimized custom `renderer` rendering, `tooltip` occlusion after validation failure.
- 💄 `<pro>CodeArea`: Optimized the style of loading `CodeArea` components asynchronously in `Modal`.
- 💄 `<pro>CodeArea`: Optimizes the style when setting the line feed display.
- 💄 `<pro>Table`: Optimized `loading` effect.
- 💄 `<pro>Table`: Optimized support for pagination query of sub-nodes.
- 💄 `<pro>DataSet`: Optimize the `delete` method to return `false` when cancelling the delete.
- 💄 `<pro>Modal`: Optimized animations when `multi-modal` is closed.
- 💄 `<pro>FormField`: Optimized the association of suffix mouse events with component.
- 💄 `<pro>Picture`: Optimized the `border` display.
- 💄 `<pro>Pagination`: Extends the `showPager` property to support input box mode. The `showTotal` callback adds the `page` and `pageSize` parameters.
- 💄 `<pro>Select`: Optimized the minimum popup width limit.
- 💄 `<pro>CodeArea`: Optimizing the display of the bottom scrolling area in CodeArea.
- 💄 `<pro>Table`: Optimize the response performance of clicking on the edit box after enabling bidirectional replication.
- 💄 `<pro>Attachment`: The `renderIcon` extension supports `picture` mode.
- 💄 `<pro>Lov`: Optimized the popup width in `popup` mode.
- 💄 `<pro>Form`: Extends the `labelWidth` property to support setting minimum and maximum widths.
- 💄 `<pro>Attachment`: Optimize the display of the number of `readOnly` mode.
- 🐞 `<pro>PerformanceTable`: Fixed the issue of fixed combination columns being misaligned in the first column due to personalization.
- 🐞 `<pro>PerformanceTable`: Fixed the issue of merging row hierarchies.
- 🐞 `<pro>PerformanceTable`: Fixed the issue that the table content could not be selected after scrolling.
- 🐞 `<pro>PerformanceTable`: Fixed the issue that the column grouping tree structure was missing after the default restoration of the personalized table header.
- 🐞 `<pro>Lov`: Fixed the issue where double clicking the Lov radio disable option would close.
- 🐞 `<pro>Lov`: Fixed the issue that double-clicking the suffix would query twice and the single-check box selection error in the double-click selection mode of the table.
- 🐞 `<pro>Lov`: Fixed the issue that the callback type `tableProps` setting `onRow` was invalid.
- 🐞 `<pro>Select`: Fixed the issue that when `defaultActiveFirstOption` was enabled, the first piece of data would be found after a pagination query.
- 🐞 `Tabs`: Fixed an issue with abnormal focus switching.
- 🐞 `Tabs`: Fixed an issue where clicking `tab` in `showMore` did not trigger the `onTabClick` callback function.
- 🐞 `ImageCrop`: Fixed re-upload failure.
- 🐞 `<pro>Attachment`: Fixed the issue that the number of attachments in the cache is not updated.
- 🐞 `<pro>Attachment`: Fixed the issue that `onUploadSuccess` was executed too early in the case of multipart upload.
- 🐞 `<pro>Attachment`: Fixed an issue where attachment list information was not updated after the DS value was changed.
- 🐞 `<pro>Table`: Fixed the issue that summary bar data was not updated instantly.
- 🐞 `<pro>Table`: Fixed the issue that more query conditions in `professionalBar` could not be collapsed.
- 🐞 `<pro>Table`: Fixed the issue that the `comboBar` customization field configuration column order was incorrect.
- 🐞 `<pro>TriggerField`: Fixed the issue that the popup box was incorrectly positioned in the iframe.
- 🐞 `<pro>TriggerField`: Fixed the issue that multi-value drop-down custom events were invalid.
- 🐞 `<pro>TextField`: Fixed a display issue with very long text in `disabled` mode when setting `renderer`.
- 🐞 `<pro>ModalProvider`: Fixed an issue where pop-ups nested pop-ups and set `getContainer` property.
- 🐞 `<pro>Table`: Fixed an issue where the personalization column could not be dragged to the end under the `ComboBar`.
- 🐞 `<pro>Table`: Fixed the issue of `virtual` scrolling error when large data volume is generated.
- 🐞 `<pro>Table`: Fixed the issue that if `virtual` scrolling is enabled in tree mode, collapsing the parent node will cause some child nodes to be collapsed.
- 🐞 `<pro>Table.DynamicFilterBar`: Fixed the issue that if you did not click the expand and collapse icon, the query condition would still be folded.
- 🐞 `<pro>SelectBox`: Fixed a controlled mode display error in the `Form` associated with the `DataSet`.
- 🐞 `<pro>Pagination`: Fix parameter error of `onChange`. Optimize interactions that are disabled in `simple` mode.
- 🐞 `<pro>Range`: Fixed an interaction issue when associating `dataSet`.
- 🐞 `<pro>Button`: Fixed the issue that the event object was abnormal in the click event.
- 🐞 `<pro>Modal`: Fixed an issue where the `Modal` content would appear incorrectly when you update it and then close it.
- 🐞 `<pro>DatePicker`: Fixed an issue where values were not updated in `week` and `range` mode and when the `DataSet` was associated.

## 1.6.4

`2023-10-26`

- 🌟 `configure`: Added `rangeSeparator`, `selectOptionsFilter` property.
- 🌟 `<pro>Table`: Added dynamic filter bar field `onFieldEnterDown` return callback.
- 🌟 `<pro>Table`: Added `selectionColumnProps` to support row selection column property extension.
- 🌟 `<pro>Table`: Added `clipboard` property to support two-way copying from table to Excel.
- 🌟 `<pro>CodeArea`: Added `placeholder` property.
- 🌟 `<pro>Table`: Added bar filter bar property `editorProps` to support extended popup editor properties.
- 🌟 `<pro>TreeSelect`: Added the `checkStrictly` property and support for the `treeCheckStrictly` property of the `DataSet`.
- 🌟 `<pro>Table`: Added `customDragDropContenxt` property can be customized to support DragDropContenxt for dragging and dropping between multiple tables.
- 🌟 `<pro>DataSet`: Added `generateOrderQueryString` method.
- 🌟 `<pro>Modal`: Added `beforeOpen`, `afterOpenChange` properties.
- 🌟 `<pro>Select`:  Added `groupRenderer` property.
- 💄 `<pro>TriggerField`: Extended `popupContent` parameter supports `content`.
- 💄 `<pro>Table`: Optimize dynamic filter bar cascade query field interaction.
- 💄 `<pro>Table`: Optimize the hidden type judgment of personalized inner columns.
- 💄 `<pro>Table`: Optimized display of disabled fields `placeholder` in dynamic filters.
- 💄 `<pro>Table`: Optimized `loading` style code, compatible with custom `spin` property.
- 💄 `Tree`: Optimize horizontal scroll bar for virtual scroll mode.
- 💄 `Carousel`: Optimized Walking Lights have customizable arrows and custom indicator styles and are configurable with a dark theme.
- 💄 `<pro>PerformanceTable`: Optimize the problem that the last column has no right-border when the table width is larger than all column widths for big data.
- 💄 `<pro>CodeArea`: Optimize the issue of not being able to copy in disabled state.
- 💄 `<pro>DatePicker`: Optimize the style of `today` in the selection panel.
- 💄 `<pro>DataSet`: Optimize the current record positioning when delete deletes temporary data.
- 💄 `<pro>Form`: Optimization When `layout` is set to `none` and `showHelp` is set to `label`, `help` information is displayed in the grid layout.
- 💄 `<pro>Modal`: Optimized the problem of repeatedly pressing the `ESC` key to trigger a callback to close the pop-up window.
- 💄 `<pro>Lov`: Optimize Popup Lov to support carriage return selection.
- 💄 `<pro>CodeArea`: The issue of optimizing CodeArea validation without error messages.
- 🐞 `<pro>Table`: Fixed an issue where the sort icon would display incorrectly when setting `combineSort` and table column front sort.
- 🐞 `<pro>Modal`: Fixed the issue that the instance was not cleared when ModalContainer was unmounted, causing subsequent Modal to fail to open.
- 🐞 `<pro>Lov`: Fixed an issue where `onEnterDown` events failed.
- 🐞 `<pro>Lov`: Fix the condition that the query condition is not cleared when re-expanding in popup mode.
- 🐞 `<pro>Lov`: Fixed the issue of double-clicking the selection drop-down in popup mode.
- 🐞 `<pro>Lov`: Fixed an issue where a record error was checked when `multiple` selections were set and the option display value was `ReactElement` type.
- 🐞 `<pro>PerformanceTable`: Fixed dynamic filter bar saving issue.
- 🐞 `<pro>PerformanceTable`: Fixed the issue that the initialization status of the dynamic filter bar was wrong.
- 🐞 `<pro>PerformanceTable`: Fixed the problem of misaligned content caused by sliding the scrollbar in the case of large data table with fixed column merge.
- 🐞 `<pro>PerformanceTable`: Fixed the issue that fixed columns of PerformanceTable would scroll horizontally.
- 🐞 `<pro>PerformanceTable`: Fixed the error triggered by Modal animation causing multiple changes in form width.
- 🐞 `Carousel`: Fixed the problem that the component is half displayed when dragged vertically and fixed the problem that the panel click event does not work when fade is applied.
- 🐞 `<pro>Table`: Fixed an issue where the `unique` check failed when the field value became a `BigNumber` type.
- 🐞 `<pro>NumberField`: Fixed the issue that a period can be entered in integer mode.
- 🐞 `<pro>Attachment`: Fixed the problem that read-only and disabled are invalid in drag-and-drop mode.
- 🐞 `<pro>Select`: Fixed the issue of not updating values when selecting the same amount of data when multiple is a comma.
- 🐞 `<pro>Select`: Fixed the problem that `noCache` is invalid under batch query.
- 🐞 `<pro>FormField`: Fixed an error in the display information that required verification failed when the `Field` dynamic `label` was set.
- 🐞 `<pro>Table`: Fixed the issue that the filter attribute does not take effect when groups grouping is turned on.
- 🐞 `<pro>Table`: Fixed the problem that the `onReset` callback does not take effect after configuring the dynamic filter bar interface.
- 🐞 `<pro>Table`: Fixed the problem of label priority in configuring queryFields under dynamic filter bar.

## 1.6.3

`2023-07-27`

- 🌟 `configure`: Added `lovDefineBatchAxiosConfig`, `useLovDefineBatch`, `useZeroFilledDecimal`, `tablePageSizeChangeable`, `tabsDefaultChangeable` properties.
- 🌟 `Tabs`: Added `restoreDefault` property.
- 🌟 `Field`: Added `lovDefineBatchAxiosConfig` property.
- 🌟 `<pro>Form`: Added the `requiredMarkAlign` property to control the position of the required mark.
- 🌟 `<pro>Table`: Added table personalized `pageSize` control.
- 🌟 `Tabs`: New support for mouse scrolling when `TabPane` is displayed horizontally.
- 🌟 `<pro>Attachment`: Add `getPreviewUrl` property to get preview address.
- 💄 `<pro>DataSet`: Optimize `childrenField` performance.
- 💄 `<pro>DataSet`: Optimize the query `dataSet` instance `current` record assignment.
- 💄 `<pro>Table`: Optimized keys warning in Table and PerformanceTable.
- 💄 `<pro>TextField`: Optimize suffix width calculation.
- 💄 `style`: Optimize some component style units.
- 💄 `<pro>Table`: Optimize the dynamic filter bar input field suffix display logic.
- 💄 `<pro>PerformanceTable`: Added default suffixes for filtering criteria for character and numerical types in dynamic filter bars.
- 💄 `<pro>FormField`: Optimize the style of the asterisk.
- 💄 `<pro>Output`: Optimize `tooltip` control in multiple scenarios.
- 💄 `<pro>DatePicker`: Optimized the `filter` property to support range mode filtering. Optimized display of disabled elements in the `decade` panel. Optimized today button disable style.
- 💄 `<pro>DatePicker`: Optimize DatePicker to show line break when selecting year interval on Mac side.
- 💄 `<pro>Radio`: Optimized the issue of too wide click hot area in `Form`.
- 💄 `<pro>Table`: Optimize the dynamic filter bar to support front-end multi-column sorting.
- 💄 Optimize some code implementation.
- 💄 `<pro>Table`: Optimize query bar performance.
- 💄 `<pro>Modal`: Keep focus on the Modal.
- 💄 `<pro>Table`: Optimized `rowBox` display in multiple selection `dblclick` mode.
- 💄 `Tabs`: Optimize focus switching behavior.
- 💄 `<pro>Validator`: Optimize verification performance.
- 💄 `Menu`: Optimized `a` tag style.
- 💄 `<pro>Attachment`: Optimized the `help` style when the `picture-card` mode is in `Form` and `label` is displayed horizontally.
- 💄 `<pro>Table`: Optimized filter bar style file import.
- 💄 `<pro>PerformanceTable`: Optimize the display of big data table combination column headings centered with the scroll bar.
- 🐞 `<pro>PerformanceTable`: Fixed the issue of not being able to retrieve the destination.index during the onBeforeDragEnd event.
- 🐞 `<pro>PerformanceTable`: Fixed the problem of not being able to zoom on the mobile terminal.
- 🐞 `Upload`: Fixed the white screen issue caused by the file's unique identifier being undefined after setting the `beforeUploadFiles` even.
- 🐞 `Upload`: Fixed issue with ineffective configuration of `showPreviewIcon` or `showDownloadIcon` in `picture-card` mode.
- 🐞 `PerformanceTable`: Fixed the issue of focusing on abnormal interaction status when setting `onEnterDown` for dynamic filtering criteria.
- 🐞 `Avatar`: Fix the problem that the Avatar component flips when the text is opened in the Modal pop-up window.
- 🐞 `<pro>Table`: Fix the floating-point calculation accuracy problem of `summaryBar`.
- 🐞 `<pro>Table`: Fix an issue where using `addField` to add a query field and the dynamic filter bar to add a field in the filter drop-down would not be updated.
- 🐞 `<pro>Table`: Fix an issue where deleting filter entries in the dynamic filter bar would abnormally backfill searchId.
- 🐞 `<pro>Table`: Fix the issue that customization could not change the height after the table was set to height.
- 🐞 `<pro>Table`: Fixed the style of dynamic filter bar required field validation failure.
- 🐞 `<pro>Table`: Fixed the problem of misalignment under the case of virtual scrolling without left fixed column.
- 🐞 `<pro>Table`: Fixed `buttonsLimit` limit button error problem.
- 🐞 `<pro>Table`: Fixed the issue that dynamic filter bar saved query conditions to report errors.
- 🐞 `<pro>FormField`: Fixed an issue where out-of-focus checks were not triggered in new record when `multiple` `defaultValue` and `validator` attributes were set in fields in `DS`.
- 🐞 `<pro>FormField`: Fixed an issue where `DatePicker` `Lov` `IconPicker` components were out of focus and not checked in required and multi-value modes.
- 🐞 `<pro>Lov`: Fixed When the value of the `valueField` field corresponding to the selected record is 0, it is not displayed in the selected tag in the pop-up window.
- 🐞 `<pro>Table`: Fixed an issue in in-line editing mode where the editor was misaligned when a row was in the editing state and the line above it was expanded or collapsed.
- 🐞 `Message`: Fixed the issue of incoming incorrect types causing inability to continue using.
- 🐞 `Trigger`: Fixed the input method panel blocking the mouse and triggering the mouse departure event.
- 🐞 `<pro>DatePicker`: Fixed the range value caused an error in determining whether it is a duplicate value.
- 🐞 `<pro>Range`: Fixed issues with DataSet configuration not echoing in Range and centering of Form forms.
- 🐞 `<pro>Table`: Fixed the issue of virtual scrolling enabled for inline editing, where the edit box will move with the scrollbar.
- 🐞 `<pro>PerformanceTable`: Fixed the issue of merged cells disappearing due to virtual scrolling.

## 1.6.2

`2023-05-23`

- 🌟 `configure`: Added `labelAlign`, `tableVirtualBuffer` properties.
- 🌟 `Field`: Added `placeholder` attribute definitions.
- 🌟 `Card`: Added some classnames.
- 🌟 `<pro>Attachment`: Added `buttons` props.
- 🌟 `<pro>Form`: Added some classnames.
- 🌟 `<pro>Table`: Added some classnames.
- 🌟 `<pro>Table`: Added `columnBuffer` and `columnThreshold` attributes to optimize horizontal virtual scrolling.
- 🌟 `<pro>FormField & <pro>Table.Column`: Add `tagRenderer` property to support custom multivalue rendering.
- 🌟 `Upload`: Support preview and download button display in `text` and `picture` modes.
- 🌟 `<pro>Lov`: When the `viewMode` is `modal`, you can set the `selectionProps` property to customize the rendering of selected records at the bottom of the pop box.
- 🌟 `<pro>Picture`: Add `modalProps` property and optimize for not displaying navigation when an image.
- 🌟 `<pro>FormField`: Added the `helpTooltipProps` attribute to support `tooltip` customization of `help` information.
- 🌟 `<pro>Table`: `onDragEndBefore` adds the `recordIndexFromTo` parameter to get the correct record index when dragging and dropping the tree.
- 💄 `<pro>Button`: Optimize and correct the difference of overflow determination.
- 💄 `<pro>CheckBox`: Optimize the trigger hot zone range when used in the form.
- 💄 `<pro>NumberField`: Optimizing the Chinese input method will delete the value.
- 💄 `<pro>Table`: Optimize when the querybar is bar, it can control whether it can be input.
- 💄 `<pro>Table`: Add the default suffix of the filter criteria for character and numeric types in the dynamic filter bar.
- 💄 `<pro>Table`: Optimize the value saving limit of the dynamic filter bar multi-selection value set.
- 💄 `<pro>Table`: Hide dynamic filter bar tenant Save as button.
- 💄 `<pro>Table`: Optimized Table border related style variables.
- 💄 `<pro>Table`: Optimized `Tabs` switching in virtual scrolling mode can cause the issue of TableVirtualRow re rendering.
- 💄 `Tabs`: Optimized tab cannot adapt to the width.
- 💄 `measureTextWidth`: Optimize performance under large data volumes.
- 💄 `<pro>Modal`: Optimized multi-layer drawer animation.
- 💄 `<pro>Lov`: Supported `tableProps` in the form of function callbacks and supported `modal` parameters in modal box mode.
- 💄 `WaterMark`: Optimizing the watermark's judgment of ref leads to a direct error reporting problem in ie.
- 💄 `<pro>ColorPicker`: Modify preset colors to optimize duplicate color values in alternative swatch.
- 💄 `<pro>Dropdown.Button`: Support direct passing in of Button properties and style optimization.
- 💄 `Timeline`: Optimize the color property to set the display effect of custom color values.
- 💄 `<pro>Table`: Optimizes invalid `validationRenderer` property for components set in the `editor` property.
- 💄 `<pro>Radio`: Optimize the Radio check state style.
- 💄 `<pro>Table`: Optimized the `spin` animation effect during data loading to avoid `spin` lag issue in large data volumes.
- 💄 `<pro>Button`: Optimized the triggering behavior of focus styles.
- 🐞 `<pro>DataSet`: Fix the problem that the table client export query parameters are wrong.
- 🐞 `<pro>Table`: Fix data not sync in group mode.
- 🐞 `<pro>Table`: Fix the filtering logic problem of the dynamic filter bar panel.
- 🐞 `<pro>Table`: Fix the problem that the dynamic screening bar presets the tenant configuration that affects the initialization query field.
- 🐞 `<pro>Table`: Fix the problem that the filter reset button disappears when the dynamic filter bar is cleared.
- 🐞 `<pro>Table`: Fix the problem that the switch is not queried under the dynamic filter tab Tabs.
- 🐞 `<pro>Table`: Fix the problem that the selection menu cannot pop up directly when the dynamic filter bar clicks Add Filter when the filter condition is focused.
- 🐞 `<pro>Table`: Fix the problem that the button and input box of the professional search bar are not aligned when the global configuration labelLayout is vertical.
- 🐞 `<pro>Table`: Fix the problem where dragColumnAlign was configured to be left and the display of dragging and swapping positions in editing status was abnormal.
- 🐞 `<pro>Table`: Fix and optimize advanced filtering interaction and styling issues.
- 🐞 `<pro>Table`: Fix the advanced filter panel popup window penetration issue.
- 🐞 `<pro>TriggerField`: Fix the problem that the tooltip flashes and disappears when the drop-down pop-up box appears.
- 🐞 `<pro>Lov`: Fix the alignment problem when the query condition in the professional search bar mode is vertical layout.
- 🐞 `<pro>Lov`: Fixed the problem of duplicate values when the default value exists after setting `autoSelectSingle`.
- 🐞 `ViewComponent`: Fix the problem that the component is not out of focus when switching the disabled state.
- 🐞 `<pro>Modal`: Fix the drag-and-drop exception in Firefox caused by the compatibility of the transformZoomData method.
- 🐞 `<pro>TextField`: Fix style precedence issues.
- 🐞 `<pro>TextField`: Fix the issue of Safari browser disabling font colors that are too light.
- 🐞 `<pro>DatePicker`: Fixed an issue where the first time selected in the `Table` would display the current date in other row selection panels.
- 🐞 `<pro>Tooltip`: Fixed a problem where the package SVG image was displayed but could not be located.
- 🐞 `<pro>IntlField`: Fixed the problem that the character length of the input box corresponding to the current environment language cannot be limited.
- 🐞 `Menu`: Fixed the overlapping problem of text and icons when `SubMenu` content is long & Fixed the disabled background color issue for `SubMenu` & Fixed the issue of all text becoming ellipses when exceeding the limit.
- 🐞 `<pro>CodeArea`: Fixed the issue that the values stored in the dataSet were not formatted synchronously.
- 🐞 `<pro>PerformanceTable`: Fix the issue of fixed column subitems being unable to be dragged before combining columns.
- 🐞 `<pro>Attachment`: Fix the issue of two part `help` prompts at the same time & Fix the issue of `showHelp` being invalid when it is `none`.
- 🐞 `<pro>Rate`: Fix the issue of two part `help` prompts at the same time & Fix the issue of `showHelp` being invalid when it is `none` & Fix the issue of `help` icon style when `labelLayout` is `float` or `placeholder`.
- 🐞 `<pro>Tree`: Fixed the issue that the Tree cable was misaligned.
- 🐞 `<pro>Password`: Fixed the issue that revealing icons could not be used properly when the editor in the table was Password.
- 🐞 `<pro>Select`: Fixed the issue of incorrect `tooltip` judgment when `Select`/`TreeSelect` and other custom rendering `options` are `disabled` or `readOnly` in the selected state.
- 🐞 `<pro>PerformanceTable`: Fixed dynamic filter bar style issue.

## 1.6.0

`2023-02-24`

- 🌟 `configure`: Added `attachment.downloadAllMode`, `formAutoFocus`, `useLookupBatch` property.
- 🌟 `<pro>Tooltip`: Added `popupInnerStyle` property.
- 🌟 `<pro>Table`: Added combination sort editing function.
- 🌟 `<pro>Table`: Added dynamic filter bar to support saving fuzzy search function.
- 🌟 `<pro>Table`: Added dynamic filter bar to support advanced filter configuration function.
- 🌟 `<pro>Lov`: Added `percent` field type display.
- 🌟 `<pro>TextField`: Add `tooltip` property to support overflow prompt in edit mode.
- 🌟 `Calendar`: Added `headerRender` property of customize calendar header content.
- 💄 `<pro>Form`: Extend `labelTooltip` property to support control tooltip properties.
- 💄 `<pro>Table`: Optimize dynamic filter bar style.
- 💄 `<pro>Table`: Optimize `buttonsLimit` rendering, hidden buttons no longer occupy more drop-down positions, the style of more button drop-down items in the query button.
- 💄 `<pro>RichText`: The editing area is highly adaptive in the case of custom toolbars.
- 💄 `<pro>Modal`: Extends the `transitionAppear` property to support controlling animations during `Modal` closure.
- 💄 `<pro>NumberField`: Supported `clearButton` attribute in non-step mode.
- 💄 `Avatar`: Optimize `Avatar.Group` overflow style.
- 💄 `<pro>DatePicker`: Optimize click today and this week to change the style in the case of multiple selections.
- 💄 `<pro>Tree`: Optimize the dragging and sorting of tree components and the problem that icon cannot be dragged.
- 🐞 `<pro>Table`: Fixed the problem of high overflow caused by configuring `autoHeight` as minHeight and personalization at the same time.
- 🐞 `<pro>CodeArea`: Fixed the problem of change `disabled` status.
- 🐞 `WaterMark`: Fixed the problem that the watermark style can be modified.
- 🐞 `<pro>ColorPicker`: Fixed an error when setting `multiple` property to true on a field of `DataSet`.
- 🐞 `<pro>Lov`: Fix the problem that the pull-down panel cannot be closed due to out of focus.
- 🐞 `<pro>Lov`: Fix the problem that the popup mode cascading parameter change does not re-query.
- 🐞 `<pro>Select`: Fix the problem of repeated query when selecting values in pagination in the multi-select reserved query parameter mode.
- 🐞 `<pro>Lov`: Fixed the problem that the default value is repeated by selecting all values.
- 🐞 `<pro>Modal`: Fix an issue where Modal could not adapt to custom width in contentStyle.
- 🐞 `<pro>Modal`: Fix the problem that when the text is too long in picture mode, re upload the text and file name overlap.
- 🐞 `<pro>Password`: Fix an issue where the cursor was positioned in the first place when clicking the reveal icon triggered focus.
- 🐞 `<pro>Form`: Fix the problem of abnormal line breaking under table layout.
- 🐞 `<pro>DatePicker`: Fix the problem that multiple selections of today's date are repeated.
- 🐞 `<pro>TextField`: Fix the problem of displacement of placeholder and focus cursor in multi value mode.
- 🐞 `<pro>Table`: Fix the problem that the console reports an error when the mouse moves into the input box after the dynamic filter bar multi value verification fails.
- 🐞 `<pro>Table`: Fix render errors with filter bar multilingual components.
- 🐞 `<pro>Table`: Fix the problem that the content of the tooltip changes after clicking the cell when the tooltip of the multivalued Lov and Select fields is displayed.
- 🐞 `<pro>Table`: Fix a styling issue when column headers and feet were auto-height.
- 🐞 `<pro>DatePicker`: Fix the color style of confirmation button in DateTime mode.
- 🐞 `WaterMark`: Fixed the problem that selecting a hidden node in the browser console would hide the watermark.
- 🐞 `<pro>Table`: Fix odd and even row style error caused by deleting rows when showRemovedRow is false & When rows are deleted when showRemovedRow is false in virtual scroll mode, the page appears blank and the scroll bar does not shrink.
- 🐞 `<pro>SelectBox`: Fix the problem that verification failed and could not focus automatically.
- 🐞 `<pro>Switch`: Fix the problem that tooltip cannot be displayed when the mouse moves into the help icon when showHelp is set to tooltip.

## 1.5.8

`2022-11-29`

- 🐞 `ViewComponent`: Fixed the pop-up window closing error.
- 🐞 `<pro>Lov`: Fixed the problem that out of focus caused the query parameters to be cleared in the Lov popup mode.

## 1.5.7

`2022-11-28`

- 🌟 `configure`: Added `tableColumnResizeTransition`, `fieldFocusMode`, `selectBoxSearchable`, `selectReserveParam` properties.
- 🌟 `Collapse`: Added property of `collapsible` `hidden`.
- 🌟 `<pro>Lov`: Added property of `popupSearchMode`.
- 🌟 `Tabs.TabPane`: Added `hidden` property.
- 🌟 `Tabs.TabGroup`: Added `hidden` property.
- 🌟 `<pro>Button`: Button text bubble supports `Tooltip` attribute expansion.
- 🌟 Added theme style.
- 🌟 `<pro>Lov`: Added hyperlinks and image types to the list.
- 🌟 `Upload`: Support full status display of reupload in Upload.
- 🌟 `<pro>DataSet.Field`: Added `accept` property.
- 🌟 `<pro>Select`: Added `reserveParam` property.
- 🌟 `<pro>Table`: Added dynamic filter bar `onRefresh` callback.
- 💄 `<pro>DataSet`: When `cacheRecords` is enabled by default in global configuration, you can disable caching by setting `cacheSelection` and `cacheModified` to false.
- 💄 `Table`: Optimize fixed columns.
- 💄 `<pro>Form`: Optimized the style of the `ItemGroup` composite input box.
- 💄 `WaterMark`: Optimize text wrap display.
- 💄 `<pro>TextField`: Optimized tooltip for multiple mode when the selected length is greater than the configured `maxTagCount`.
- 💄 `<pro>Table`: Optimized the display timing of the `\n`.
- 💄 `<pro>Table`: The extension `draggableProps.isDragDisabled` property supports callback functions for determining whether a single row is draggable.
- 💄 `<pro>Table`: Optimize the initial record of `queryDataSet` under the dynamic filter bar.
- 💄 `SecretField`: Optimize SecretField display of null value in read-only case。
- 💄 `<pro>DatePicker`: Optimized date jump interaction when setting the `min` or `max` property.
- 💄 `<pro>Transfer`: Optimize the effect of selecting all when disabled.
- 💄 `<pro>Select`: Optimize the problem that the drop-down multi-selection is out of focus and not verified.
- 💄 `<pro>Table`: Optimized the `help` display in `header`.
- 💄 `<pro>Picture`: Optimize preview interface style and mouse wheel event interaction.
- 💄 `<pro>Table`: Optimize the dynamic filter bar, select multiple required query conditions, and there is no required sign.
- 💄 `<pro>Field`: Optimize lovPara query cache.
- 💄 `<pro>Form`: Optimize that the form will not automatically wrap lines in the table layout.
- 💄 `<pro>Tooltip`: The problem of optimizing tooltip.
- 💄 `<pro>Switch`: Optimize the display of content overflow style and tooltip under Form & Eliminate the interaction effect of redundant active states in the disabled state & Optimize Switch loading centering style.
- 💄 `<pro>ColorPicker`: Optimize an issue where the preset attribute selector position could not be adaptive.
- 💄 `<pro>DatePicker`: Optimized the interaction effect when the `mode` is `time` and the `min` or `max` property is set.
- 💄 `<pro>Lov`: Optimized the display order of selected records with cache in the pop-up.
- 🐞 `<pro>Lov`: Fix the problem that Lov icon clicks the pop-up window many times and pops up many times.
- 🐞 `<pro>IntlField`: Fix the problem that the pop-up window pops up multiple times when the icon is clicked multiple times.
- 🐞 `<pro>Modal`: Fix the problem that the autofocus of the form component in the internal modal is invalid.
- 🐞 `<pro>Modal`: Fix the problem that double clicking on the internal modal configuration `dblclick` will display and close it immediately.
- 🐞 `<pro>Modal`: Fix the issue that the first drag of Modal enabled `autoCenter` was inaccurate.
- 🐞 `<pro>Modal`: Fix the issue that Modal enabled `autoCenter` to cause `maskClosable` to fail.
- 🐞 `<pro>RichText`: Fixed the problem that the selected content was out of focus and cleared.
- 🐞 `<pro>RichText`: Fix content overflow height issue and placeholder style issue.
- 🐞 `<pro>RichText`: Fixed an issue where keyboard ESC closed with an error.
- 🐞 `<pro>RichText`: Fixed an issue with float layout style.
- 🐞 `<pro>Table`: Fix the problem of field value comparison in the dynamic filter reset button ambiguous query parameter clear && range mode && status && delete filter not reset error.
- 🐞 `Affix`: Fix an issue where a fixed positioning style was added when scroll distance was not generated.
- 🐞 `ViewComponent`: Fixed the problem that the input is still focused when the `hidden` or `disabled` attribute is switched.
- 🐞 `<pro>Cascader`: Fixed the display problem of active item after selecting values in controlled mode without using `DataSet`.
- 🐞 `<pro>Upload`: Fixed the interaction style of upload type components Upload, &lt;pro&gt;Upload and &lt;pro&gt;Attachment in disabled mode.
- 🐞 `<pro>TextField`: Fix the problem of ellipsis when `text-transform` is `uppercase` in `isFlat` mode.
- 🐞 `<pro>DataSet`: Only when `cacheSelection` is true in `cacheRecords` mode, cache is forced to be checked.
- 🐞 `<pro>DataSet`: Fix the problem of getting unchecked cache records when selecting all across pages.
- 🐞 `<pro>DataSet`: Fix `clearCachedSelected` method can't clear checked records of changed state.
- 🐞 `<pro>DataSet`: Fix the issue that the bigNumber formatting configuration was invalid.
- 🐞 `Upload`: Fix `beforeUpload` async issue.
- 🐞 `Upload`: Fix the problem that the `beforeUpload` event callback will not trigger when re uploading.
- 🐞 `<pro>Lov`: Fix the problem of table width in `popup` mode.
- 🐞 `<pro>Lov`: Fixed the onRow event not working in `popup` mode.
- 🐞 `<pro>Attachment`: Fix the problem that cannot be automatically located when validation failed.
- 🐞 `<pro>Attachment`: fix popup rendering & children props in drag mode.
- 🐞 `Tabs`: Fix the problem of the arrow display.
- 🐞 `SecretField`: Fix SecretField after editing the null value, editing it again requires verification.
- 🐞 `Badge`: Fix the problem that the style level of point Badge is higher than fixed column when it is used in Table.
- 🐞 `<pro>Table`: Fix the problem that the check icon in the display setting is not aligned and the content is blocked in the customization settings.
- 🐞 `<pro>Attachment`: Fixed the problem that only one file was displayed when multiple files were uploaded for the first time in drag and drop mode.
- 🐞 `<pro>NumberField`: Fixed after configuration global property `numberFieldFormatterOptions`, component property `numberGrouping` failure problem.
- 🐞 `<pro>Modal`: Fix the problem that the getContainer is set in the ModalProvider and cannot be centered with useModal.
- 🐞 `<pro>Tree`: Fix the failure of onKeyDown.
- 🐞 `<pro>Switch`: Fix the problem that onMouseDown can only be triggered by clicking the left side under Form.
- 🐞 `<pro>TextArea`: Fix invalid of `renderer`.
- 🐞 `<pro>Table`: Fix the problem that the overflow effect of `tooltip` setting is incorrect.
- 🐞 `<pro>Mentions`: Fix support for renderer attribute.
- 🐞 `<pro>Switch`: Fix the problem that the label area is not aligned when used under Form & Misalignment of loading circle in the loading state & Error position display problem in the form loading status.
- 🐞 `<pro>Table`: Fix the problem of asynchronous loading tree table paging, click to expand and jump to the first page.
- 🐞 `<pro>Table`: Fix the problem that the dynamic conditions of the professional query bar are displayed and hidden.
- 🐞 `<pro>Output`: Fix an issue where two tooltips were displayed when Output multi-value overflow.
- 🐞 `<pro>Table`: Fix an issue where the `editor` is not displayed when editing mode is partially `inline`.
- 🐞 `<pro>Table.Column`: Fix `tooltipProps` delayed property support.
- 🐞 `<pro>Table`: Fix the style problem caused by turning `rowHeight` of tree table to auto.
- 🐞 `<pro>Modal`: Fix the problem that setting the top style does not work when the embedded Modal setting `autoCenter` is false.
- 🐞 `<pro>IntlField`: Fixed an issue where the input field could not be resized more than once when the `resize` property was set to `both`.
- 🐞 `<pro>Mentions`: Fixed an issue where `split` would display double copies when the `split` property was set to be more than one char.
- 🐞 `<pro>Picture`: Fixed the preview error caused by the `preview` property.
- 🐞 `<pro>Select`: Fixed that the blank value in the compound input box is not clear.
- 🐞 `<pro>Table`: Fixed `expandRowByClick` property invalidation.

## 1.5.6

`2022-08-25`

- 🌟 `configure`: Added `lovNoCache`,  `uploadShowReUploadIcon`, `performanceTableAutoHeight`, `fieldMaxTagCount`, `fieldMaxTagPlaceholder`, `modalClosable`, `cacheRecords`, `tableShowCachedTips`, `attachment.fetchFileSize` properties.
- 🌟 `<pro>Attachment`: Added `onRemove` property.
- 🌟 `<pro>Table`: Added `getHeaderGroups`, `getGroups` methods.
- 🌟 `<pro>Table`: Added `saveToCustomization` parameter on `setColumnWidth` method.
- 🌟 `<pro>Table`: Added `getScrollInfo` method for `onScrollTop` and `onScrollLeft` hook parameters.
- 🌟 `<pro>Table`: Added `boxSizing`, `showCachedTips`, `fullColumnWidth` properties.
- 🌟 `<pro>Table.Column`: Added `tooltipProps` property, added `groups` parameter on `header` property.
- 🌟 `<pro>DataSet.Field`: Added `dateMode` property.
- 🌟 `Avatar`: Added `Avatar.Group` supports.
- 🌟 `Notification`: Added `icons` configuration.
- 🌟 `Upload`: Added `beforeUploadFiles` property.
- 🌟 `<pro>Lov`: Add `transformSelectedData` hook in Lov configuration.
- 🌟 `WaterMark`: Added component of WaterMark.
- 🌟 `<pro>Segmented`: Added component of `Segmented`.
- 🌟 `<pro>Button`: Add the secondary color.
- 🌟 `List`: Added association `DataSet` support and `rowSelection` selectable support.
- 🌟 `Card`: Added `selected` and `cornerplacement` attributes to cards and card groups.
- 🌟 `<pro>Cascader`: Added `optionRenderer` property.
- 🌟 `<pro>Cascader`: `popupContent` hook adds `content` `dataSet` `textField` `valueField` `setValue` and `setPopup` parameters.
- 💄 `configure`: extend the confirm configuration parameter to support dynamic filter bar query related prompts and paging prompts to be distinguishable.
- 💄 `Upload`: Optimized the re-upload button and function. And optimize scenarios where the `multiple` property is `false` and change the default value of the `multiple` property to `true`.
- 💄 `Trigger`: Optimize auto-alignment when content size changes.
- 💄 `<pro>PerformanceTable`: Optimize the use of `autoHeight` and add new usage methods for `autoHeight` objects.
- 💄 `<pro>PerformanceTable`: Optimize the filter query bar function.
- 💄 `<pro>Lov`: If there is no title property in the Lov configuration, use the label property.
- 💄 `<pro>Table`: Optimize dynamic filter bar help rendering.
- 💄 `<pro>Table`: The cell tooltip will pop up automatically after optimizing the check positioning.
- 💄 `<pro>Table`: Optimized combobar mode when help and sort icons appear in the in-line search.
- 💄 `<pro>Typography`: Optimize the use of paragraph components under form to increase the style value of margin bottom and correct the problem of small style capitalization.
- 💄 `<pro>Cascader`: Optimize the style of the selection panel that pops up from the right.
- 💄 `<pro>TimePicker`: Optimize mouse scrolling speed on the timeline.
- 💄 `<pro>Radio`: Optimize styles.
- 💄 `<pro>NumberField`: Optimized to input decimal point in Chinese input method.
- 💄 `<pro>Lov`: Optimized `onBeforeSelect` callback, support for returning a Promise object.
- 💄 `<pro>Lov`: Optimized disable the selection drop-down option during input field search.
- 💄 `<pro>Table`: Optimized the display of multiple selected field values in the dynamic filter bar.
- 💄 `<pro>Table`: Removed form layout controls for pro search bar.
- 💄 `<pro>Table`: Optimized dynamic filter bar queries support `modifiedCheck` prompt.
- 💄 `<pro>Table`: Optimize the dynamic filter bar Lov component click popup interaction.
- 💄 `<pro>Table`: Optimize expanded row control in non tree mode.
- 💄 `<pro>Table`: The problem of column width rebound occurs when optimizing column dragging.
- 💄 `<pro>Table`: Optimized setting when tree data is loaded asynchronously, the parent level is selected and the child level is selected after expansion.
- 💄 `<pro>SelectBox`: Optimized required styles.
- 💄 `<pro>Select`: Optimize the interactive processing of multi-choice search.
- 💄 `<pro>DataSet.Field`: Optimized the priority of the `numberGrouping`, `formatterOptions`, `required`, `range`, `highlight`, `help` properties.
- 💄 `<pro>Form.ItemGroup`: Optimized the `TS` type declarations for component properties.
- 💄 `<pro>Attachment`: Optimize component help rendering.
- 💄 `<pro>Lov`: Optimized the width style calculation problem when setting the `multiple` and `isFlat` properties.
- 💄 `<pro>IntlField`: Optimized multi-line display.
- 💄 `<pro>RichText`: Optimized required style and height.
- 💄 `<pro>Table`: Optimized newline display of input values when used TextArea.
- 🐞 `Trigger`: Fixed the issue that other input boxes could not lose focus after clicking the drop-down list.
- 🐞 `Table`: Fix the problem that the column headers will be misaligned.
- 🐞 `<pro>RichText`: Fix rich text editor validation issues.
- 🐞 `<pro>RichText`: Fixed an issue where line breaks were retained after clearing the rich text editor.
- 🐞 `<pro>Attachment`: Fixed the problem that an error occurred when the batch count query interface returned empty.
- 🐞 `<pro>Validator`: Fixed the issue that the value range check of the date type did not take effect.
- 🐞 `<pro>DataSet`: Fix number field cannot convert boolean values to 1 and 0.
- 🐞 `<pro>DataSet`: Fix the wrong count value obtained by query method in asynchronous count mode.
- 🐞 `<pro>DataSet`: Fixed cached created data cannot be deleted.
- 🐞 `<pro>ColorPicker`: Fixed the problem that opacity not being able to enter '.', and fix the prefix border style when default color is light.
- 🐞 `<pro>DatePicker`: Fix the issue that when there is a min value in `range` and `editorInPopup` modes, an error may be reported after entering the value.
- 🐞 `<pro>DatePicker`: Fix `defaultTime` value error when it exceeds `min` and `max`.
- 🐞 `<pro>Modal`: Fix the problem of customize fail in embedded mode.
- 🐞 `<pro>Select`: Fix the error of value type object in combo mode.
- 🐞 `<pro>Select`: Fix error when pressing pageDown.
- 🐞 `<pro>Select`: Fix `searchMatcher` not working when using options prop.
- 🐞 `<pro>Table`: Fix error when element may be null.
- 🐞 `<pro>Table`: Fix error when the column configuration in the `columnProps.children` property of column grouping has no key and name.
- 🐞 `<pro>Table`: Fix group state loss problem.
- 🐞 `<pro>Table`: Fix the problem that the custom function editor component editor cannot be located.
- 🐞 `<pro>Table`: Fix an issue where the splitLine position was incorrect when dragging the table column width.
- 🐞 `<pro>Table`: Fix the problem of using querydataset to report errors under the use of combined search bar.
- 🐞 `<pro>Table`: Fix the problem of incorrect query conditions after deleting the field conditions after setting range in filterbar.
- 🐞 `<pro>Table`: Fix tooltip width calculation error overflow prompt problem.
- 🐞 `<pro>IconPicker`: Fix an issue where the selected style was overwritten by the hover style.
- 🐞 `Badge`: Fix a processing status point style issue.
- 🐞 `Upload`: Fix an issue with margin-top collapse style in picture-card mode.
- 🐞 `<pro>PerformanceTable`: Fix the problem of style caused by fixed columns in the case of row merging.
- 🐞 `<pro>PerformanceTable`: Fix an issue where the highlighted row was abnormal when scrolling virtually.
- 🐞 `<pro>Range`: Fix the problem that `readOnly` throw is configured for operation.
- 🐞 `<pro>Mentions`: Fix setting `autoSize` property invalid.
- 🐞 `<pro>ColorPicker`: Fix the problem of get `preset` parameter failed, and fixed an exception caused by calculating relative brightness without value.
- 🐞 `<pro>Table`: Fixed multiple tooltips when using PopConfirm.
- 🐞 `<pro>Table`: Fix the problem that the record does not correspond when editing the header grouping cell.
- 🐞 `<pro>Table`: Fix the problem that the disabled row can be navigated to edit by enter key.
- 🐞 `<pro>Table`: Fix row height problem when switching from aggregate to tile in `virtual` and `virtualCell` mode.
- 🐞 `<pro>Table`: Fix browser zoom issue.
- 🐞 `<pro>Table`: Fix infinite loop in tree mode.
- 🐞 `<pro>Table`: Fixed an issue with drag-and-drop sorting across locked columns.
- 🐞 `<pro>Table`: Fix the problem that the customization modal may pop up multiple times.
- 🐞 `<pro>Table`: Fix the problem that Popover cannot be closed when the Table's customization modal pops up which inside the Popover.
- 🐞 `<pro>Table`: Fix editor misalignment when row height changes.
- 🐞 `<pro>Table`: Fix `headerRowHeight` and `footerRowHeight` not working when `rowHeight` is auto.
- 🐞 `<pro>Tooltip`: Fix the problem of error reporting in tooltip zoom mode.
- 🐞 `<pro>CodeArea`: Fix the problem that the value display is not synchronized through the data source assignment after out of focus in the data source mode.
- 🐞 `<pro>ColorPicker`: Fix the problem of value error setting in the `range` and `multiple` mode.
- 🐞 `<pro>IntlField`: Fix the issue that the value will be cleared when the popup is canceled.
- 🐞 `<pro>Tooltip`: Fix the problem of error reporting in tooltip zoom mode.
- 🐞 `Tabs`: Fix the problem that the dataset validation badge cannot be cleared when call the remove method.
- 🐞 `<pro>Button`: Fix the problem of focus style after changing the `disabled` attribute of the button.
- 🐞 `<pro>Cascader`: Fixed when the `searchable` property is set to `true` and the same value is displayed at the same level in the `options`, choose value error.
- 🐞 `<pro>ColorPicker`: Fix the problem that the converting to hex failed when entering RGBA.
- 🐞 `<pro>TextArea`: Fix autoSize not scrolling when maxRows and minRows line configurations are equal.

## 1.5.5

`2022-06-22`

- 🌟 `configure`: Added `autoInsertSpaceInButton`, `attachment.getTemplateDownloadUrl` `autoCount`, `countKey`, `drawerHeaderFooterCombined`, `colorPreset` properties. Added `totalCount`, `count`, `onlyCount`, `, defaultCount` parameter for `generatePageQuery` hook.
- 🌟 `<pro>DataSet`: Added `autoCount`, `countKey` properties. Added `counting` value.
- 🌟 `<pro>DataSet.Field`: Added `template` property.
- 🌟 `<pro>Attachment`: Added `template` property.
- 🌟 `<pro>Transfer`: Added `setTargetOption` property when used to customize the preset target data source of the component shuttle box.
- 🌟 `<pro>ColorPicker`: Added `mode`, `preset` properties. Added recently used function. Support Hex, RGBA settings.
- 🌟 `math`: Added `max`, `min`, `abs`, `sum`, `random`, `isValidNumber`, `toString` methods.
- 🌟 `<pro>IntlField`: Added `displayOutput` property.
- 💄 `configure`: `attachment.getPreviewUrl` return value supports hook types with return values of string and Promise<string>.
- 💄 Optimize the impact of the `ConfigProvider` context.
- 💄 Optimize the influence of `range` and `multiple` attributes on Autocomplete, EmailField, IconPicker, IntlField, Password, Secretfield, Select and UrlField components.
- 💄 `<pro>DatePicker`: Optimize the effect of the `filter` property on the selection panel.
- 💄 `<pro>Switch`: Optimize styles.
- 💄 `<pro>Table`: The display mode of optimized verification information is fixed to tooltip.
- 💄 `<pro>Table`: Optimize the scenario where the input query condition is overwritten when autoQuery false is optimized.
- 💄 `Notification`: Optimize long word wrapping rules.
- 💄 `<pro>PerformanceTable`: Compatible with the global configuration `renderEmpty`.
- 💄 `<pro>NumberField`: Optimized conversion of scientific notation to normal strings.
- 💄 `InputNumber`: Optimized conversion of scientific notation to normal strings.
- 💄 `<pro>Transfer`: Optimize the situation of page jam when customizing tansfer to select all shuttles under large amount of data.
- 💄 `<pro>TextArea`: Optimized `autoSize` mode, the component will not automatically update the height after the `dataSet` of the data changes.
- 💄 `<pro>Attachment`: Optimized for asynchronous preview of image types in `text` mode.
- 🐞 Fix the bug of mobx-react in lower version.
- 🐞 `Align`: Fixed logic error caused by keyword nodeName.
- 🐞 `formatter`: Fix the problem of invalid formatting precision parameter for big numbers.
- 🐞 `Table`: Fix the problem that the combined column headers will be misaligned.
- 🐞 `Table`: Fixed scrollbar issue in fixed header on mac.
- 🐞 `Tabs`: Fix the problem that the dataset validation badge cannot be cleared when call the reset method.
- 🐞 `Tabs`: Fix scrollTo error in IE.
- 🐞 `Upload`: Fix AjaxUploader reporting 'target' of undefined error.
- 🐞 `<pro>Tabs`: Fixed the problem that the validation badges did not disappear when DataSet reset.
- 🐞 `<pro>Table`: Fix other editors are misplaced in full line editing mode when the autoSize TextArea entering newlines.
- 🐞 `<pro>Table`: Fix the problem of virtual scrolling in `maxHeight` style.
- 🐞 `<pro>Table`: Fix the problem that column width cannot be adjusted on mobile devices.
- 🐞 `<pro>Table`: Fix the positioning problem of the reload editor in `inline` editing mode.
- 🐞 `<pro>Table`: Fix the issue of saving edits in the dynamic filter bar.
- 🐞 `<pro>Table`: Fixed editor disappearing when virtual scrolling.
- 🐞 `<pro>Table`: Fix the problem that the column header is misplaced at a certain height.
- 🐞 `<pro>Table`: Fix an issue with the renderEmpty style.
- 🐞 `<pro>Table`: Fix offsetParent error.
- 🐞 `<pro>Attachmen.Group`: Fix incorrect count when child node has `Fragment` in `popup` mode.
- 🐞 `<pro>TreeSelect.TreeNode`: Fix `selectable` property not working.
- 🐞 `<pro>Cascader`: Fixed `multiple` `changeOnSelect` being set to `true` and `expandTrigger` to `hover` being unchecked. As well as the optimization of multi-select value will automatically fold up the pop-up box.
- 🐞 `<pro>TreeSelect`: Fixed an issue where the `showCheckedStrategy` property value was `SHOW_PARENT` or `SHOW_CHILD` and some of the case values were displayed incorrectly. And fix the `TreeNode` component setting the `disabled` property incorrectly.
- 🐞 `<pro>Dropdown`: Fix `disabled` attribute will affect child elements.
- 🐞 `<pro>PerformanceTable`: Fix the display problem that the column width of personalized save may appear under large numbers.
- 🐞 `<pro>PerformanceTable`: Fix `selectedRowKeys` controlled invalidation.
- 🐞 `<pro>PerformanceTable`: Fix error by row click.
- 🐞 `<pro>Modal`: Fixed an issue where updating `resizable` was invalid.
- 🐞 `<pro>Modal`: Fix the `resizable` problem when multiple drawers.
- 🐞 `<pro>IconPicker`: Fix the problem that the null value is out of focus and not checked.
- 🐞 `<pro>DataSet.Record`: Fix an issue where big number values may not be updated.
- 🐞 `<pro>Modal`: Fixed custom failure caused by bigNumber.
- 🐞 `<pro>Modal`: Fixed the problem of `Cannot read property 'tagName' of null`.
- 🐞 `Upload`: Fix the problem that the loading status does not change after uploading successfully.

## 1.5.4

`2022-04-27`

- 🌟 `configure`: Added `dateTimePickerOkButton`, `onComponentValidationReport` property and deprecated `bigNumberFormatter`.
- 🌟 `Tabs`: Added `flex` property.
- 🌟 `<pro>CheckBox`: Implement `showHelp`.
- 🌟 `<pro>Table`: Added `treeFilter` property.
- 🌟 `<pro>Switch`: Added `loading` property.
- 🌟 `<pro>Dropdown`: Added `Dropdown.Button` component.
- 🌟 `<pro>DatePicker`: Added `useInvalidDate` property.
- 🌟 `<pro>Table`: The dynamic filter bar supports whether to save the filter value, and the tenant is personalized.
- 🌟 `<pro>Table`: Added `selectionBoxRenderer` property to support checkbox renderer.
- 🌟 `<pro>NumberField`: Deprecated `stringMode`.
- 🌟 `Statistic.Countdown`: Added `formatter` property.
- 💄 `configure`: Optimize the hook parameters for the count of attachments in batch query can bring bucket information.
- 💄 `<pro>Table`: Optimize the display of constant width of number type in cells.
- 💄 `<pro>Table`: Optimized the display width of query fields entered in the `advancedBar`.
- 💄 `<pro>DatePicker`: Optimized when date switch in the `range` mode then the date display error in panel. And optimized when out of focus in the `range` mode, flash current date in panel problem.
- 💄 `<pro>DatePicker`: Optimized an issue where clicking Tab will automatically select `hover` on the date panel.
- 💄 `<pro>DatePicker`: When `mode` is set to `dateTime` or `time`, remove the "Ok" button and automatically select the value after losing focus.
- 💄 `<pro>DatePicker`: When the optimization mode is `time` mode, the rolling speed of the touch panel is fast.
- 💄 `Input & <pro>TextField`: Optimize the display logic between floating `label` and `placeholder` to be consistent with material design.
- 💄 `<pro>Transfer`: Optimized the style when setting `help` property. And remove the influence of the `range` property.
- 💄 `<pro>TextArea`: Mask the `multiple` property.
- 💄 `<pro>TextArea`: Optimization clicking the clear button will cause defocus.
- 💄 `InputNumber`: Support BigNumber.
- 💄 `Menu.Item`: Adjust the display style of the `a` element.
- 💄 `Form`: Optimize the display style of `spacingType` between.
- 💄 `<pro>AutoComplete`: Optimize `suffix` display.
- 💄 Canonical enumeration type.
- 💄 `<pro>TextArea`: Optimize the defocus of the clear button.
- 💄 `Tabs`: Displays tabs based on the length of sub-tabs.
- 🐞 `Popover`: Fix the problem of not aligning inside iframe.
- 🐞 `Tabs`: Fix the problem of validation badge style.
- 🐞 `Tabs`: Fix the problem that the container cannot be scrolled when there is a scroll bar with a custom style.
- 🐞 `Tabs`: Fix the problem that disabled tabs can be set as default.
- 🐞 `Input`: Fix the problem that Chinese cannot be input by default.
- 🐞 `Input`: Fix the problem that the input will automatically lose focus by first character inputted when there is a placeholder and no label property.
- 🐞 `Pagination`: Fix the problem that the pagination drop-down box will be blocked under the container whose `overflow` style is hidden.
- 🐞 `Table`: Fix the problem that cannot be queried after the filter bar is out of focus.
- 🐞 `<pro>Attachment`: Fix value change not updating attachment list.
- 🐞 `<pro>Table`: Fix the problem that pressing Tab to switch editors in virtual cell mode may be inaccurate.
- 🐞 `<pro>Table`: Fix loading state not clearing.
- 🐞 `<pro>Table`: Fix the problem of virtual scrolling in `maxHeight` style.
- 🐞 `<pro>Table`: Fix the problem of row height changing in `aggregation` and `virtualCell` mode when all aggregate columns are not displayed.
- 🐞 `<pro>Table`: Fix the problem that the column header is misplaced at a certain height.
- 🐞 `<pro>Lov`: Fix the problem that clicking the button will directly close the window in popup mode and safari or Wechat browser.
- 🐞 `<pro>PerformanceTable`: Fix the problem that the input box component cannot focus in the cells with rowspan.
- 🐞 `<pro>PerformanceTable`: Fix the problem of missing horizontal virtual scrolling data.
- 🐞 `<pro>DatePicker`: Fix the issue that dates filtered by `filter` can be selected by keyboard.
- 🐞 `<pro>Output`: Fix floating label display issue when content wraps.
- 🐞 `<pro>Dropdown`: Fix the problem that setting `disabled` cannot take effect.
- 🐞 `<pro>IntlField`: Fix the problem that the value is not reset after the popup is canceled.
- 🐞 `<pro>NumberField`: Fix the problem that decimals cannot be entered when `valueChangeAction` is `input`.
- 🐞 `<pro>NumberField`: Fixed the problem that when you click the `step` button on the touch pad of laptop computer, the step distance becomes twice the value of `step` property.
- 🐞 `<pro>Form`: Fix asterisk style when label is left.
- 🐞 Fix the issue where the style was missing when the component was loaded on demand.
- 🐞 `<pro>DatePicker`: Fixed bug `renderExtraFooter` displays double copies in `dateTime` mode. And fixed display error when `multiple` and `editorInPopup` properties settings at the same time.
- 🐞 `<pro>CheckBox`: Fixed the invalid showHelp property in Form.


## 1.5.3

`2022-03-23`

- 🌟 merge `hzero-ui`.
- 🌟 `configure`: Added `modalMovable` property.
- 🌟 `Collapse.Panel`: Added `dataSet` property.
- 🌟 `Tabs.TabPane`: Added `dataSet` property.
- 🌟 `<pro>DataSet`: Added `selectAllPage`, `unSelectAllPage` events.
- 🌟 `<pro>DataSet.Record`: Added `selectedTimestamp` value.
- 🌟 `<pro>Transfer`: Added for receiving children's custom rendering list.
- 🌟 `<pro>Attachment`: Added `getUUID`, `showSize` properties.
- 🌟 `<pro>Output`: Added display of `label` when `labelLayout` is `float` mode.
- 🌟 `<pro>Table`: Added `autoValidationLocate` property.
- 🌟 `<pro>Form`: Added `autoValidationLocate` property.
- 🌟 `<pro>Form`: Added `ItemGroup` combination input box.
- 🌟 `<pro>DataSet`: Added `treeCheckStrictly` property.
- 🌟 `<pro>Typography`: Added `Typography` component.
- 🌟 `<pro>CheckBox`: Added show help function.
- 💄 `Upload`: Optimize the display style of non-picture files in `picture-card` mode.
- 💄 `<pro>Table`: The `hideable` of required columns is always false.
- 💄 `<pro>Modal`: Optimized the resizing transition in Lov.
- 💄 `<pro>Table`: Optimized the error tip style.
- 💄 `<pro>Table`: Optimize the rendering of the limit component when the filter bar query component is `hidden`.
- 💄 `<pro>Range`: Optimization of data value display and occlusion of adjacent marks.
- 💄 `<pro>Table`: Optimized combination search bar is set with `bodyexpandable`, which blocks the problem of the search button.
- 💄 `<pro>Table`: Optimized problem of adaptive `rowheight` in optimized combination search.
- 💄 `<pro>Table`: Optimized no alignment problem in selecting lov condition button in optimization search bar.
- 💄 `<pro>Lov`: Optimize `mode` `viewMode` type declaration.
- 💄 `<pro>DataSet`: Optimize validation when the `min` or `max` attribute of a `field` is set to `fieldName`.
- 💄 `<pro>NumberField`: Optimize the problem of integer and decimal merging when setting `step` property and `defaultValue` to decimals then update value.
- 🐞 `version`: Fix error in webpack5.
- 🐞 `Tabs`: Fixed the problem that tabs are not aligned if one tab property is empty.
- 🐞 `<pro>TreeSelect`: Fixed display error when using `lookupAxiosConfig` and returning tree data when selecting child node.
- 🐞 `<pro>Lov`: Fix the problem of out-of-focus data change caused by repeated display values.
- 🐞 `<pro>Modal`: Fix the problem that multiple modals may be closed by the ESC key.
- 🐞 `<pro>Modal`: Fix the problem that the mask doesn't animate when closed.
- 🐞 `<pro>ColorPicker`: Fixed `prefix` color block missing.
- 🐞 `<pro>Table.Column`: Fix `onCell` not working in virtual cells.
- 🐞 `<pro>Select`: Fix the problem that the disabled options can be deleted by backspace key in multiple mode.
- 🐞 `<pro>DataSet`: Fix the problem that cached selection records are not submitted when the value is changed or when `dataToJSON` is `all`.
- 🐞 `<pro>Attachment`: Fix the problem that the count of attachments will not be queried when passing dataSet through Form context in popup mode.
- 🐞 `<pro>Tooltip`: Fixed missing default value of duration in singleton mode.
- 🐞 `<pro>Attachment`: Fix the problem that the sortable interface will also be called when sortable is false.
- 🐞 `<pro>Table`: Fix the problem of column misalignment caused by hidden aggregation columns in aggregation mode.
- 🐞 `<pro>Table`: Fixed the problem that the table filterbar clicks the clear button to execute multiple queries.
- 🐞 `<pro>Table`: Fixed the issue that the dynamic query bar Lov could not be echoed.
- 🐞 `<pro>Table`: Fix the problem that the refresh button of the dynamic query bar is not displayed.
- 🐞 `<pro>Table`: Fix the problem that the SelectBox editor cannot be switched in `aggregation` mode.
- 🐞 `<pro>Form`: Fixed colon not showing under grid layout, and `Output` style issues.
- 🐞 `<pro>Form`: Fix the label style issue under `vertical` layout.
- 🐞 `<pro>Lov`: Fixed the problem that the onBeforeSelect event would be triggered when checking records in multiple mode.
- 🐞 `<pro>Lov`: Fixed the modal width exception when reopens drawer mode.
- 🐞 `<pro>Lov`: Fix the problem that the check status in the drop-down box is not synchronized after deleting multiple selection values in popup mode.
- 🐞 `<pro>Lov`: Fixed an issue where the window might not be opened again.
- 🐞 `<pro>Lov`: Fix `lovQueryCachedSelected` property doesn't take effect when switching pagination.
- 🐞 `<pro>Button`: Fix related dataSet loading state exception.
- 🐞 `<pro>Button`: Fix the problem of losing focus in loading state.
- 🐞 `<pro>Table`: Fix the problem that the cell contents is not aligned.
- 🐞 `<pro>TextField`: Fix the problem that the value is not synced to the DataSet when pressing ctrl+z to fallback in blur status.
- 🐞 `<pro>TextField`: Fix the problem where the input box obscured content when multi-value.
- 🐞 `<pro>Tree`: Fix parent and son nodes `checkable` status individual control error.

## 1.5.2

`2022-02-16`

- 🌟 `configure`: Added `onTabsChange`, `onButtonClick`, `tableHeaderRowHeight`, `tableFooterRowHeight`, `xlsx`, `attachment.defaultChunkSize`, `attachment.defaultChunkThreads`, `attachment.onBeforeUpload`, `attachment.onBeforeUploadChunk`, `lovSelectionProps`, `modalResizable` properties.
- 🌟 `<pro>DataSet`: Added `forceSubmit` method. `ValidationRule` add `disabled` hook.
- 🌟 `<pro>DataSet.Field`: Added `useChunk`, `chunkSize`, `chunkThreads`, `fileKey`, `fileSize` properties.
- 🌟 `<pro>Table`: Added the `setColumnWidth` instance method, added `renderEmpty` property, and added `index` property on the parameter of the `onColumnResize` hook. `rowHeight` supports hooks.
- 🌟 `<pro>Table.Column`: Added `aggregationTreeIndex` property. Added `aggregationTree` property on the parameter of the `renderer`, `header` and `footer` hook.
- 🌟 `configure`: Added `min`, `max` properties.
- 🌟 `<pro>Table`: Added query bar type of `comboBar` and configuration item of queryBarProps.
- 🌟 `<pro>Attachment`: Added new upload mode of `Attachment.Dragger`. Added `useChunk`, `chunkSize`, `chunkThreads` properties.
- 🌟 `<pro>Form`: Added spacingType property.
- 🌟 `<pro>PerformanceTable`: The cell implements `renderEmpty`.
- 🌟 `<pro>Modal`: Added `resizable`, `customizable`, `customizedCode` properties.
- 🌟 `<pro>Mentions`: Added `Mentions` component. And remove basic `Mention` component.
- 💄 `<pro>Table`: Optimize front-end export and support export check.
- 💄 `Alert`: Optimize the layout style of the component.
- 💄 `<pro>Form`: Optimize `separateSpacing` to support responsiveness and support number and numbers value type.
- 💄 `<pro>DatePicker`: Optimize `hover` selection display, and optimize display styles in `isFlat` and `range` mode. And optimize `dateTime` mode date selection.
- 💄 `<pro>Attachment`: The button displays a error color when the upload fails in `popup` mode.
- 💄 `<pro>Table`: Optimize the dynamic query bar to enter repeated query and click on the label to get focus is invalid.
- 💄 `<pro>PerformanceTable`: Optimize tree indentation of PerformanceTable.
- 💄 Remove prop-types.
- 💄 `<pro>TextField`: Optimize the `prefix` style.
- 💄 `<pro>Lov`: Optimize the selected interaction in drawer mode.
- 🐞 `<pro>DatePicker`: Fix the problem of displaying 'Invalid date' after clearing the value of input box in `range` and `editorInPopup` mode.
- 🐞 `<pro>Lov`: Fix the problem that the popup window cannot be closed when clicking the last page of the pagination in `popup` mode.
- 🐞 `<pro>Lov`: Fix the null value in the first render when `autoSelectSingle` is turned on.
- 🐞 `<pro>Table`: Fix the problem of virtual scrolling in `aggregation` mode.
- 🐞 `<pro>Table`: Fix the height calculation problem when there is a horizontal scroll bar.
- 🐞 `<pro>Table`: Fix the problem of the lock of group set to false.
- 🐞 `<pro>Table`: Fix the problem that new child nodes could not be cleared by reset in tree mode.
- 🐞 `<pro>Table`: Fix the problem that the initial state of the dynamic filter bar asynchronous query rendering is wrong.
- 🐞 `<pro>Table`: Fix the problem that TextArea editor may be shaking after resizing.
- 🐞 `<pro>Table`: Fix the problem that split line stick to the mouse.
- 🐞 `Alert`: Fix the problem of overflow without line feed when the information is long.
- 🐞 `<pro>NumberField`: Fixed an invalid `min` or `max` property value set to 0. And fixed data verification error when `step` is set and `max` is less than 0.
- 🐞 `<pro>Range`: Fix the problem that the slider cannot be dragged after dragging another slider in `range` mode.
- 🐞 `<pro>PerformanceTable`: Fix the problem that selecting all in the check column was disabled.
- 🐞 `<pro>PerformanceTable`: Fix an issue where dragging column width under combined column indicates incorrect line position.
- 🐞 `<pro>Lov`: Fixed `z-index` style in drawer mode.
- 🐞 `<pro>Record`: Fixed the problem of incorrectly filtering 0 and false in multi-select mode.
- 🐞 `<pro>DataSet`: Fixed the issue that the page could not be turned after submitting the write-back data successfully.
- 🐞 `<pro>DataSet`: Fixed `cacheSelection` and `cacheModified` are not working when use `appendData`.
- 🐞 `<pro>Select`: Fix the problem that the drop-down box is not aligned when the browser font size is not default.
- 🐞 `<pro>Select`: Fixed the search content mismatch caused by drop-down paging search without transferring parameters on the second page.
- 🐞 `<pro>Select`: Fixed the problem that the drop-down paging search will query every time it is selected.
- 🐞 `<pro>Validator`: Fix the validation problem when `pattern` is a regular object with global tag.
- 🐞 `<pro>Attachment`: Fix first upload file not showing immediately before successful.
- 🐞 `<pro>Attachment`: Fix the problem that the file that failed to upload for the first time cannot be deleted.
- 🐞 `<pro>Attachment.Group`: Fix the issue that "no attachment" is always displayed in list mode.
- 🐞 `WeekPicker`: Fix style issue.
- 🐞 `<pro>FormField`: Fixed `Cascader` rendering display values in `Output` and `TableCell`.
- 🐞 Fix the style problem when the browser font size is not default.
- 🐞 `<pro>DataSet`: Fixed the verification error of whether `Field` in `DataSet` is modified when `Cascader` component sets `multiple` property to `true`.
- 🐞 `<pro>Table`: Fixed `queryBar` as `bar`, filter field set `range` or `multiple` property style, and `datetime` type field display error.
- 🐞 `<pro>Table`: Fix the problem that the editor is not aligned when the column changes dynamically.
- 🐞 `<pro>Lov`: Fix multi-select rendering error in `button` mode.
- 🐞 `<pro>Lov`: Fix the problem that the data may not be displayed when the first popup.

## 1.5.1

`2022-01-06`

- 🌟 `configure`: Added `bigNumberFormatter`, `tableHeightChangeable`, `tableColumnResizeTrigger` properties. The return value of `attachment.getDownloadUrl` and `attachment.getDownloadAllUrl` is supported as function type for button clicks.
- 🌟 `Notification`: Added config props of `foldCount`.
- 🌟 `Message`: Added a promised interface to handle callback.
- 🌟 `<pro>Table`: The tree table supports row dragging, and added `dragDropContextProps` property.
- 🌟 `<pro>Table`: Added `groups`, `headerRowHeight`, `footerRowHeight`, `onScrollLeft`, `onScrollTop`, `heightChangeable`, `bodyExpandable`, `defaultBodyExpanded`, `bodyExpanded`, `onBodyExpand` properties, `setScrollLeft`, `setScrollTop` instance methods.
- 🌟 `<pro>Table`: The dynamic filter bar adds `fuzzyQueryOnly` & `refreshBtn`, supports single fuzzy aggregation query mode and refresh button.
- 🌟 `<pro>Transfer`: Added properties of `oneWay`.
- 🌟 `<pro>Table.Column`: Added `aggregationLimitDefaultExpanded`, `defaultWidth` properties.
- 🌟 `<pro>TextArea`: Added `clearButton` property.
- 🌟 `<pro>DataSet`: Added `validateSelf` event and `getAllValidationErrors` method.
- 🌟 `<pro>DataSet`: Added `validationRules`, `strictPageSize` properties.
- 🌟 `<pro>Lov`: Added `selectionProps` property.
- 🌟 `<pro>NumberField`: Added `stringMode` property.
- 🌟 `<pro>DataSet`: Added `bigNumber` field `type`.
- 🌟 `<pro>Attachment`: Added `previewTarget` property.
- 🌟 `<pro>DataSet`: Added the `forceRemove` parameter to the `remove`, `removeAll` methods.
- 💄 `Step`: Optimize the navigation style of the `Steps`.
- 💄 `<pro>Button`: Optimize when button is disabled, set child node `pointer-events` to `none`.
- 💄 `Upload`: Optimized `loading` icon are displayed when the picture list is uploading.
- 💄 `<pro>TextArea`: Optimize the `autoSize` initialization style.
- 💄 `<pro>TextField`: Optimize the style when setting the `clearButton` `showLengthInfo` `suffix` properties at the same time.
- 💄 `<pro>Tree`: Extend draggable supports object type and controls the display of drag-and-drop icon.
- 💄 `<pro>Lov`: Optimize sorting of selected list.
- 💄 `<pro>Table`: Optimize virtual scrolling and support tree-shaped virtual scrolling.
- 💄 `<pro>Attachment`: Optimize caching logic.
- 💄 `<pro>SecretField`: Disable clear button and backspace key to delete.
- 💄 `<pro>Select`: Optimize the previous results will be retained until the query is successful in `noCache` mode.
- 🐞 `<pro>Table`: Fix the problem that the virtual scroll will be fully rendered for the first time when only `maxHeight` is set in style.
- 🐞 `<pro>Table`: Fix the problem of initializing request and saving parameters of dynamic filter bar.
- 🐞 `<pro>Table`: Fix the deep nesting of `Table` `Tree` data.
- 🐞 `<pro>Table`: Fix the sorting problem of query bar fields.
- 🐞 `<pro>Button`: Fix the problem that the `href` button can be jumped when the href button is `disabled`.
- 🐞 `Notification`: Fix the problem that multiple messages opened at different times will be closed at the same time.
- 🐞 `Divider`: Fix an issue with the dashed attribute of Divider.
- 🐞 `Menu`: Fix an issue where mouse moves into collapsed Menu reports errors.
- 🐞 `<pro>DataSet`: Fix the issue of export failure.
- 🐞 `<pro>DataSet`: Fix the problem that `selected` value will be recomputed after record state changed.
- 🐞 `<pro>DataSet.Transport`: Fix the problem that the verification information is not displayed when unique cooperates with Transport.validate for remote uniqueness verification.
- 🐞 `<pro>TextArea`: Fixed input length information display.
- 🐞 `<pro>Table`: Fixed render boolean problem of table filter bar.
- 🐞 `<pro>Table`: Fix `queryBarProps` configuration priority.
- 🐞 `<pro>Table`: Fix the initial data status judgment of the dynamic filter bar.
- 🐞 `<pro>Lov`: Fix the problem that the button does not focus after closing the pop-up window in button mode.
- 🐞 `<pro>FormField`: Fix the problem that deleting a single value will clear all other values in the multiple and custom range mode.
- 🐞 `Slider`: Fix the problem that tooltip does not close in `range` mode.
- 🐞 `<pro>DataSet`: Fixed tree data parent-child association problem.
- 🐞 `<pro>DatePicker`: Fix the problem of value setting in the `range` and `multiple` mode.
- 🐞 `<pro>DateTimePicker`: Fix the issue where the `format` property is invalid.

## 1.5.0

`2021-12-02`

- 🌟 Split `dataset` and `shared` libraries.
- 🌟 `ConfigProvider`: Added `ConfigProvider` component.
- 🌟 `hooks`: Added `useConfig` hook.
- 🌟 `<pro>hooks`: Added `useDataSet` hook.
- 🌟 `configure`: Added `numberFieldKeyboard`, `tableColumnDefaultWidth`, `tableColumnDefaultMinWidth`, `tableAggregationColumnDefaultWidth`, `tableAggregationColumnDefaultMinWidth`, `tooltipPlacement`, `lovShowSelectedInView`, `showHelp` properties.
- 🌟 `configure`: `TooltipTarget` adds `text-field-disabled` input class component disabled state object.
- 🌟 `Tabs`: Added `tabDraggable`, `tabTitleEditable`, `tabCountHideable`, `defaultChangeable` properties.
- 🌟 `<pro>DataSet.Field`: `optionsProps` property supports hooks.
- 🌟 `<pro>SecretField`: Added `SecretField` component.
- 🌟 `<pro>Attachment`: Added `isPublic` property.
- 🌟 `<pro>Attachment.Group`: Added `Attachment.Group` component.
- 🌟 `<pro>NumberField`: Added the `keyboard` property to control `UP` `DOWN` keyboard events.
- 🌟 `<pro>ModalProvider`: Added `getContainer` property.
- 🌟 `<pro>IntlField`: Added `type` property, supports multi-line input.
- 🌟 `<pro>Lov`: Added `drawer` mode and `viewRenderer` property.
- 🌟 `BarCode`: Added component of BarCode.
- 🌟 `<pro>Tree`: Added `filter` property.
- 🌟 `Tree`: Added callback of `onDropBefore` function.
- 🌟 `<pro>DataSet`: Added `record` property.
- 🌟 `Transfer`: Added `sortable` and `sortOperations` property.
- 🌟 `<pro>Transfer`: Added `sortable`、`sortOperations` and `operations` property.
- 🌟 `<pro>Lov`: Added `showSelectedInView` property.
- 🌟 `Tab`: Added `second-level` type.
- 🌟 `<pro>CodeArea`: Added `themeSwitch`, `title` properties.
- 🌟 `<pro>Form`: Added the `showHelp` attribute to control the display mode of the form input box help.
- 🌟 `<pro>FormItem`: The new `label` method is added to the `showHelp` property, which supports the display of help information on the Label.
- 💄 `<pro>FormItem`: Optimize the mandatory input and colon styles in the form input box, and will not hide if it is omitted.
- 💄 `<pro>Modal`: Optimized that when the mouse clicks on the unmasked modal box, it will be automatically set to the top.
- 💄 `<pro>PerformanceTable`: Optimized header can be nested to three levels.
- 💄 `<pro>PerformanceTable`: Optimize the interaction and caching of the dynamic filter bar, and add the `expandButton` attribute.
- 💄 `<pro>Table`: Optimize the interaction and caching of the dynamic filter bar.
- 💄 `<pro>Table`: Optimize the command preset button, icon to text.
- 💄 `<pro>Output`: Optimize `Form` multiple columns, `Output` and other input type component height issues.
- 💄 `<pro>DatePicker`: Optimized `mode` to `dateTime` style.
- 💄 `Message`: Optimized `loading` type message icon.
- 🐞 `<pro>DataSet`: Fix the problem of incorrect field sequence after adding new fields.
- 🐞 `<pro>DataSet`: The `total` parameter of the `appendData` method is discarded.
- 🐞 `<pro>DataSet.Record`: Fix the `getPristineValue` method cannot correctly obtain the key value in the object type field value.
- 🐞 `<pro>Lov`: Fix the problem of not searching when the search box is empty in `popup` mode.
- 🐞 `<pro>Table`: Fix the problem of the number displayed in the selected record prompt when selecting all across pages.
- 🐞 `<pro>Table`: Fix the problem that locked columns under aggregate column cannot be displayed when `aggregation` is false.
- 🐞 `<pro>Table`: Fix the height problem that may be caused when switching the display.
- 🐞 `<pro>Modal`: Fix the problem that the mask of the masked modal will disappear when the modal without mask is opened.
- 🐞 `<pro>DatePicker`: Fix the problem that the input value is reported incorrectly in `range` mode and using `timeZone` property. Fixed error limits for `maxLength` and `minLength` properties.
- 🐞 `<pro>Validator`: Fix the validation message is not fully formatted if no label.
- 🐞 `<pro>NumberField`: Fixed error limits for `maxLength` and `minLength` properties. And fixed `UP` `DOWN` keyword not working in Range mode.
- 🐞 `<pro>NumberField`: Fix the issue that the verification reset will not be triggered when the dynamic `max` and `min` changes.
- 🐞 `<pro>Lov`: Fix the data display problem when multiple selection values are echoed to the tree list.
- 🐞 `<pro>Lov`: Fix the problem of repeated query when the `autoSelectSingle` property is turned on.
- 🐞 `<pro>Tree`: Fix the problem that the DataSet check method is invalid when only using the check mode.
- 🐞 `<pro>Attachment`: Fix the problem that the `children` and `className` properties has no effect.
- 🐞 `Tabs`: Fix the nesting style problem.
- 🐞 `<pro>PerformanceTable`: Fix the problem that check column disappear after the table content is updated.
- 🐞 `List.Item.Meta`: Fix the problem that text avatars are not displayed.
- 🐞 `Notification`: Fix the overlap problem when called multiple times in useEffect hook for the first time.
- 🐞 `<pro>Tree`: Fixed error in `dataset` selected records when `async` is enabled and `selectable` is set to false.

## 1.5.0-beta.0

`2021-10-31`

- 🌟 `configure`: Added `defaultActiveFirstOption` property.
- 🌟 `Message`: Added `message.config` method parameter `maxCount`.
- 🌟 `Notification`: Added `notification.config` method parameter `maxCount`.
- 🌟 `Badge`: Added `color`, `size`, `title` properties.
- 🌟 `<pro>Table`: Added the `summaryBarFieldWidth` property to handle the `summaryBar` field width.
- 🌟 `<pro>Select`: Added the `defaultActiveFirstOption` property whether to highlight the first option by default.
- 🌟 `<pro>DataSet`: Added `cacheModified` property, `cachedModified`, `cachedRecords` value, `clearCachedModified`, `clearCachedRecords` method, `query` and `loadData` added `cache` parameter.
- 🌟 `Upload`: Added `showFileSize` property, and optimized the component style.
- 🌟 `Tabs`: Added `countRenderer` property.
- 🌟 `<pro>Lov`: Added `onSearchMatcherChange` property.
- 🌟 `Steps`: Added `type` property.
- 🌟 `Steps`: Added `onChange` callback.
- 🌟 `Tabs`: Added `showMore` property.
- 🌟 `<pro>SecretField`: Added `SecretField` component.
- 🌟 `ImageCrop.AvatarUploader`: Remove `minRectSize`, `subTitle` properties, rename `defaultRectSize` property as `rectSize`.
- 💄 `<pro>DataSet`: Optimize memory. Optimize tree data performance, Optimize verification performance.
- 💄 `RcTrigger`: Make Component be observer.
- 💄 `<pro>Select`: In the `options` data source mode, `searchMatcher` is supported to configure search parameters.
- 💄 `<pro>PerformanceTable`: Optimize the big data table drag and drop callback event.
- 💄 `Upload`: Optimize upper case picture suffix thumbnail display.
- 💄 `<pro>Attachment`: Enhanced image preview function.
- 💄 `<pro>Attachment`: Optimize caching logic.
- 💄 `<pro>Attachment`: Display a mandatory asterisk on the label.
- 💄 `<pro>DateTimePicker`: Optimize the time value set by `defaultTime` does not change when the range value is automatically exchanged.
- 💄 `<pro>Lov`: Optimized the `onClick` hook of the button mode allows to prevent the modal box from popping up by calling event.preventDefault().
- 💄 `<pro>Lov`: Optimize the effect of query waiting for loading in button mode.
- 💄 `<pro>Lov`: Optimization In `popup` mode, add query field selection to search box.
- 💄 `<pro>NumberField`: Optimize the execution efficiency of the step button.
- 💄 `ImageCrop.AvatarUploader`: Optimize cropping and interface styles.
- 🐞 `<pro>Table`: Fix the problem of clearing the checked records when `selectable` is false.
- 🐞 `<pro>Table`: Fix the problem that the virtual cell does not enter the viewport when the verification fails or the editor is displayed through the Tab key.
- 🐞 `<pro>Table`: Fix column width cannot be adjusted when crossing iframe via Modal.
- 🐞 `<pro>Table`: Fix that the contents of the filter bar input box are not aligned.
- 🐞 `<pro>Table`: Fix the problem that the `maxHeight` style in `virtualCell` mode may cause an endless loop.
- 🐞 `<pro>Table.Column`: Fix that the editor property which is true does not work when there is no corresponding field.
- 🐞 `<pro>Table.Column`: Fix the problem that the editor cannot be dynamically switched from Select to other editors when `editor` is true.
- 🐞 `<pro>Attachment`: Fix the problem that an error is reported when clicking the View Attachment button.
- 🐞 `<pro>Attachment`: Fix the problem of uploading unresponsive when the upload button content overflows and the `tooltip` is set.
- 🐞 `<pro>Attachment`: Fix the issue that the `accept` attribute cannot control file selection.
- 🐞 `<pro>Attachment`： Fix the problem that the attachment data without a type may report an error.
- 🐞 `<pro>Attachment`: Fix the problem of image preview after deleting or dragging.
- 🐞 `<pro>DataSet.Field`: Fix the problem that the first verification of the verification properties set by `dynamicProps` has no effect.
- 🐞 `<pro>DataSet`: Fix the issue of `appendData` total parameter update.
- 🐞 `<pro>Validator`: Fix the problem of incomplete `stepMismatch` error information.
- 🐞 `<pro>Output`: Fix the issue that an asterisk will be displayed when the colon is displayed.
- 🐞 `<pro>Modal`: Fix the problem of illegal `drawerTransitionName` causing page error.
- 🐞 `<pro>PerformanceTable`：Fix the problem that the merged line disappears when virtual scrolling is turned on.
- 🐞 `<pro>ColorPicker`：Fixed configuration `clearButton` property error and pointer jump when selecting #00000 color.

## 1.4.5

`2021-09-29`

- 🌟 `configure`: Added `tabsInkBarStyle`, `customizable`, `customizedSave`, `customizedLoad`, `tableButtonsLimit` properties, deprecated `tableCustomizedSave`, `tableCustomizedSave`, `tableCustomizable`, `performanceTableCustomizable`, `lovTableCustomizable` properties.
- 🌟 `Tabs`: Added `inkBarStyle`, `customizable`, `customizedCode`, `hideOnlyGroup` properties, support ink bar style modification.
- 🌟 `Tabs.TabPane`: Added `title`, `showCount`, `count`, `overflowCount` properties, `count` property support hooks.
- 🌟 `Tag`: Added `gray` color.
- 🌟 `<pro>DataSet`: Added `childrenField`, `forceValidate` properties.
- 🌟 `<pro>DatePicker`: Added `editorInPopup`, `defaultTime` properties.
- 🌟 `<pro>Dropdown`: Added `onHiddenBeforeChange` callback.
- 🌟 `<pro>Table`: Add `searchCode`, `autoWidth`, `rowBoxPlacement`, `buttonsLimit` properties, optimize `TableQueryBarType.filterBar` dynamic filter bar, support saving filter conditions, deprecated `autoMaxWidth` property.
- 🌟 `<pro>Pagination`: Added `quickJumperPosition` property.
- 💄 `Tabs`: Optimized to not display when `count` is zero.
- 💄 `<pro>Pagination`: Optimize the display of quick jumper.
- 💄 `<pro>Attachment`: Optimize the display of deleting, dnd, preview and label. Optimized to delete the attachments in the wrong state as direct deletion.
- 💄 `<pro>TextField`: Optimized to close the animation effect when switching record in multiple mode.
- 💄 `<pro>Table`: Supports multiple selections by pressing shift.
- 💄 `<pro>Table`: Optimized that cells without editor can also display small triangles validation message.
- 💄 `<pro>Table`: Rename `onResize` to `onColumnResize` event.
- 💄 `<pro>Lov`: Optimize the priority of `lovQueryBar` and remove the global default value of `lovQueryBar`.
- 💄 `<pro>Lov`: During the search query cycle, the KeyDownEnter event is disabled.
- 💄 `<pro>Tooltip`: Optimize style alignment.
- 🐞 `<pro>DataSet`: Fix the `cacheSelection` problem that the changed value is restored when the cached selected record is redisplayed.
- 🐞 `<pro>DataSet`: Fix the `dirty-field` mode will ignore the primary key value when there is no field corresponding to the `primaryKey` in the field list.
- 🐞 `<pro>Attachment`: Fix the problem that the number and attachment list are not displayed.
- 🐞 `<pro>Attachment`: Fixed the problem that upload button will not shown in picture card mode with no attachments.
- 🐞 `<pro>TimePicker`: Fix the display problem of the minute and second selection box in the 12-hour format.
- 🐞 `<pro>DatePicker`: Fix display problems in `isFlat` and `range` mode.
- 🐞 `<pro>DatePicker`: Fix the problem of value setting when the `range` is object and `multiple`.
- 🐞 `<pro>DatePicker`: Fix the problem that the `defaultTime` does not work when entering a value.
- 🐞 `<pro>DatePicker`: Fix the problem that spaces cannot be entered.
- 🐞 `<pro>Table`: Fix the abnormal style when the last column of the personalized table is not aligned to the left.
- 🐞 `<pro>Table`: Fix the problem that the table column will not refresh when `customizedCode` is changed.
- 🐞 `<pro>Table`: Fix the problem that row misalignment when switching the page size in `virtual` mode.
- 🐞 `<pro>Table`: Fix the problem of editor dislocation caused by `virtualCell`.
- 🐞 `<pro>Table`: Fix an error rendering filter bar when the query field range property value is an array.
- 🐞 `<pro>Table`: Fix the display problem when the editor is SelectBox in `multiple` mode.
- 🐞 `<pro>Table`: Fix the problem of inaccurate column order in personalized adjustment.
- 🐞 `<pro>Tree`: Fix the problem that asynchronously loaded nodes cannot be displayed when the dataSet is reloaded.
- 🐞 `<pro>Table`: Fix the problem that professionalBar under `autoHeight` property will only be collapsed after clicking More multiple times.
- 🐞 `Tabs`: Fix the problem of possible misalignment of ink bar.
- 🐞 `<pro>PerformanceTable`: Fix the problem of line highlighting error.
- 🐞 `<pro>Lov`: Fix the problem that the value of `alwaysShowRowBox` in the single-select mode table is incorrectly selected.
- 🐞 `<pro>TriggerField`: Fix the problem that `onPopupHiddenChange` sometimes does not trigger.
- 🐞 `<pro>Button`: Fix the problem that Tooltip will be displayed even if the content is overflow when the tooltip is overflow.
- 🐞 `<pro>Lov`: Fix the problem that the `onClick` property of `button` mode has no effect.
- 🐞 `<pro>Lov`: Fix the problem that the `noCache` option is repeated in `multiple` mode.
- 🐞 `<pro>Lov`: Fix the problem that the search drop-down did not collapse after clicking the pop-up Modal.
- 🐞 `<pro>Lov`: Fix the problem of shaking table in `popup` mode.
- 🐞 `<pro>Lov`: Fix the problem that the drop-down box cannot pop up after closing the Modal in `searchFieldInPopup` mode.
- 🐞 `<pro>TextArea`: Fix the style problem when dragging the width.
- 🐞 `<pro>ColorPicker`：Fix the problem that the color of the panel changes when the color is selected.

## 1.4.4

`2021-09-04`

- 🌟 `configure`: Added `tableColumnAlign`, `tooltip`, `showValidation`, `attachment`, `selectTrigger`, `lovQueryCachedSelected`, `queryBarProps`, `lovQueryBar`, `lovQueryBarProps` properties, `tooltipTheme` property supports hook type, deprecated `buttonTooltip`, `labelTooltip`, `selectOptionTooltip`, `tableColumnTooltip` properties.
- 🌟 `<pro>Rate`: Added `Rate` component.
- 🌟 `<pro>Attachment`: Added `Attachment` component.
- 🌟 `<pro>Picture`: Added `Picture` component.
- 🌟 `<pro>Modal`: Added `preview` method.
- 🌟 `<pro>DataSet.Field`: Added `bucketName`, `bucketDirectory`, `attachmentCount`, `showCheckedStrategy` properties.
- 🌟 `<pro>DataSet.AttachmentFile`: Added `AttachmentFile` class.
- 🌟 `<pro>RichText`: Added continuous preview of pictures.
- 🌟 `<pro>Cascader`: Added `async` and `loadData` attributes to simplify asynchronous loading schemes.
- 🌟 `<pro>PerformanceTable`: Added the `onCell` property and the `rowSpan` property of the cell to support row merging.
- 🌟 `Tree`: Added the `oldCheckedKeys` parameter to the `onCheck` callback.
- 🌟 `Skeleton`: Added `grid` property to support grid space configuration.
- 🌟 `<pro>Form`: Added the `showValidation` attribute to control the prompting method of verification information.
- 🌟 `<pro>FormField`: Added the `showValidation` attribute to control the prompting method of verification information.
- 🌟 `<pro>FormField`: Added `processValue` property.
- 🌟 `<pro>DataSet.Field`: Added `processValue` property.
- 🌟 `DatePicker`: Added `processValue` property.
- 🌟 `<pro>Table`: Added `showCachedSelection`, `onShowCachedSelectionChange` properties.
- 🌟 `<pro>Table`: Added the `showRemovedRow` property to control the display and hide of temporarily removed rows.
- 🌟 `<pro>TriggerField`: Added `viewMode`, `getPopupAlignTarget` properties.
- 🌟 `<pro>Select`: Added `searchFieldInPopup`, `searchFieldProps` properties.
- 🌟 `<pro>Lov`: Added `onBeforeSelect` property.
- 🌟 `<pro>PerformanceTable`: Added `rowSelection` property, built-in check column.
- 🌟 `<pro>PerformanceTable`: Added `rowDraggable` property to support row drag.
- 🌟 `<pro>PerformanceTable`: Added horizontal virtual scroll.
- 🌟 `<pro>Table`: Added `onResize` callback.
- 🌟 `Tabs`: Added TabGroup component.
- 🌟 `Icon`: Added a lot of icons.
- 🌟 `<pro>Table`: Added `autoQueryAfterReset` property to support ProfessionalBar & DynamicFilterBar to reset whether to automatically query.
- 💄 `<pro>Table`: The storage of the customization aggregation view is controlled by the external `aggregation` property.
- 💄 `<pro>Table`: Performance and memory optimization.
- 💄 `<pro>Pagination`: Optimize the width style of the pager.
- 💄 `<pro>Select`: Optimize the style of multi-select read-only options.
- 💄 `<pro>Tree`: Optimize the handling of DataSet related data and events when the `selectable` attribute is false.
- 💄 `<pro>RichText`: Optimize the preview style and `RichTextViewer` style.
- 💄 `<pro>TextField`: Optimize the display position of `showLengthInfo`.
- 💄 `<pro>Trigger`: Support Fragment child.
- 💄 `ImageCrop`：Optimize the interface and usage.
- 💄 `<pro>PerformanceTable`：Unordering is supported.
- 💄 `<pro>FormField`: Optimize the null value judgment.
- 💄 `<pro>FormField`: Optimize the `hidden` attribute to support hidden fields.
- 🐞 `configure`: Modify the `tableFilterAdapter` type.
- 🐞 `<pro>Table`: Fix the problem that the dynamic query parameters of the professionalQuery bar do not respond in real time.
- 🐞 `<pro>DataSet.Field`: Optimize the data return type problem of multiple calls to `fetchLookup`.
- 🐞 `<pro>DataSet`: Fix the issue of global parameter passing in paging.
- 🐞 `<pro>Table`: Fix the problem that help message is displayed in the cell which editor is CheckBox.
- 🐞 `<pro>TextArea`: Fix the required style in float label mode.
- 🐞 `<pro>Trigger`: Fix the problem that the popup is not aligned when crossing iframes in the same domain.
- 🐞 `<pro>Table`: Fix the problem that select all and unselect all are invalid when there are rows that are checked by default and cannot be modified.
- 🐞 `<pro>Table`: Fix the problem that the dynamic editor in inline editing mode cannot be displayed after being hidden.
- 🐞 `<pro>DatePicker`: Fix the problem of custom `renderer` in `range` mode.
- 🐞 `<pro>PerformanceTable`: Fix the problem that the first column of the sub-column in the combined column cannot be dragged when `resizable` is set.
- 🐞 `<pro>PerformanceTable`: Fix an issue in rendering when there is only one column in combined column.
- 🐞 `<pro>PerformanceTable`: Fix the problem that the height of the personalized configuration table is invalid.
- 🐞 `<pro>Tree`：Fix the problem that the check box status is wrong in the stowed state.
- 🐞 `<pro>TreeSelect`：Fix the problem that the check box status is wrong in the stowed state.
- 🐞 `<pro>Select`: Fix that hover trigger has no effect in multi-select mode.
- 🐞 `<pro>FormField`: Fix the problem that the input box will lose focus when the `valueChangeAction` is `input` in the highlight mode.
- 🐞 `<pro>Lov`: Fix the problem that multiple selections cannot be made when the `selectionMode` property of Table is `click`.
- 🐞 `<pro>Lov`: Fix the logic problem of `showCheckedStrategy` property `SHOW_ALL` value.
- 🐞 `<pro>Select`: Fix the problem of rendering errors when using `primitiveValue` and `combo` properties at the same time.
- 🐞 `<pro>Table`: Fix the problem that virtual cells and maximum height may cause an infinite loop.
- 🐞 `<pro>Table`: Fixed editor will focused on disabled cell.
- 🐞 `<pro>NumberField`: Fix `suffix`, `prefix` attribute support, style.
- 🐞 `<pro>Output`: Fix the problem of invalid colon when using `useColon`.
- 🐞 `<pro>Table`: Fixed an error rendering when the filter bar condition is a number of 0.
- 🐞 `<pro>Table`: Fix the `footer` dom position.
- 🐞 `<pro>Table`: Fix the invalid problem of `queryBarProps` `onReset` & `onQuery` event.

## 1.4.3

`2021-08-03`

- 🌟 `configure`: Added `performanceTableColumnHideable`, `performanceTableColumnTitleEditable`, `performanceTableColumnDraggable`, `performanceTableCustomizable`, `tableVirtual` properties.
- 🌟 `<pro>Table.Column`: Added `hiddenInAggregation` property, added `aggregation` parameter to the `command` hook.
- 🌟 `<pro>PerformanceTable`: Added personalization features, including `customizedCode`, `customizable`, `columnDraggable`, `columnTitleEditable`, `columnsDragRender` properties.
- 💄 `<pro>DataSet`: Memory optimization.
- 💄 `<pro>Select`: Memory optimization.
- 💄 `<pro>Table`: Performance and memory optimization.
- 💄 `<pro>Table`: Optimize the performance and logic of adjusting column width.
- 💄 `<pro>SelectBox`: Adjust the default value of `checkValueOnOptionsChange` to false.
- 💄 `<pro>SelectBox`: Optimize the label content overflow tooltip.
- 💄 `<pro>Trigger`: Support traversing iframes in the same domain.
- 💄 `<pro>Table`: Optimize the interaction of the dynamic filter bar style.
- 💄 `<pro>PerformanceTable`: Optimize the interaction of the dynamic filter bar style.
- 🐞 Fix the circular dependency problem.
- 🐞 `<pro>DataSet`: Fix the problem of page forwarding when the number of newly created records is greater than the number of pages.
- 🐞 `<pro>Table`: Fix the problem that the column `tooltip` cannot be closed when the cell is destroyed.
- 🐞 `<pro>Table`: Fix the style problem of locked column footer on the right.
- 🐞 `<pro>Table`: Fix `virtualCell` not working.
- 🐞 `<pro>Table`: Fix the problem that drag and drop rows report error when `virtualCell` is set.
- 🐞 `<pro>Table`: Fix the problem that the cells are not displayed when `virtualCell` is set to true and `showHeader` is set to false.
- 🐞 `<pro>Table`: Fix the rendering format problem of `dateTime` type column.
- 🐞 `<pro>Table`: Fix the problem that array typed `range` property reports errors in columns.
- 🐞 `<pro>Table`: Fix the problem that `maxHeight` and `minHeight` of `style` property may cause the column to not fill up.
- 🐞 `<pro>FormField`: Fix the problem of not rendering when the `renderer` returns a number.
- 🐞 `<pro>SelectBox`: Fix the set value problem with data source binding.
- 🐞 `<pro>PerformanceTable`: Fix an issue that sets the auto height scrollbar to mask content.
- 🐞 `<pro>Lov`: Fix the problem that there is no animation in the pop-up window.
- 🐞 `<pro>DataSet.Record`: Fix the problem of missing data in write-back.
- 🐞 `<pro>PerformanceTable`: Fix an issue that the flexGrow is not updated after the column width changes.
- 🐞 `<pro>PerformanceTable`: Fixed the problem that the dynamic adjustment column lacks scroll wheel monitoring and the fixed column is invalid.
- 🐞 `<pro>CodeArea`: Fix float label style.

## 1.4.2

`2021-07-21`

- 🌟 `configure`: Added `tableVirtualCell`, `formatter.timeZone` properties.
- 🌟 `<pro>DataSet`: Added `selectionStrategy` property, `selectionStrategy`, `treeSelected` values, `treeSelect`, `treeUnSelect` methods.
- 🌟 `<pro>Lov`: Added `showCheckedStrategy` property.
- 🌟 `<pro>DatePicker`: Added `timeZone` property.
- 🌟 `<pro>Tooltip`: Added singleton mode, added `show` and `hide` static methods.
- 🌟 `<pro>DataSet`: dataToJSON adds `dirty-field`, `dirty-field-self` types.
- 🌟 `<pro>DataSet.Field`: Added `json` type.
- 🌟 `<pro>DataSet`: Added the `combineSort` property to support the parameter passing of combined column sorting.
- 🌟 `<pro>Table`: Fix the effect of local export in large data volume.
- 🌟 `<pro>Select`: `selectAllButton` added hook type to support custom buttons.
- 🌟 `<pro>PerformanceTable`: Added `queryBar`, `toolbar` attributes to support query bar and toolbar.
- 🌟 `<pro>Table`: Added `showHeader` property.
- 💄 `<pro>Modal`: Support traversing iframes in the same domain.
- 💄 `<pro>DataSet`: The `all` value of the `dataToJSON` property will verify all records.
- 💄 `<pro>DataSet`: Optimize the `addField` method to automatically create the Field corresponding to the existing Record.
- 💄 `<pro>Radio`: Optimize the label content overflow tooltip.
- 💄 `<pro>Table`: Optimize the performance.
- 💄 `<pro>Table`: Optimize dynamic search bar style interaction.
- 💄 `<pro>NumberField`: Compatible with mobile events.
- 💄 `Progress`: Optimize animation performance.
- 💄 `<pro>Table.Column`: Optimized currency type columns are aligned to the right by default.
- 💄 `<pro>Output`: Optimize the display of number and currency, Optimize the display of empty values.
- 💄 `<pro>DataSet.Record`: In the absence of a field, the addField method will process the existing value of the field.
- 💄 `<pro>NumberField`: Remove `suffix`, `prefix` attribute support.
- 🐞 `<pro>Table`: Correct the calculation logic of `maxHeight` and `minHeight`.
- 🐞 `<pro>Pagination`: Fix the problem that the pagination option exceeds the default maximum of 100 pagination when the maximum pagination is not set.
- 🐞 `<pro>IconPicker`: Fix the problem that the pop-up window cannot be closed when the pagination button is clicked and the button is disabled.
- 🐞 `<pro>Table`: Fix the issue that under the peacock blue theme, when the editor of the Column is function, after entering the editing mode and clicking exit, the width of the component in the editing mode will be incorrect next time.
- 🐞 `<pro>Table`: Fix the problem that editing cannot be cancelled when editing in-line.
- 🐞  `<pro>PerformanceTable`: Fix scroll bar events.
- 🐞  `<pro>PerformanceTable`: Fix the problem of invalid clicks in the table.
- 🐞 `<pro>Form`: Fix the problem that the `dataSet` property of nested forms does not work.
- 🐞 `<pro>Select`: Fix the problem that the custom pop-up window may not be closed.
- 🐞 `<pro>TextField`: Fix the value rendered by the renderer cannot be displayed in the disabled state.
- 🐞 `<pro>Table`: Fixed an error when double-clicking to adjust the column width with "." in the name.

## 1.4.1

`2021-06-28`

- 🌟 `configure`: Added `performanceEnabled`, `onPerformance`, `tooltipTheme`, `validationTooltipTheme` properties.
- 🌟 `Tooltip`: Added `theme` property.
- 🌟 `<pro>Button`: Added `block` property, Added `link` type for `funcType`.
- 🌟 `<pro>Table.Column`: Added `aggregation` parameter into `header` and `renderer` hooks.
- 🌟 `<pro>TriggerField`: Added `tabIntoPopupContent` property, `popupContent` hook added `setValue` and `setPopup` parameters.
- 🌟 `<pro>Select`: `popupContent` hook adds `content` `dataSet` `textField` `valueField` `setValue` and `setPopup` parameters.
- 🌟 `<pro>Table`：Added `queryBarProps`, `showSelectionCachedButton` properties.
- 🌟 `<pro>TreeSelect`: Added `showCheckedStrategy` property, when configuring `treeCheckable`, define the way of backfilling selected items.
- 🌟 `<pro>PerformanceTable`：Added click row highlight attribute.
- 🌟 `<pro>DataSet.Record`: The `get` method supports the field name array parameter.
- 💄 `<pro>PerformanceTable`: Compatible with dragging the column width on the mobile terminal.
- 💄 `<pro>Table.Column`: Optimize the command buttons of the aggregate column be aligned in vertical.
- 💄 `<pro>DataSet.Field`: Each language field created by intl typed Field supports `transformResponse` and `transformRequest` properties.
- 💄 `<pro>DataSet.Field`: Optimize the field bounded will also trigger verification due to the  value change of it's bound field.
- 🐞 `<pro>DataSet.Field`: Fix the problem when `dynamicProps` is called recursively.
- 🐞 `<pro>TextField`: Fix the problem that Tooltip cannot be displayed when there is `addonBefore`, `addonAfter` or `help`.
- 🐞 `Menu`：Fix menu event reporting error.
- 🐞 `<pro>TextField`: Fix the problem that the floating label and the rendered value overlap when the null value is rendered to a non empty text.
- 🐞 `<pro>TriggerField`: Fix the problem that the input box in popupContent cannot be focused, and fix the problem that the scroll bar of the multi-select mode drop-down box cannot be dragged under IE.
- 🐞 `<pro>DataSet.Record`: Fix chain binding problem in `init` and `getPristineValue` method.
- 🐞 `Dropdown`: Fix the problem that overlayProps is undefined when typeof overlay is func.
- 🐞 `<pro>Table.Column`: Fix the issue that `dynamicProps.label` has no effect on column header.
- 🐞 `<pro>Button`: Fix style issue.
- 🐞 `<pro>DataSet`: Fix the problem that the bound field is empty when the object type field is converted to a string value using transformRequest.
- 🐞 `<pro>Modal`: Fix the problem that the width style is invalid when autoCenter is turned on, which affects the drawer and full screen mode.
- 🐞 `<pro>Table`：Fix the hover penetration problem of frozen columns.
- 🐞 `<pro>Table`：Fix export problems and optimize local export.
- 🐞 `<pro>PerformanceTable`: Fix the scroll bar exception caused by rendering asynchronous under virtual scrolling.
- 🐞 `<pro>PerformanceTable`: Fix the issue that the mobile terminal is stuck when scrolling.
- 🐞 `<pro>Screening`：Fix the display problem when the dataSet has no initial value.

## 1.4.0

`2021-06-11`

- 🌟 `configure`: Added `buttonTooltip`, `selectOptionTooltip`, `labelTooltip`, `showLengthInfo`, `showInvalidDate`, `showRequiredColorsOnlyEmpty`, `highlightRenderer`, `tableColumnEditorBorder`, `currencyFormatter`, `currencyFormatterOptions` properties, deprecated `excludeUseColonTagList` property.
- 🌟 `<pro>Select`: Added `optionTooltip` property.
- 🌟 `<pro>Form.Item`: Added Item component.
- 🌟 `<pro>Form`: Added `labelTooltip`, `fieldHighlightRenderer`, `layout` properties, deprecated `excludeUseColonTagList` property.
- 🌟 `<pro>FormField`: Added `labelTooltip`, `highlightRenderer`, `useColon` properties.
- 🌟 `<pro>Button`: Added `tooltip` property.
- 🌟 `<pro>DataSet`: Added `setAllPageSelection`, `getQueryParameter`, `getValidationErrors` methods and `isAllPageSelection`, `unSelected`, `currentUnSelected` values.
- 🌟 `<pro>DataSet.Record`: Added `getValidationErrors` method.
- 🌟 `<pro>DataSet.Field`: Added `computedProps`, `highlight` properties, deprecated `dynamicProps` property.
- 🌟 `<pro>Table`: Added `showAllPageSelectionButton`, `aggregation`, `onAggregationChange`, `cellHighlightRenderer`, `columnEditorBorder` properties.
- 🌟 `<pro>Table.Column`: Added `aggregation`, `aggregationLimit`, `aggregationDefaultExpandedKeys`, `aggregationDefaultExpandAll`, `highlightRenderer` properties.
- 🌟 `<pro>TextField`: Added `showLengthInfo` property.
- 💄 `<pro>DataSet`: Optimize the `appendData` method to not be affected by paging.
- 💄 `<pro>DataSet.Field`: Optimize some problems of chain binding.
- 💄 `<pro>Select.Option`: Support ReactFragment nesting.
- 💄 `<pro>Table.Column`: Support ReactFragment nesting.
- 💄 `<pro>Form`: Support ReactFragment nested child elements.
- 💄 `Tooltip`: The `title` and `overlay` attributes support hook functions.
- 💄 `Dropdown`: The `overlay` property supports hook functions.
- 💄 `Popover`: The `title` and `content` attributes support hook functions.
- 💄 `Popconfirm`: The `title` attribute supports hook functions.
- 💄 `<pro>Select.Option`: Attributes such as `className` and `style` can be passed to the drop-down menu item.
- 💄 `<pro>NumberField`: Optimized the processing of clicking the stepper when there is no value.
- 💄 `<pro>Tooltip`: The `title` and `overlay` attributes support hook functions.
- 💄 `<pro>Dropdown`: The `overlay` property supports hook functions.
- 💄 `<pro>Table`: Optimize the performance.
- 💄 `<pro>Table`: Support maxHeight and minHeight style attributes.
- 💄 `<pro>Tree`: Optimized and extend the showLine attribute.
- 💄 `<pro>Form`: Optimized the display timing of the floating label label.
- 💄 `<pro>TextField`: Optimized the `clearButton` rendering interaction.
- 💄 `<pro>Modal`: `footer` add callback parameters.
- 💄 `<pro>TextField`: Optimized the label rendering logic in `range` mode.
- 💄 `<pro>TextField`: Modify the `autoComplete` attribute type to `string`.
- 💄 `<pro>TextField`: `restrict` property supports regular type.
- 💄 `<pro>NumberField`: Optimize the `precision` property to convert the number of decimal places.
- 🐞 `<pro>Table.Column`: Fix the problem that elements in the editor addonBefore and addonAfter cannot get focus.
- 🐞 `<pro>Table`: Fix the problem of inaccurate mouse batch selection records.
- 🐞 `<pro>DataSet`: Fix the problem that the bound field will not submit a null value when clearing the value of the object type field.
- 🐞 `Responsive`：Fix the problem that other components cannot trigger a response after one of these components is come to be disabled or destroyed.
- 🐞 `Select`：Fix the issue that select all fails in OptGroup mode.
- 🐞 `<pro>Modal`: Fix the `keyboardClosable` property has no effect when there is no cancel button.
- 🐞 `<pro>Modal`: Fix some abnormal behaviors of Modal which not provided by ModalProvider.
- 🐞 `<pro>DataSet`：Fix the problem that the state of the dataSet is incorrectly modified after submission when only deleted and dataToJSON is selected.
- 🐞 `<pro>Table`: Fix the positioning problem of the editor when the current record of the DataSet changes.
- 🐞 `<pro>RichText`：Fix the editor onBlur event.
- 🐞 `<pro>FormField`: Fix the issue of invalid ref attribute.
- 🐞 `<pro>Select.Option`: Fix the rendering problem when children are ReactNode.
- 🐞 `<pro>Table`：Fix `parityRow` expansion row rendering problem.
- 🐞 `<pro>Table`: Fix the problem of an infinite loop caused by empty value of idField in tree paging data.
- 🐞 `<pro>Paginition`：Fix the rendering problem of page turning button without data.
- 🐞 `<pro>Select`: Fix the problem that the prompt cannot be displayed correctly when the Select is wrapped by the Tooltip in the multi-select mode.
- 🐞 `<pro>ColorPicker`: Fix the problem that the display cannot be restored to the initial state correctly after reset is used after clicking the horizontal color selector at the bottom when the DataSet is used.
- 🐞 `<pro>DatePicker`: Fix the problem that the selected date in the multi-select mode reports an error.
- 🐞 `<pro>TextField`: Fix null rendering in `multiple` mode.
- 🐞 `<pro>DatePicker`: Fix the problem that the calendar will pop up when the clear button is clicked and cannot be closed.
- 🐞 `<pro>Button`: Fix the problem of focus error after asynchronous waiting.
- 🐞 `<pro>Lov`: Fix the problem that `autoSelectSingle` cannot pop up a single data.
- 🐞 `<pro>Lov`: Fix the problem of data processing error when the table property `selectionMode` is `click` in `multiple` mode.
- 🐞 `<pro>Table`: Fix queryBar multilingual field rendering problem.
- 🐞 `<pro>PerformanceTable`: Fix column cannot be sorted in ColumnGroup.


## 1.3.2

`2021-05-11`

- 🌟 `configure`: Added `lovTableCustomizable`, `lovAutoSelectSingle`, `tableColumnOnCell` properties.
- 🌟 `<pro>Modal`: Added `closeOnLocationChange` property.
- 🌟 `<pro>Table`: Added height settings for customization.
- 🌟 `<pro>Lov`: Added `autoSelectSingle` property, click to query when there is only one piece of data, it will be automatically selected and the window will not pop up.
- 🌟 `<pro>Table`：Optimize the direction of data during the deletion process after the autoLocateAfterRemove property is turned on.
- 🌟 `<pro>NumberField`：Set default values for `max` and `min` attributes.
- 💄 `<pro>Table`: Height style supports calc attribute.
- 💄 `<pro>Table`: Optimized professionalBar Expand Collapse `autoHeight` does not respond to the problem.
- 💄 `<pro>Select`: Optimized the issue of pop-up drop-down automatically when clicking to clear.
- 💄 `<pro>Form`: Optimized tooltip help floating layer priority.
- 🐞 `<pro>Table`: Fix the problem of constantly shaking.
- 🐞 `<pro>Field`: Fixed getText getting object value error.
- 🐞 `<pro>Select`: Fixed that when the value type is object, select all and reverse the wrong assignment.
- 🐞 `<pro>TextField`: Fixed a conflict in the title display of the form when the title of the form is float and the field is range.
- 🐞 `<pro>DataSet`：Fixed the invalid verification of the newly created defaultValue object.
- 🐞 `<pro>FormField`: Fix the problem that the value will not be verified when the value is not changed.
- 🐞 `<pro>Modal`: Fix some abnormal behaviors of Modal which not provided by ModalProvider.
- 🐞 `<pro>IntlField`: Fixed the `maxLengths` attribute, the length language is not set separately and follows the field attribute configuration.
- 🐞 `<pro>DataSet`: Fix the problem that if the create method passes the field value with the bind attribute and the target field has a default value, the target field will directly take the default value.
- 🐞 `<pro>Table`：Fix customizable TS type error.
- 🐞 `<pro>DatePicker`: Fix the problem that the endDate date will trigger two updates when startDate and endDate are related to each other by min and max.

## 1.3.1

`2021-04-18`

- 🌟 `configure`: Added `selectPagingOptionContent`, `selectSearchable` properties.
- 🌟 `<pro>DataSet`: Added `setState`, `getState`, `modifiedCheck` methods.
- 🌟 `<pro>Paginition`: Added `maxPageSize`, `pageSizeEditable` properties.
- 🌟 `<pro>FormField`: Added `onBeforeChange` hook.
- 🌟 `<pro>Select`: Added `pagingOptionContent` property.
- 🌟 `<pro>DatePicker`: Added `mode` parameter to the property `filter`.
- 🌟 `<pro>Table`: Added ProfessionalBar `defaultExpanded` property.
- 🌟 `<pro>Table`: Added `treeQueryExpanded` tree structure QueryBar queries automatically trigger expansion tree structure.
- 💄 `<pro>Table`: Optimize the performance of editors.
- 💄 `<pro>Table`: Optimize virtual scrolling performance.
- 💄 `<pro>Table`: Optimize the border style issue.
- 💄 `<pro>Table`: Optimize ProfessionalBar The query field of type boolean is displayed as a checkBox by default.
- 💄 `Popover`: Optimized if the trigger is click. When selecting the Select component in the pop-up window, you don't need to set getPopupContainer to prevent the pop-up window from closing.
- 💄 `<pro>Trigger`: Optimize the getContainer method.
- 💄 `<pro>Select`: Optimize the search style in read-only mode.
- 🐞 `<pro>DatePicker`: Fix the incorrect restriction of `maxLength` and `minLength`.
- 🐞 `<pro>NumberField`: Fix the incorrect restriction of `maxLength` and `minLength`.
- 🐞 `<pro>DataSet.Field`: Fix the incorrect restriction of `maxLength` and `minLength` on date and number types.
- 🐞 `<pro>DataSet.Field`: Fix the issue of freezing when dynamicProps.lovPara and cascadeMap are used at the same time.
- 🐞 `<pro>Table`: Fix the problem that the input number will not be displayed in a new line when rowHeight:auto.
- 🐞 `<pro>Tooltip`: Fix the problem that the position is offset when it is displayed for the first time.

## 1.3.0

`2021-04-09`

- 🌟 `<pro>LovConfig`: Added `tableProps`, `dataSetProps` configuration.
- 🌟 `configure`: Added `tableCustomizable`, `tableColumnTooltip`, `drawerSectionBorder`, `tableShowSelectionTips`, `drawerTransitionName` properties.
- 🌟 `<pro>Table`: Added a prompt for selected records under table.
- 🌟 `<pro>Table`: Added `clientExportQuantity` to configure the number of export queries.
- 🌟 `<pro>Cascader`: Added `searchable`, `searchMatcher` properties to searchable the options;
- 🌟 `<pro>Table`: Added `customizable`, `virtualCell`, `showSelectionTips` properties.
- 🌟 `<pro>DataSet.Field`: Added `precision`, `numberGrouping`, `optionsProps` properties.
- 🌟 `<pro>NumberField`: Added `precision`, `numberGrouping` properties.
- 🌟 `<pro>TextArea`: Added `onResize` hook.
- 🌟 `<pro>PerformanceTable`: Added demo combined with `DataSet`.
- 🌟 `<pro>Modal`: Added the `drawerBorder` property, which is controlled separately from the modal `border` property.
- 🌟 `<pro>Table`: Added the `virtualRowHeight` property to configure the virtual scroll height.
- 💄 `<pro>Table`: Optimize the performance of editors.
- 💄 `<pro>Table`: When the editor is TextArea, the line height can be adjusted with the TextArea resizing.
- 💄 `<pro>Table`: Optimize the implementation and performance of frozen columns.
- 💄 `<pro>PerformanceTable`: Optimized style, loading bar.
- 💄 `<pro>TextField`: Optimized the inability to copy selected values when the `range` is configured in the `disabled` state.
- 💄 `<pro>Lov`: Deprecated `lovEvents` attribute.
- 💄 `<pro>Lov`: Increase the priority of `searchable` attribute when value is false.
- 🐞 `<pro>TextField`: Fixed the `renderer` style error.
- 🐞 `<pro>DatePicker`: Fixed DatePicker filter footer location current date cannot be filtered.
- 🐞 `<pro>DatePicker`: Fixed the DatePicker year render blank.
- 🐞 `<pro>FormField`: Fixed the range number change position error when the value is 0.
- 🐞 `<pro>Tooltip`: Fixed style priority.
- 🐞 `<pro>PerformanceTable`: Fixed the big data table problem.
- 🐞 `<pro>Table`: Fixed the `autoHeight` calculation.
- 🐞 `<pro>FormField`: Fix the problem that the defaultValue value will be cleaned up on state change.
- 🐞 `<pro>Table`: Fixed the problem that editor will not auto scroll into view in virtual mode.
- 🐞 `<pro>Table`: Fixed the `autoHeight` calculation.
- 🐞 `<pro>Table`: Fixed table virtual scrolling combined with automatic height table overflow.
- 🐞 `<pro>Table`: Fixed the problem that table will auto focused when updated.
- 🐞 `<pro>Output`：Fixed the issue that the rendered text is empty when the lookup's display value is the number 0.
- 🐞 `<pro>DataSet.Field`: Fix the problem that `dynamicProps` may report errors.

## 1.2.0

`2021-03-18`

- 🌟 `configure`: Added `tableColumnTitleEditable`, `tableColumnHideable`, `tableColumnDraggable`, `tableRowDraggable`, `tableCustomizedSave`, `tableCustomizedLoad`, `modalMaskClosable` global properties, and deprecated `tableDragColumn`, `tableDragRow`, `lovTriggerMode` properties.
- 🌟 `<pro>Table`: Added table personalization features, including `customizedCode`, `customizedType`, `columnTitleEditable`, `columnHideable`, `columnDraggable`, `rowDraggable` attributes, deprecated `columnsMergeCoverage`, `columnsOnChange`, `columnsEditType`, `dragColumn`, `dragRow` attributes, and Column added `titleEditable` attributes.
- 🐞 `<pro>Table`: Fixed the border style issue.
- 🐞 `<pro>Select`: Fixed that when searchable, the clear button will trigger onChange twice.
- 🐞 `<pro>Record`: Fixed the problem that the reset method cannot restore the recording state.
- 🐞 `<pro>NumberField`: Fixed the problem that long-pressing the increase or decrease value button fails to stop when the verification fails.
- 🐞 `<pro>Form`: Fixed the placeholder in each mode of the form to be filled with label value.

## 1.1.1

`2021-03-12`


- 🌟 `<pro>Select`: Added option paging function.
- 🌟 `<pro>Lov`: Added `searchAction` & `fetchSingle` properties.
- 💄 `configure`: Extend the `defaultRenderEmpty` property to support the `Output`.
- 💄 `<pro>Modal`: Extend `maskClosable`: true / false / click / dblclick.
- 💄 `<pro>Form`: Optimized `labelLayout` as placeholder, the configured placeholder value can be displayed when focusing.
- 💄 `<pro>Select`: Optimized the search icon when searching and the unselectable value appears to be deleted when multiple selection is reversed.
- 💄 `<pro>TextArea`: Optimized minimum drag height to prevent text from being obscured.
- 💄 `<pro>Lov`: Deleted the `triggerMode` API, and optimized to double-click to trigger the pop-up window.
- 💄 `<pro>Lov`: Optimized `tableProps` to support lov Table `columns` attribute merging.
- 🐞 `<pro>Field`: Fixed the invalid configuration of some `dynamicProps`.
- 🐞 `<pro>Lov`: Fixed the problem that the value of button mode is invalid.
- 🐞 `<pro>Lov`: Fixed the problem that the query page jumps after selecting a certain page in the default value.
- 🐞 `<pro>Tootip`: Fixed the component reporting error when children is undefined。
- 🐞 `<pro>Select`: Fixed the error when the `searchMatcher` default configuration gets the `textField` may be empty.


## 1.1.0

`2021-03-02`

- 🌟 `configure`: Added `tableParityRow` global configuration.
- 🌟 `<pro>TreeSelect`: Added TreeSelect component.
- 🌟 `<pro>Select`: Added `selectAllButton` property.
- 🌟 `<pro>SelectBox`: implement the `optionsFilter` `searchable` properties.
- 🌟 `<pro>TextField`: Added `valueChangeAction`, `wait`, `waitType` properties.
- 🌟 `<pro>Form`: `labelWidth` added `auto` value.
- 🌟 `<pro>Table`: Added `HTML title` to the column header when the `tooltip` attribute exists in `column`.
- 🌟 `<pro>AutoComplete`: Added `matcher` property.
- 🌟 `<pro>LocaleContext`: Added `setNumberFormatLanguage` method.
- 🌟 `<pro>Tree`: Added `async` attribute to simplify asynchronous loading scheme.
- 🌟 `<pro>Table`: Added `treeAsync` and `treeLoadData` properties to simplify the asynchronous loading scheme.
- 🌟 `<pro>Table`: Added `parityRow` `rowNumber` properties.
- 💄 Optimized the export of TS enumeration types.
- 💄 `<pro>Table`: Optimize performance and fix the problem that the editor cannot be displayed in virtual scrolling.
- 💄 `<pro>DataSet`: Optimized performance.
- 💄 `<pro>Trigger`: Optimized the performance.
- 💄 `<pro>Tree`: Optimized the performance.
- 💄 `<pro>Modal`: Optimized the style of `fullscreen` display and `drawer` when `footer` is null.
- 💄 `<pro>Table`: Optimized the row style to ensure vertical centering.
- 💄 `<pro>Table`: The query field of boolean type is displayed as `Select` by default.
- 💄 `<pro>Table`: Optimized performance, the current row will not be changed when the row selection box is operated.
- 💄 `<pro>IntlField`: Optimized the value display form of intl disabled and readOnly.
- 💄 `<pro>Table`: Optimized the performance when row and column drag is not turned on.
- 💄 `<pro>Table`: Optimized the performance of locking column synchronization row height during automatic row height.
- 💄 `<pro>Table`: Extend the `highLightRow` property to support independent interaction of `focus` and `click`.
- 🐞 `Collapse`: Fixed the issue that `expandIconPosition` is invalid.
- 🐞 `<pro>Table`: Fixed the problem that the total height of the virtual scroll is incorrect when there are temporarily removed records.
- 🐞 `<pro>Table`: Fixed the problem that the select all button is invalid when the selected records are displayed in other pages.
- 🐞 `<pro>Table`: Fixed the problem that the width of the last column cannot be adjusted.
- 🐞 `<pro>Table`: Fixed the problem that the column width cannot be adjusted by dragging the column.
- 🐞 `<pro>Table`: Fixed the multilingual problem of the filter bar.
- 🐞 `<pro>Table`: Fixed the overflowX calculation problem that may occur in `Modal`.
- 🐞 `<pro>FormField`: Fixed incorrect application of `defaultValidationMessages` during dataSet binding.
- 🐞 `<pro>Field`: Fixed the wrong return object rendering when switching data sources.
- 🐞 `<pro>DataSet`: Fixed the problem that the previous data is still used in some cases such as lookupData after dynamically setting lovPara.
- 🐞 `<pro>Currency`: Fix the problem that currency cannot be formatted according to the locale.

## 1.0.0

`2021-02-02`

- 🌟 `configure`: Added `selectReverse` `tableAutoHeightDiff` global configuration.
- 🌟 `<pro>Select`: Added `reverse` attribute to control whether multiple selection can be reversed.
- 🌟 `<pro>Modal`: Added `header`, `drawerOffset`, `okButton`, `cancelButton`, `contentStyle`, `bodyStyle` attributes.
- 🌟 `<pro>DataSet`: Added `beforeRemove` event.
- 🌟 `<pro>DataSet`: Added `validateBeforeQuery` property.
- 🌟 `<pro>DataSet`: Added `params` parameter to `query` method.
- 🌟 `<pro>DataSet.Field`: Added `lookupBatchAxiosConfig` property.
- 💄 `Collapse`: Optimized icon style.
- 💄 `<pro>DataSet`: Optimized placeholder priority.
- 💄 `<pro>Select`: Optimized the situation where the corresponding value is not found in the data source, and it is directly displayed empty. Now the return value is displayed.
- 💄 `<pro>Select`: Optimized the display of multi-choice value for onOption disabled configuration.
- 💄 `<pro>Table.Column`: Optimize the performance when the tooltip is overflow.
- 💄 `<pro>Modal`: Optimize the behavior of close button and cancel button to be consistent.
- 💄 `<pro>Table`: Optimize the performance of `autoMaxWidth`.
- 💄 `<pro>DataSet`: The `confirmMessage` parameter of `delete` and `deleteAll` can be set to false to suppress the prompt box.
- 💄 `<pro>Table`: Optimize the performance of tree expand and collapse.
- 🐞 `<pro>Table`: Fixed the interaction problem of filterBar.
- 🐞 `<pro>Table`: Fixed the drag bar cannot be out of focus.
- 🐞 `<pro>DataSet`: Fixed to delete only the modified data status after submission.
- 🐞 `<pro>Lov`: Fixed the priority of the `modalProps` property of the pop-up window.
- 🐞 `<pro>Lov`: Fixed the priority of table `queryBar` attribute in the pop-up window.
- 🐞 `<pro>Lov`: Fixed the issue that confirming the change is invalid after unchecking the value.
- 🐞 `<pro>Table`: Fixed the problem that `summaryBar` does not render when buttons do not exist.
- 🐞 `<pro>Record`: Fixed the error of submitting data caused by incorrect `validate` parameter passing.
- 🐞 `<pro>Pagination`: Fixed page number undefined quick jump error.
- 🐞 `<pro>Pagination`: Fixed the issue that `modifiedCheckMessage` is invalid when the page number is switched.
- 🐞 `<pro>Modal`: Fixed the display problem when multiple Modal are opened simultaneously in multiple ModalProviders.
- 🐞 `<pro>Form`: Fixed the problem that the form control values are not cleared when clearing the dataset.
- 🐞 `<pro>DataSet.Field`: Fixed the problem that the defaultValue property of dynamicProps does not take effect.
- 🐞 `<pro>DataSet`: Fixed the problem in splice method.
- 🐞 `<pro>DataSet`: Fixed the problem of querying parent cascade records for deep cascade records.
- 🐞 `<pro>DataSet`: When the Boolean value type is not set, it will be set to false by default.
- 🐞 `<pro>DataSet.Record`: Fixed the problem that the `getCascadeRecords` method may have an endless loop.
- 🐞 `<pro>DataSet.Record`: Optimized isExpanded attribute controlled.
- 🐞 `<pro>Validator`: Fixed the problem of passing value by combining unique validation object type fields.

## 0.8.78

`2021-01-10`

- 🌟 `configure`: Added `modalAutoCenter`, `modalKeyboard`, `tableKeyboard`, `tableFilterAdapter`, `tableFilterSuffix`, `tableFilterSearchText` global configuration.
- 🌟 `Tabs`: Added `keyboard` property.
- 🌟 `<pro>Select`: Added `noCache` property.
- 🌟 `<pro>Table`: Added `filterBar`.
- 🌟 `<pro>Table`: Added more keyboard shortcuts.
- 🌟 `<pro>CodeArea`: Added `editorDidMount` property.
- 🌟 `<pro>Cascader`: Added `onChoose`, `onUnChoose` property.
- 🌟 `<pro>Modal`: Added `autoCenter` property to control the center display of modal.
- 🌟 `<pro>Modal`: Added `keyboard` attribute to control keyboard esc to close.
- 🌟 `<pro>Cascader`: Added `changeOnSelect` property could select parent node.
- 🌟 `<pro>DatePicker`:Added `renderExtraFooter`, `extraFooterPlacement` property.
- 💄 `configure`: Optimized `lookupCache` property.
- 💄 `<pro>DataSet`: Optimized getText property.
- 💄 `<pro>Cascader`: Optimized the not found display of results.
- 💄 `<pro>Select`: Optimization option disabled state rendering problem.
- 💄 `<pro>Table`: Optimized the width and style of virtual scroll fixed column.
- 💄 `<pro>DatePicker`: Optimized the time selection operation of dateTimePicker in datePicker.
- 🐞 `Tabs`: Fixed Tab can't scroll when in min width screen.
- 🐞 `message`: Fixed the error node insertion error of Pro Feedback component request error caused by message.
- 🐞 `<pro>CheckBox`: Fixed CheckBox controlled usage problem.
- 🐞 `<pro>Lov`: Fixed the problem that the bind field cannot be assigned beforehand.
- 🐞 `<pro>Output`: Fixed the problem that the value 0 renders empty.
- 🐞 `<pro>Output`: Fixed the value set rendering problem when the field type is `number`.
- 🐞 `<pro>Table`: Fixed the problem of multi-field conflict in multipleLine mode.
- 🐞 `<pro>Table`: Fixed the problem of automatically triggering OnExpand when clicking query in tree mode.
- 🐞 `<pro>Table`: Fixed the misalignment problem of the low resolution of Table head under autoHeight.
- 🐞 `<pro>Table`: Fixed the problem that a small part of the label position is misaligned in the case of `useColon`.
- 🐞 `<pro>FormField`: Fixed the problem of verifying label rendering.
- 🐞 `<pro>FormField`: Fixed the problem of multiple verification prompts in multiple selections.
- 🐞 `<pro>DatePicker`: In the case of range, it is fixed to clear the abnormal setting.
- 🐞 `<pro>PerformanceTable`: Fixed the problem of incorrect calculation of scroll height in `Modal`.
- 🐞 `<pro>Tooltip`: Fixed the problem that the arrow may not be aligned with the center of the target in the bottom top case.

## 0.8.77

`2020-12-09`

- 🌟 `<pro>NumberField`: Added `longPressPuls` to control NumberField long press accumulation.
- 🌟 `<pro>Output`: Added `currency` property.
- 🌟 `<pro>Lov`: Added `popupContent` callback property to handle custom query drop-down event interaction.
- 🌟 `<pro>Table`: Added `autoFootHeight` property to control separate processing of column footer.
- 💄 Optimized interface export type and enum.
- 💄 `<pro>Cascader`: Optimized multiple selection style
- 💄 `<pro>Cascader`: Optimized Single-select and repeat-select logic.
- 💄 `<pro>Table`: Optimized `ProfessionalBar` query input conditions and press Enter to trigger the query.
- 🐞 `<pro>Tooltip`: Fixed an issue where content could not be copied.
- 🐞 `<pro>Table`: Fixed the problem that Table `tooltip` cannot pop up automatically.
- 🐞 `<pro>Table`: Fixed Table setting `autoHeight` to `maxHeight` height calculation problem.
- 🐞 `<pro>SelectBox`: Fixed the invalid problem of `optionRenderer` attribute.

## 0.8.76

`2020-11-24`

- 🌟 `configure`: Added `tableAutoFocus` global configuration.
- 🌟 `<pro>Lov`: Added `lovEvents` property to handle lov `DataSet` events.
- 🌟 `<pro>Select`: The multi-select mode adds the inverse selection function.
- 🌟 `<pro>Table`: Added `expandIconAsCell` property to control whether the expanded icon occupies a column.
- 🌟 `<pro>Table`: Added new `autoFocus` attribute controls whether the new line automatically gets focus to the first editable field.
- 🌟 `<pro>PerformanceTable`: Added `showScrollArrow` and `clickScrollLength` properties to control whether the scroll bar displays arrow clicks.
- 💄 `<pro>TextField`: Optimize the display of `placeholder` beyond the width.
- 💄 `<pro>Lov`: Optimized the lov `tableProps` property to be compatible with `onRow`.
- 💄 `<pro>Table`: Optimized rendering occupancy issue when `label` does not exist.
- 💄 `<pro>FormField`: Optimized when the value is multi-selection, error messages can also be displayed after `validator` is configured.
- 🐞 `Collapse`: Fixed `collapseExpandIcon` global attribute support.
- 🐞 `TreeSelect`: Fixed the console error caused by the TreeSelect value being undefined.
- 🐞 `Modal`: Fixed the wrong position of the Modal close button.
- 🐞 `<Pro>Field`: Fixed `fetchLookup` lookupData update error.
- 🐞 `<pro>Table`: Fixed the list misalignment problem when the automatic height of Table is set to `maxHeight`.

## 0.8.75

`2020-11-01`

- 🌟 `<pro>IconPicker`: Added `customFontName` props and related configuration.
- 🌟 `<pro>Table`: Added `summaryBar`, `summaryFieldsLimit` properties, and support header summary bars.
- 💄 `<pro>Modal`: Optimized `header` style.
- 💄 `<pro>TextField`: Optimized that the input box under IE contains the `readOnly` attribute, causing the keyboard BackSpace page to fall back.
- 🐞 `<pro>Tree`: Fixed the problem of misalignment of Tree text.
- 🐞 `<pro>Button`: Fixed button link style problem.
- 🐞 `<pro>DataSet`: Fixed the problem that cached data cannot be deleted.
- 🐞 `<pro>Table`: Fixed `autoHeight` type:maxHeight height problem.
- 🐞 `<pro>Table`: Fixed the problem that clicking clearButton directly after table filterBar input fails.
- 🐞 `<pro>Table`: Fixed the problem of invalid automatic positioning of new rows in table header processing.
- 🐞 `<pro>Table`: Fixed the problem with tree table auto folding when the row is expanded in scrollbar appeared.
- 🐞 `<pro>Select`: Fixed the Select in `combo` mode can't create options when use chinese input method.
- 🐞 `<pro>Table`: Fixed table grouped columns resize, if resize the single column after grouped columns, would has wrong width.
- 🐞 `<pro>Table`: Fixed the problem of the lock column misalignment when the horizontal scroll bar appears.

## 0.8.74

`2020-10-14`

- 🌟 `Statistic`: Added `Statistic` to display statistic data with description.
- 🌟 `TreeSelect`: Added `maxTagCount`,`maxTagPlaceholder`, `maxTagTextLength` properties.
- 🌟 `<pro>Field`: Added the `multiLine` attribute to support multi-line display and editing of Table cells.
- 🌟 `<pro>Screening`: Added `Screening` component.
- 🌟 `<pro>Field`: Added the `nonStrictStep` attribute.
- 💄 `<pro>Form`: Optimized Form Layout interval configuration.
- 💄 `<pro>Dropdown`: Optimized `getPopupContainer` attribute.
- 💄 `Table`: Modify the drag and drop demo and upgrade `react-dnd ^11`.
- 🐞 `<pro>Skeleton`: Rename `skeletonTitle` property.
- 🐞 `<pro>Select`: Fixed the flashing problem of Select under ie.
- 🐞 `<pro>Upload`: Fixed that Upload and Button cannot be aligned under ie.
- 🐞 `<pro>Table`: Fixed the problem of lateral scroll misalignment under `autoHeight` property.
- 🐞 `<pro>Pagination`: Fixed when change the page, the quickJumpInput don't change.
- 🐞 `<pro>TextField`: Fixed when multiple in Modal, the lower model input would be displayed.
- 🐞 `<pro>PerformanceTable`: Fixed the problem of using occasional scroll bar width calculation error in Tabs.
- 🐞 `<pro>NumberField`: Fix the problem that step cannot perform normal verification when the data source is bound.

## 0.8.73

`2020-09-21`

- 🌟 `configure`: Added `drawerOkFirst` global configuration.
- 🌟 `Icon`: Added `customFontName` for who want the icon font customization.
- 🌟 `<pro>Table`: Added TableProfessionalBar.
- 🌟 `<pro>Table`: Added `exportMode` the client mode would export the excel by frontend.
- 💄 `<pro>PerformanceTable`: Optimized multilingual presentation && `bordered` true.
- 💄 `<pro>PerformanceTable`: Optimized the return of `title` support function.
- 💄 `<pro>Table`: Optimized the query conditions does not show the loading effect by clicking the query.
- 💄 `<pro>Table`: Optimize the TableButtonProps type, now you can correctly use children in ts to change the text of the default button.
- 🐞 `<pro>FormField`: Fixed cascade mode error to disable sub-components.
- 🐞 `<pro>Switch`: Fixed switch when `labelLayout` is float, the label cant't find.
- 🐞 `<pro>Table`: Fixed the issue that editable lines are automatically positioned to radio buttons.
- 🐞 `<pro>Table.advancedBar`: Fixed the problem of undefined rendering of multi-select clear tags in the advanced search bar.

## 0.8.72

`2020-09-07`

- 🌟 `configure`: Added `lovModalProps` global configuration.
- 🌟 `Progress`: Added `showPointer` property.
- 🌟 `<pro>RichText`: Added `RichText` component.
- 🌟 `<pro>Cascader`: Added `Cascader` SingleMenu.
- 🌟 `<pro>Table`: Added event `onDragEndBefore` callback before drag and drop.
- 💄 `Progress`: Updated `format` def.
- 💄 `Breadcrumb`: Optimized the `Breadcrumb` to MD design.
- 💄 `<pro>Modal`: Optimized the `okFirst` property in `drawer` mode.
- 💄 `<pro>Lov`: Reopen the pop-up window in `noCache` mode to reset the number of pages.
- 🐞 `<pro>Upload`: Fixed the file type error when using `beforeUpload` and `uploadImmediately`.
- 🐞 `<pro>TextField`: Fixed Select or Text component, when use multiple the values would be covered.
- 🐞 `<pro>Table`: Fixed inline mode can't show Tooltip.
- 🐞 `<pro>FormField`: Fixed the multi-select `cascade` mode clearing without disabling subcomponents.
- 🐞 `<pro>Table`: Fixed the wrong children type of Column. This error will cause the combined column to not be used in TypeScript.
- 🐞 `<pro>NumberField`: Fixed the problem that the up and down arrows will fail in some cases when used in Table.
- 🐞 `<pro>FormField`: Fix the problem that the newLine property of the sub-component in the Form is incorrectly reported in TypeScript.
- 🐞 `<pro>DatePicker`: Fix the problem that DatePicker is set to `readOnly`, but the cursor can still be displayed.
- 🐞 `Table`: Fixed Table expand icon can't response to the expansion event.
- 🐞 `Tabs`: Fix the problem that the position of the activeBar is incorrect when the `defaultActiveKey` set is not the first one when used in Modal

## 0.8.71

`2020-08-21`

- 🌟 `configure`: Added `formatter`,`formatterOptions` global configuration. RenderEmpty document modification.
- 🌟 `Upload`: Added `dragUploadList`, `onDragEnd` properties.
- 🌟 `Breadcrumb`: Added breadcrumbItem `menuList` `overlay` properties.
- 🌟 `Cascader`: Added cascader new `menuMode` support the single menu, with `singleMenuStyle` `singleMenuItemStyle` `singlePleaseRender` `singleMenuItemRender` properties.
- 🌟 `<pro>Lov`: Added `paramMatcher` property.
- 🌟 `<pro>Table`: Added `columnsMergeCoverage` `columnsOnChange` `columnsEdictType` properties to edict column.
- 🌟 `<pro>NumberField`: Added `numberFieldFormatter`,`numberFieldFormatterOptions` attribute.
- 💄 Modified the mobx-react dependency restriction in peerDependencies.
- 💄 `<pro>Table`: Optimized the sorting interaction, increase the click to switch the intermediate state.
- 💄 `<pro>Table`: The editable row is automatically positioned to the first editable cell.
- 💄 `<pro>FormField`: Modify the label type to receive string and ReactNode at the same time. At the same time, the label type of Field Props in the DataSet is modified.
- 🐞 `Steps`: Fixed the steps typescript lint error.
- 🐞 `DatePicker`: Fixed the problem that disabled does not take effect on the icon.
- 🐞 `<pro>Table`: Fixed the table drag style error and add table dragging render demo.
- 🐞 `<pro>Table`: Fixed the table text align left overflow would't look the icon.
- 🐞 `<pro>TriggerField`: Fixed `getPopupContainer` API.
- 🐞 `<pro>TextArea`: Fixed the style problem of `TextArea` component.
- 🐞 `<pro>Form`: Fix the conflict between `useColon` and global configuration.
- 🐞 `<pro>DatePicker`: Fix the problem that TimePicker cannot scroll under Firefox.
- 🐞 `<pro>FormField`: Fixed an error setting a property to the Fragment under _inTable.
- 🐞 `<pro>TextField`: Fix the problem that TextField cannot correctly control maxLength in Chinese input, and optimize the Chinese input experience.

## 0.8.69

`2020-08-07`

- 🌟 `configure`: Added `numberFieldNonStrictStep` global configuration.
- 🌟 `ImageCrop`: Added the AvatarUpload component.
- 🌟 `<pro>NumberField`: Added `nonStrictStep` attribute.
- 💄 `Select`: Optimized `Select` tags styles.
- 💄 `<pro>Form`: Optimized `Form` readOnly className.
- 🐞 `Menu`: Fixed the error report of the drop-down keyboard event.
- 🐞 `<pro>PerformanceTable`: Fixed Scrollbar re-rendering calculation rules.
- 🐞 `<pro>TextField`: Fixed the width exceeding when using addon in table.
- 🐞 `<pro>Table`: Fixed the table expandField bind err in table tree.
- 🐞 `<pro>Table`: Fix the error that there will be two check boxes when checking CheckBox and Switch in the table.

## 0.8.68

`2020-07-28`

- 🌟 `Result`: Added the `Result` component.
- 🌟 `Upload`: Added `requestFileKeys` properties.
- 🌟 `ImageCrop`: Added the `ImageCrop` component.
- 🌟 `configure`: Added `textFieldAutoComplete`, `resultStatusRenderer`, `tableEditorNextKeyEnterDown`, `tableDragRow`, `tableDragColumn`, `tableDragColumnAlign` properties.
- 🌟 `<pro>PerformanceTable`: Added `PerformanceTable` component.
- 🌟 `<pro>Form`: Added `Form` submit check automatically to check failed component feature.
- 🌟 `<pro>Table`: Added table tree expand className.
- 🌟 `<pro>Table`: Added `editorNextKeyEnterDown` property.
- 🌟 `<pro>Table`: Added `Table` submit check automatically to check failed cell feature.
- 🐞 `<pro>Table`: Fixed table autoHeight is `auto` , The style is error.
- 🐞 `<pro>Table`: Fixed `Table` the scroll auto automatic sliding in IE.
- 🐞 `<pro>Table`: Fixed `Table` use inline mode the lookup auto pack up.
- 🐞 `<pro>Table`: Fixed the compatibility issue of `scrollIntoViewIfNeeded` method in IE && Firefox.
- 🐞 `<pro>Table`: Fixed the problem of out-of-sync when sliding fixed columns under the `autoHeight` property `type: maxHeight`.
- 🐞 `<pro>Table`: Modified the judgment mechanism of `useMouseBatchChoose`, and fixed the problem that the attribute behaves as true when global setting true and component setting false.
- 🐞 `<pro>Form`: Modified the problem of replacing the label color of mandatory and non-mandatory items in colon mode.
- 🐞 `<pro>Button`: Modified the loading mechanism to fix the problem that the query button does not enter the loading state in the Table.
- 🐞 `<pro>TextArea`: Fixed the problem that after setting required and resize properties in `Form` at the same time, the background color does not change along with the width and height.

## 0.8.67

`2020-07-14`

- 🌟 `<pro>Table`: Added `Table` drag feature.
- 🌟 `Steps`: Added `Steps.Group` Component to grouping Step Components.
- 🌟 `configure`: Added `collapseExpandIconPosition`, `collapseExpandIcon`, `collapseTrigger` properties.
- 🌟 `Collapse`: Added `expandIcon`, `expandIconPosition`, `trigger` properties.
- 🌟 `<pro>Select`: Added `commonItem`, `maxCommonTagPlaceholder`, `maxCommonTagCount`, `maxCommonTagTextLengthproperty` properties.
- 🐞 `Progress`: Fixed Circle Progress can't change the color by strokeColor properties.
- 🐞 `<pro>DatePciker`: Document repair.
- 🐞 `<pro>Select`: Fixed a problem with the disabled option being checked by clicking the Select button.
- 🐞 `<pro>Form`: Fixed the problem that the label of the `required` field is displayed incorrectly when `useColon` is true and `labelLayout` is vertical.
- 🐞 `<pro>Form`: Fixed the problem that the `pristine` attribute cannot be used when `Form` used in typescript.
- 🐞 `<pro>Lov`: Fixed lov table automatically positioning to the first data item in single-select mode and clicking OK when rowbox is displayed will select current as the option even if no option is selected at this time.
- 🐞 `<pro>DataSet`: Fix the problem that when a PrimaryKey is set, a piece of data is deleted if a new piece is not submitted, and when the interface returns 204, the response will be filled into the record as data.

## 0.8.66

`2020-06-28`

- 🌟 `configure`: Added `lovTableProps` property.
- 💄 `Icon`: Updated `Icon` List.
- 🐞 `<pro>Select`: Fixed IE element.scrollTo err.
- 🐞 `<pro>Select`: Fixed `Select` restrict support to limit the import.
- 🐞 `<pro>Lov`: Fixed the problem that `onChange` event triggered when blur.
- 🐞 `<pro>Lov`: Adjust the priority of `selectionMode` in tableProps to the highest.
- 🐞 `<pro>Table`: Fixed`autoLocateFirst` in table change the page auto locate the first record.
- 🐞 `<pro>Table`: Fixed an issue where the body did not resume scrolling after hiding the modal when `mask` was set to false.
- 🐞 `<pro>Form`: Fixed the problem that there is no label when there is only a single `FormVirtualGroup` in Form.

## 0.8.65

`2020-06-15`

- 🌟 `configure`: Added `tableDefaultRenderer` property.
- 🌟 `<pro>DataSet`: Added `modifiedCheckMessage` property.
- 🌟 `<pro>Form`: Added `FormVirtualGroup` component of Form component.
- 💄 `<pro>Form`: Added `FormVirtualGroup` component of Form component.
- 💄 `<pro>Table`: Modify handleSelection trigger timing, export modal add closable.
- 🐞 Fixed suffix icon of select lov and other components disappeared.
- 🐞 `<pro>Table`: Fixed alwaysShowRowBox priority issues.
- 🐞 `<pro>TextArea`: Fixed TextArea autofocus invalid issue.
- 🐞 `<pro>DatePicker`: Fix the problem that the selection box will still pop up when you click the second input after setting disabled in range mode.

## 0.8.64

`2020-06-10`

- 🌟 `Progress`: Added `strokeColor` properties.
- 🌟 `Avatar`: Added `alt` properties description.
- 🌟 `Switch`: Added `checkedValue`,`unCheckedValue` properties.
- 🌟 `Table`: Added `pagination` global schema and export example.
- 🌟 `DatePicker`: Added `onPanelChange`,`mode` properties description.
- 🌟 `TreeSelect`: Added `searchValue` & `autoClearSearchValue` properties.
- 🌟 `Modal`: Added `keyboard`,`okButtonProps`,`cancelButtonProps` properties.
- 🌟 `<pro>Cascader`: Added `Cascader` Pro component.
- 🌟 `<pro>Pagination`: Added the pagination pager className.
- 🌟 `<pro>AutoComplete`: Added `AutoComplete` Pro component.
- 🌟 `<pro>Table`: Added `autoMaxWidth` properties to self-adaption width and export demo.
- 🌟 `<pro>Form`: Added useColon, excludeUseColonTagList attributes and global configuration.
- 🌟 `<pro>Table`: Added `alwaysShowRowBox` attributes and global configuration `tableAlwaysShowRowBox`.
- 🌟 `<pro>Table`: Added `useMouseBatchChoose` attributes and global configuration `tableUseMouseBatchChoose`.
- 🐞 `<pro>Select`: Fixed ie11 `dropdownMatchSelectWidth` is always hidden text.
- 🐞 Fixed the input,form,autoComplete style.
- 🐞 `Table`: Fixed table checked style can't cancel.
- 🐞 `Cascader`: Fixed the cascader not has expandable icon.
- 🐞 `Pagination`: Fixed the pagination size diff style dislocation.
- 🐞 `<pro>Form`: Fixed Form single line colSpan property not effective.
- 🐞 `<pro>Table`: Fixed the problem that pageSize can be input for paging in Table.
- 🐞 `<pro>Table`: Fixed the problem that in non-rowbox mode, click on the selected content cannot cancel the selection and hover class is not added on the current row.

## 0.8.63

`2020-05-24`

- 🌟 `configure`: Added `dropdownMatchSelectWidth` & `lovTriggerMode` property.
- 🌟 `<pro>Table`: Added `autoHeight` property.
- 🌟 `<pro>Trigger`: Added `getPopupContainer` property.
- 🌟 `<pro>Lov`: Added `tableProps` & `triggerMode` properties.
- 🌟 `<pro>Modal`: Added `mask`, `maskStyle` and `maskClass` property, support Modal custom mask style.
- 💄 `<pro>Table`: Optimized switch pageSize no save prompt.
- 🐞 `<pro>Lov`: Fixed the problem that it cannot be opened after the route switch is not closed.
- 🐞 `<pro>DatePicker`: Fixed the must-in check error problem in range mode.
- 🐞 `<pro>Table.FilterSelect`: Fixed `FilterSelect` editor drop-down width.
- 🐞 `<pro>CodeArea`: Fixed the problem of using record.set to update data after manually modifying the data in codeArea in the case of binding dataSet but the component view is not updated.
- 🐞 `<pro>Form`: Fixed the problem that `TextField` & `TextArea` is `readonly` after `Form` `disabled` is changed from true to false.

## 0.8.62

`2020-05-11`

- 🌟 `configure`: Added `tableSelectedHighLightRow` property.
- 🌟 `<pro>Table`: Added table tree support the paging.
- 🌟 `<pro>Table`: Added `selectedHighLightRow` property to support selected line highlight.
- 💄 Optimize the documentation used in create-react-app.
- 🐞 `<pro>Table`: Fixed filterBar drop-down style.
- 🐞 `<pro>Table`: Fixed column field support incomplete .
- 🐞 `<pro>SelectBox`: Fixed dataset required control style.
- 🐞 `<pro>DatePicker`: Fixed max/min restricted after emptying is not optional.
- 🐞 `<pro>DatePicker`: Fixed the problem of unable to continue selecting values and popover interaction after clearing in range mode.
- 🐞 `<pro>Trigger`: Fixed the problem where the pop-up box that lost focus after double-clicking the selection reappeared.


## 0.8.61

`2020-04-28`

- 🌟 `<pro>Currency`: Added demo.
- 🌟 `<pro>Table`: Added a toggle field editor (lov / select) demo.
- 🌟 `<pro>Tree`: Added `TreeNodeRenderer` property to support the customize tree node.
- 💄 `AutoComplete`: Optimized the type of dataSource.
- 💄 `<pro>Tree`: Optimized treePro use `treeData` create treeNode.
- 🐞 `<pro>Form`: Fixed label style.
- 🐞 `inputNumber`: Fixed the NumberInput round.
- 🐞 `<pro>Table`: Fixed the problem of blank scroll bar under virtual scrolling.
- 🐞 `<pro>Upload`: Fixed the parsing problem of successful upload response.
- 🐞 `<pro>Select`: Fixed the problem that the `dropdownMatchSelectWidth` property is invalid.
- 🐞 `<pro>DatePicker`: Fixed inability to assign values when selecting multiple items.

## 0.8.60

`2020-04-21`

- 🌟 `<pro>IntlField`: Added `maxLengths` property.
- 🌟 `<pro>Table`: Added `virtual` properties to support virtual scrolling and add demo.
- 🐞 `<pro>Table`: Fixed the new row lateral roll lock column error misalignment issue.
- 🐞 `<pro>Tooltip`: Fixed the Button `disabled` state without triggering.
- 🐞 `<pro>Tree`: Fixed when use dataSet the move(record) the child tree node also exist.
- 🐞 `<pro>DatePicker`: Fixed the problem that onChange triggered many times after selection.
- 🐞 `<pro>Field`: Fixed the problem that the DataSet Field cannot get the default values of `valueField` and `textField`.
- 🐞 `Collapse.CollapsePanel`: Fixed CollapsePanel TS type error.
- 🐞 `<pro>Trigger`: Fixed the problem that the Trigger click on the scroll bar causes the pop-up to disappear in IE11.

## 0.8.59

`2020-04-01`

- 🐞 `TreeSelect`: Fixed CSS error and tree check error.
- 🐞 `<pro>Tooltip`: Fixed can not trigger display in button disabled state.
- 🐞 `<pro>TextArea`: Fixed `autoSize` property.
- 🐞 `<pro>CodeArea`: Fixed defocus update error.
- 🐞 `<pro>Pagination`: Fixed paging calculation error.
- 🐞 `<pro>Table.pagination`: Fixed `pageSizeOptions` property.
- 🐞 `<pro>DataSet`: Fixed `current` pointing after submission failed.

## 0.8.58

`2020-03-27`

- 🌟 `Icon`: Added new icon.
- 🌟 `Tree`: Support virtual scrolling.
- 🌟 `Tree`: Added `onLoad` callback.
- 🌟 `Tree`: Added `treeDatatreeNodes`, `treeData`, `blockNode` properties.
- 🌟 `Tree.TreeNode`: Added `checkable` property.
- 🌟 `Tree.DirectoryTree`:  Added a built-in directory tree.
- 🌟 `Skeleton`: Added `Skeleton` component.
- 🌟 `configure`:  Added `tableSpinProps` global configuration.
- 🌟 `<pro>Spin`: Added demo.
- 🌟 `<pro>DataSet.Field`: Added `disabled` property.
- 🌟 `<pro>DataSet.Field`: Extended `step` property, used for step limit of time component.
- 🌟 `<pro>TimePicker`: `format` and `step` can affect the display of the component.
- 🌟 `<pro>Table`: Extended `spin` property, Added spin & custom inline demo.
- 🌟 `<pro>Skeleton`: Added Skeleton Pro component.
- 🌟 `<pro>Tree`: Support virtual scrolling.
- 🌟 `<pro>Tree`: Added `defaultExpandAll`, `defaultExpandedKeys`, `defaultCheckedKeys`, `defaultSelectKeys` properties.
- 🌟 `<pro>Pagination`: Added hideOnSinglePage properties.
- 🌟 `<pro>TextArea`: Added autoSize properties.
- 🌟 `<pro>Upload`: Added `beforeUpload`, `onRemoveFile` callback.
- 🌟 `<pro>Upload`: Added `defaultFileList`, `uploadFileList`, `withCredentials`, `appendUpload`, `partialUpload` properties.
- 💄 `<pro>Table`: Optimized table `tooltip` style.
- 💄 `<pro>Upload`: Optimized Upload doc.
- 💄 `<pro>Pagination`: Optimized `showTotal`, `showQuickJumper` properties.
- 💄 `<pro>LocaleContext`: Optimized Japanese configuration documentation.
- 💄 `<pro>DataSet`: Optimized `autoLocateAfterRemove`, reset the reserved selected state after deletion failed and locate to delete item 1.
- 🐞 `Spin`: Fixed invalid `size` property problem.
- 🐞 `<pro>Upload`: Fixed IE 11 compatibility issues.
- 🐞 `<pro>Table`: Fixed `editor` type error.
- 🐞 `<pro>Table`: Fixed filterBar lookup value undefined.
- 🐞 `<pro>DataSet.Field`: Fixed `dynamicProps` null judgment comparison.
- 🐞 `<pro>TimePicker`: Fixed the mouse wheel error report under chrome.

## 0.8.57

`2020-03-12`

- 🌟 `<pro>Lov`: Add `queryBar` `fieldProps` configuration.
- 🌟 `<pro>DataSet`: Added `cascadeParams` property.
- 🌟 `<pro>Field`: Add class name for formField Tooltip .
- 💄 `<pro>DataSet`: Optimize the performance of the `ready` method.
- 💄 `<pro>DataSet.Record`: Use the merge method to write back with object fields.
- 🐞 `<pro>DatePicker`: Fixed the problem that when DatePicker sets the default value, the maximum date cannot select the minimum default value
- 🐞 `<pro>CodeArea`: FIX CodeArea text controlled
- 🐞 `<pro>SelectBox`: Fix SelectBox multiple disable can't read the Text.
- 🐞 `<pro>DataSet`: Fix `validate` did not apply `dataToJSON` configuration.
- 🐞 Fix the problem that the base component and pro component have the same name pre-variable conflict when fully relying on the style.
- 🐞 `<pro>Lov`: Fix the problem that `valueField` and `textField` in lov configuration are invalid when `lovCode` is obtained through `dynamicProps`.
- 🐞 `<pro>Select`: Fix the problem of no option when `lovCode` field's type is string.
- 🐞 `<pro>TableEditor`: Fix the editor of the table in the `Modal`, and then change the window size, the positioning will be incorrect.

## 0.8.56

`2020-02-18`

- 🌟 Add xhr-mock mock config.
- 🐞 `<pro>Button`: Fix incomplete presentation style.
- 🐞 `<pro>Table`: Fix the inline edit lov rendering err.

## 0.8.55

`2020-02-13`

- 🌟 `<pro>Table`: Added `spin` properties.
- 🐞 Fix online data mock problem.
- 🐞 `<pro>Table.queryBar`: Fix the table filter bar error rendering bind field.
- 🐞 `<pro>Table`: Fix the head fixed height err
- 🐞 `<pro>Table`: Fix `disabled` properties.
- 🐞 `<pro> Lov`: Fix the problem that the record obtained in `lovQueryAxiosConfig` after the DataSet re-instantiation is one of the old DataSet instance.

## 0.8.54

`2020-01-20`

- 🐞 `<pro>NumberField`: Fix the verification problem.
- 🐞 `<pro>NumberField`: Fix the problem that range value cannot be deleted by keyboard.

## 0.8.53

`2020-01-19`

- 🌟 `<pro>NumberField`: Implement the `range` property.
- 🐞 `<pro>DataSet.Record`: Fix `toJSONData` missing `__id` attribute.
- 🐞 `<pro>DataSet.Field`: Fix the problem that `transformRequest` does not work when type is object.

## 0.8.52

`2020-01-17`

- 🌟 `configure`: Added`tableButtonProps` `tableCommandProps` `buttonColor` properties.
- 🌟 `<pro> Table`: Built-in buttons for TableButton and TableCommand can add `afterClick` hook to perform actions other than the default behavior.

## 0.8.51

`2020-01-16`

- 🌟 `<pro>ModalProvider`: Added ModalProvider Component.
- 🌟 `<pro>DataSet.Field`: Added parameter for `transformRequest` and `transformResponse`.
- 🌟 `<pro>Upload`: Added `showUploadList` property.
- 💄 Optimized the `jest` configuration to update the snapshot.
- 🐞 `<pro>Select`: Fixed the dynamic query lookup option repeat problem.
- 🐞 `<pro>DataSet`: Fixed multiple cascading issues.

## 0.8.50

`2020-01-07`

- 🐞 Fixed the online code editor.
- 🐞 `Tree`: Fixed the failure of defaultCheckedKeys in disable state.
- 🐞 `<pro>Lov`: Fixed the problem that the unique check does not display an error.

## 0.8.49

`2019-12-30`

- 🌟 `<pro>DataSet.Record`: Added `setState` and `getState` methods.
- 💄 `<pro>DataSet.Field`: Optimize the `options` property.
- 💄 `<pro>ViewComponent`: Optimized `onBlur` hook to prevent blur based on `preventDefault` called by blur event.
- 🐞 `Transfer`: Fixed icon.
- 🐞 `<pro>DataSet`: Fixed the problem that the dirty is false when only the records are deleted in the case that `dataToJson` is normal.
- 🐞 `<pro>DataSet`: Fixed cascading problem.

## 0.8.48

`2019-12-23`

- 🌟 `<pro>Table`: Open `Table` `queryBar` Component.
- 🌟 `<pro>Pagination`: Added `showQuickJumper` property.
- 🐞 `<pro>DataSet.Record`: Fixed status error caused dirty error problem.
- 🐞 `<pro>Select`: Fixed the issue where multiple Select buttons would select filtered records.

## 0.8.47

`2019-12-15`

- 🐞 `<pro>DataSet.Field`: Fixed the dead cycle of an incoming object parameter with function value in `dynamicProps`.
- 🐞 `<pro>DataSet.Record`: Fixed parent and children of tree nodes being incorrectly in cascaded.
- 🐞 `<pro>DataSet`: Fix the problem that the data write-back fails when `dataToJSON` is `normal`.

## 0.8.46

`2019-12-09`

- 🌟 `configure`: Added `lookupBatchAxiosConfig` property.
- 🌟 `<pro>DataSet`: Added `dirty` property, deprecated `isModified` method.
- 💄 `<pro>DataSet.Record`: Optimize the `dirty` property, which contains whether the cascaded data has changed.
- 🐞 `<pro>Table`: Fixed the Table tree structure right fixed column expansion icon problem.

## 0.8.45

`2019-12-07`

- 🐞 `Progress`: Fixed the animation style of Progress in IE.
- 🐞 `<pro>DataSet.Field`: Fixed the dead cycle of an incoming object parameter in `dynamicProps`.

## 0.8.44

`2019-12-05`

- 🌟 `<pro>DataSet`: Added `dataToJSON` property, deprecated parameters of method such as `toJSONData`.
- 🐞 `<pro>FormField`: Fixed the problem with the cascadeMap parameter value of 0/ false to disable the child.
- 🐞 `<pro>Select`: Fixed the problem that the unchecked option disappears in multi-selection mode.
- 🐞 `<pro>DatePicker`: Fixed the problem of updating the value in dateTime mode.
- 🐞 `<pro>DatePicker`: Fixed the week-selection display problem and disable input in week mode.

## 0.8.43

`2019-12-02`

- 🐞 `<pro>DataSet`: Fixed the problem with `splice` method.

## 0.8.42

`2019-12-01`

- 🌟 `<pro>DataSet`: Added `autoLocateAfterCreate` property.
- 🐞 `<pro>DataSet.Field`: Fixed min / max verification type judgment.

## 0.8.41

`2019-11-27`

- 🌟 `<pro>DataSet`: Added `remove` event.
- 🌟 `<pro>DataSet`: Added `autoLocateAfterRemove` property.
- 💄 `<pro>DataSet`: Optimize the performance of `remove` method.

## 0.8.40

`2019-11-22`

- 🐞 Fix circular dependencies problems.
- 🐞 `<pro>Table`: Fixed an issue with the time type field editor.

## 0.8.39

`2019-11-22`

- 🌟 `<pro>Modal`: Added `drawerTransitionName` properties.
- 💄 `<pro>DataSet.Field`: Adjust textField and valueField to take precedence over values in the Lov configuration.
- 🐞 `<pro>CheckBox`: Fixed the style on IE11.
- 🐞 `<pro>Table`: Fixed an issue where the progress of the digital editor was lost.
- 🐞 `<pro>Select`: Fixed the problem generating option and clickable in non-composite search mode.
- 🐞 `<pro>DataSet.Field`: Fixed an issue where the lookupUrl related property in dynamicProps does not work.

## 0.8.38

`2019-11-18`

- 🌟 `Upload`: Added `onSuccess`, `onProgress`, `onError` properties.
- 🐞 `<pro>Table`: Fix some problems with filterBar.

## 0.8.37

`2019-11-13`

- 💄 `<pro>CodeArea`: Update the example of each language lint.
- 🐞 `<pro>Table`: Fixed an issue where the value in the edit was updated to a new line when the line was switched.
- 🐞 `<pro>NumberField`: Fixed an issue where max and min were not validated which is used as field name.
- 🐞 `<pro>Lov`: Fixed an issue where the textField value of the first data in the popup was displayed in control when the valueField was set incorrectly.
- 🐞 `<pro>Table.Column`: Fixed an issue where the editor failed when the editor returned a value of true.

## 0.8.36

`2019-11-11`

- 🌟 `configure`: Added `tableExpandIcon` property.
- 🌟 `<pro>Table`: Added `expandIcon` property.
- 💄 `<pro>CodeArea`: Update the json-format example.
- 🐞 `<pro>Table`: Fixed an issue where horizontal scroll bars were not displayed in Modal.

## 0.8.35

`2019-11-08`

- 🌟 `<pro>Table`: `selectionMode` Added `mousedown` mode.
- 💄 `<pro>Table`: Optimize record creation in inline editing mode.
- 🐞 `<pro>DataSet.Record`: Fixed an issue where the `create` status record became `sync` status after reset.
- 🐞 `<pro>DataSet`: Fixed an issue where the `autoCreate` of the cascading dataset did not work.

## 0.8.34

`2019-11-07`

- 💄 `<pro>Lov`: The pop-up window displays the close icon button.
- 💄 `<pro>Validator`: Remove the logic for binding field validation.
- 🐞 `<pro>Lov`: Fixed an issue where the value was cleared by blur in button mode.
- 🐞 `<pro>Lov`: Fixed an issue where the input query had no results in the case with `cascadeMap`.
- 🐞 `<pro>Select`: Fixed an error in keyboard operation.
- 🐞 `<pro>Table`: Fixed an issue where the advanced filter bar fuzzy search would have duplicate values.

## 0.8.33

`2019-11-05`

- 🌟 `configure`: Date formatter is added to the global configuration.
- 🌟 `<pro>Table`: The radio button can be deselected by clicking on it.
- 🌟 `<pro>Table`: Added `onExpand` property.
- 🐞 `<pro>IntlField`: Fixed a conflict when a single record had multiple multi-language controls.
- 🐞 `<pro>DataSet.Field`: Fixed the problem that dynamic `lookupUrl` does not display the value.

## 0.8.32

`2019-11-05`

- 🌟 `<pro>DataSet.Record`: Added `init` method.
- 🌟 `<pro>DataSet.Transport`: The tls hook adds the `record` parameter.
- 🐞 `<pro>DataSet.Field`: Fixed the problem that dynamic `lovCode` does not display the value.

## 0.8.31

`2019-11-02`

- 🌟 `<pro>DataSet.Transport`: The tls hook added name parameter for field name.
- 💄 `<pro>DataSet.Field`: The dynamicProps hook will be deprecated in v1.0, please use the dynamicProps object.
- 🐞 `<pro>DataSet`: Fixed a problem where the cascading row's changes could not be committed when the cascading header dataset has `transport.update` property but no `transport.submit` property.
- 🐞 `<pro>DataSet`: Fixed a problem with multi-level cascading.
- 🐞 `<pro>Table`: Fixed an issue where the filter bar reported an error when switching dataset.
- 🐞 `<pro>Table`: Fixed the problem of tree selection.
- 🐞 `<pro>Lov`: Fixed an issue where pressing Enter would enter a custom value.

## 0.8.30

`2019-10-31`

- 🌟 `<pro>DatePicker`: Input enabled.
- 🌟 `<pro>DataSet`: Added `feedback` property.
- 🌟 `<pro>DataSet.Field`: Added `labelWidth` property.
- 🌟 `configure`: Added lookupCache property.
- 💄 `configure`: Optimize the default logic for global configuration `transport`.
- 💄 `<pro>DataSet.Field`: The rule is removed that the uniqueness check interface could not be called until the number of pages was greater than 1.
- 💄 `<pro>Table`: Optimize scroll bar.
- 🐞 `<pro>Button`: Fixed an issue where click events could not prevent bubbling.
- 🐞 `<pro>Tooltip`: Fixed issues that the repaired content does not wrap, the `hidden` property is not controlled, and the `defaultHidden` property does not work.
- 🐞 `<pro>Lov`: Fixed an issue that multiple records with the same `textField` value, only the first one of them can be selected.
- 🐞 `<pro>DataSet.Record`: Fixed a problem where multiple languages would also be queried in the created state.
- 🐞 `<pro>DatePicker`: Fixed an issue that reset could not clear the value in range mode.

## 0.8.29

`2019-10-27`

- 💄 `<pro>Field`: Optimize the lookup caching mechanism.
- 🐞 `<pro>Select`: Fixed an issue where `lovQueryAxiosConfig` did not work when using `lovCode`.
- 🐞 `<pro>Select`: Fixed the problem with `searchMatcher`.
- 🐞 `<pro>Table`: Fixed the problem that CheckBox of unedited line is not disabled in the inline-edit mode.

## 0.8.28

`2019-10-25`

- 🌟 `configure`: Add global configuration `transport`, `lookupAxiosConfig`, `iconfontPrefix`, `icons`.
- 🌟 `Icon`: Customizable iconfont resource.
- 💄 `<pro>DataSet.Field`: Optimize logic related to `lookupAxiosConfig`, `lovDefineAxiosConfig`, `lovQueryAxiosConfig`.
- 💄 `<pro>Table`: Optimize scroll bar.
- 🐞 `Alert`: Fix the problem that the icon is not displayed.
- 🐞 `<pro>Form`: Fixed an issue where the child element's `labelWidth` was non-numeric.

## 0.8.27

`2019-10-22`

- 🌟 `<pro>Form`: The `labelWidth` property of child element is exists.
- 🐞 `<pro>Table`: Fix `ResizeObserver loop limit exceeded` error.
- 🐞 Fix circular dependencies problems.
- 🐞 `Button`: Fix the problem that the loading icon is not displayed.

## 0.8.26

`2019-10-21`

- 🌟 `<pro>DataSet`: Added `autoQueryAfterSubmit` property.
- 💄 `<pro>DataSet`: Optimize the commit data write-back logic.
- 🐞 `<pro>NumberField`: Fix the problem with the step button.

## 0.8.25

`2019-10-19`

- 🐞 `<pro>DataSet`: Fixed an issue where data could not be written back after commit if there was write-back data but no \_id attribute from response.
- 🐞 `<pro>Lov`: Fixed a problem where Multi-Lov could not select values.

## 0.8.24

`2019-10-18`

- 💄 `<pro>Table`: Adjust the advance bar button type.

## 0.8.23

`2019-10-18`

- 💄 `<pro>Table`: Performance optimization.
- 💄 `<pro>Lov`: The query condition is not cleared when it is cached.
- 🐞 `<pro>Table`: Fixed the problem that advanced query condition bar shows the normal query field.
- 🐞 `<pro>Table`: Fixed an issue where the record could not be operated when the delete record failed.
- 🐞 `<pro>DataSet`: Fixed an issue where the commit data was cached again after the commit error.
- 🐞 `<pro>Lov`: Fixed an issue where the value could not be cleared in the editable state.
- 🐞 `<pro>Select`: Fix the duplicate values problem cause by using the select-all button of multi-select.

## 0.8.22

`2019-10-17`

- 🌟 `<pro>Field`: The `dynamicProps` property supports object types. The object is a key-value pair which key is field property and value is a hook that returns the value of the field.
- 🌟 `<pro>DataSet`: The `confirmMessage` parameter of `delete` and `deleteAll` methods supports the properties of the Modal.
- 💄 `<pro>Output`: Adjust the line spacing in the Form.
- 💄 `Button`: Adjust the loading status to match the `Button` of pro.
- 💄 `<pro>Modal`: Adjust the styles of `confirm`, `info`, `success`, `error`, `warning` to match the style of the base component.
- 🐞 `<pro>DatePicker`: Fixed display problem with null values in range mode.
- 🐞 `<pro>Table`: Fixed an issue where the display of the column was incorrect when the table width switched between two fixed size.

## 0.8.21

`2019-10-14`

- 💄 `<pro>Lov`: Adjust the minimum height of the Lov popup.
- 🐞 `<pro>Lov`: Fix the problem that the unique check does not display an error.
- 🐞 `<pro>Table.Column`: Fixed an issue with the `tooltip` property.
- 🐞 `Modal.SideBar`: Fixed an issue where the `closable` property didn't work.

## 0.8.20

`2019-10-13`

- 🌟 `configure`: Added `defaultValidationMessages` global configuration.
- 🌟 `<pro>DataSet.Field`: Added `defaultValidationMessages` property.
- 🌟 `<pro>DataSet`: Added `confirmMessage` parameter for `delete` and `deleteAll` method.
- 🌟 `<pro>FormField`: Added `validationRenderer` property.
- 💄 `<pro>Table`: Tree table expansion state persistence.
- 🐞 `<pro>Table`: Fixing the collapse-all button of tree table sometimes fails to collapse the node.
- 🐞 `<pro>Validator`: Fix the problem of union unique validation.
- 🐞 `<pro>NumberField`: Fix the problem of step button in multiple mode.

## 0.8.19

`2019-10-11`

- 🌟 `configure`: Added `pagination` global configuration.
- 🌟 `<pro>Select`: Added `notFoundContent`, `onOption` properties.
- 💄 `<pro>FormField`: The return value type of `renderer` is supports `ReactNode`.
- 💄 `<pro>Table`: The tree table highlights the first root record by default.

## 0.8.18

`2019-10-10`

- 🌟 `<pro>Select`: Added the select all and unselect all button for multiple selection.
- 🐞 `<pro>Table`: Fixed a problem that the cell content was wrapped which was a block-level element.
- 🐞 `<pro>Select`: Fixed an issue where the loading status did not stop.

## 0.8.16

`2019-10-09`

- 🌟 `<pro>Table.Column`: Added `tooltip` property.
- 🌟 `<pro>Select`: Added `searchMatcher` property.
- 🌟 `<pro>Pagination`: Added `showSizeChangerLabel`, `sizeChangerPosition`, `sizeChangerOptionRenderer` properties.
- 🌟 `<pro>DataSet.Field`: The `format` attribute adds the `uppercase` `lowercase` `capitalize` value.
- 🌟 `<pro>DataSet.Field`: Added `lovDefineAxiosConfig`, `lovQueryAxiosConfig` properties.
- 🌟 `<pro>TriggerField`: Added `onPopupHiddenChange` property.
- 🌟 `<pro>`: Added Japanese.
- 💄 `<pro>Table`: Refactor the advanced query bar.
- 🐞 `<pro>DataSet`: Fixed an issue where the timing of the ready method was incorrect, such as query method called before the queryDataSet was ready.
- 🐞 `<pro>Table`: Fix the problem of misalignment of composite columns.
- 🐞 `<pro>DatePicker`: Fixed a problem with custom check range values.
- 🐞 `Radio.Button`: Fixed an issue where the selected style was not updated.

## 0.8.15

`2019-09-27`

- 🐞 `<pro>DataSet`: Fixed an issue with dataKey.

## 0.8.14

`2019-09-26`

- 🌟 `<pro>Field`: Added `trim` property.
- 🌟 `<pro>DataSet`: `dataKey` and `totalKey` support deep matching, such as `dataKey = "demo.list"`.
- 🐞 `<pro>Table`: Fixed an issue with Table querybar.
- 🐞 `<pro>Field`: Fixed a problem where float label does not work under firefox.

## 0.8.13

`2019-09-26`

- 🌟 `<pro>Table`: Attribute `queryBar` supports hook type.
- 🐞 `<pro>DataSet.Field`: Fixed an issue where `dynamicProps` didn't work in some cases.

## 0.8.12

`2019-09-25`

- 🌟 `<pro>Lov`: Added button mode.
- 💄 `<pro>Lov`: In the multiple Lov's pop-up window, the the existing value will be selected.
- 💄 `<pro>Table`: Adjust the spacing of the advancedBar.
- 💄 `<pro>Button`: Adjust height of Button to .3rem.
- 💄 `<pro>Modal`: Update the style.
- 🐞 `<pro>Table`: Fix problems caused by hidden columns.
- 🐞 `<pro>Table`: Fixed an issue where the locked column editor did not display.
- 🐞 `<pro>Table`: Fixed an issue where query bar value changes would not be automatically queried after DataSet switched.
- 🐞 `<pro>CodeArea`: Fix uncontrolled problems.
- 🐞 `<pro>NumberField`: Fix the accuracy problem.
- 🐞 Fix circular dependencies problems.

## 0.8.11

`2019-09-16`

- 💄 `<pro>Table`: Change the fuzzy condition count of query bar to one limits.

## 0.8.10

`2019-09-16`

- 🐞 `Input`: Fixed an issue with a white screen.
- 🐞 `<pro>DataSet`: Fix the problem with the isModified method.

## 0.8.9

`2019-09-12`

- 🌟 Upgrade webpack4 babel7 eslint and stylelint.
- 🌟 `configure`: Add global configuration new properties.
- 🌟 `<pro>DataSet`: Add beforeDelete event.
- 🌟 `<pro>DataSet.Record`: Added save and restore methods.
- 🌟 `<pro>Table.Filter`: Optimize the position of the filter placeholder and cursor, and adjust the filter bar height to 40px.
- 🌟 `<pro>Table`: The temporarily deleted line is displayed as disabled and reset when the submission fails.
- 🌟 `<pro>Table`: Support SelectBox editor.
- 🌟 `<pro>Lov`: Add `conditionFieldRequired` in lov item config.
- 🐞 `<pro>Table`: Fixed a problem where there would be no border between the non-fixed and fixed columns of the Table.
- 🐞 `<pro>Table`: Fix the row positioning problem with the up and down key of keyboard.
- 🐞 `<pro>DataSet`: Fix the problem when `dataKey` is null.
- 🐞 `<pro>DataSet`: Fixed an issue that export function can not be executed until the exportUrl property is set.
- 🐞 `<pro>Form`: Fixed a problem where the width of the FormField was not 100% when the className was set.
- 🐞 `<pro>TextField`: Fix the autofill and prefix style of the float label.
- 🐞 `<pro>DatePicker`: Fix the problem when `range` is array.
- 🐞 `<pro>DataSet.Field`: Fix `dynamicProps` cycle running.

## 0.8.8

`2019-08-23`

- 🌟 `Responsive`: Added Responsive component.
- 🌟 `<pro>DataSet`: Transport increases the exports configuration, the exported url is spliced to the baseUrl of axios, and the export event is added.
- 💄 `<pro>Form`: Optimize the responsiveness.
- 🐞 `<pro>Lov`: Fixed that multiple Lov do not cache selected records when turning pages .
- 🐞 `<pro>DataSet.Record`: Fix the problem of serializing data.
- 🐞 `<pro>Table`: Optimized AdvanceQueryBar, fix some bug.
- 🐞 `<pro>Select`: Fix the error message cover the drop-down box.

## 0.8.7

`2019-08-22`

- 🐞 `<pro>IntlField`: Fixed multi-language required and data change display issues.

## 0.8.6

`2019-08-21`

- 🐞 `<pro>Table`: Fixed an issue that table was not automatically queried when it's filter bar value was changed.
- 🐞 `<pro>Table`: Fixed an issue of inline editing when the dataSet was changed.

## 0.8.5

`2019-08-21`

- 🌟 `configure`: Add global configuration new properties.
- 🌟 `<pro>DataSet.Record`: The `toJSONData` method adds the `isCascadeSelect` parameter.
- 💄 `<pro>IntlField`: Refactor the code to support multi-language values directly from the Record data.
- 🐞 `<pro>Tabs`: Fix disabled style issues.

## 0.8.4

`2019-08-16`

- 🌟 `configure`: Add global configuration new properties.
- 🌟 `getConfig`: export getConfig method from choerodon-ui.
- 🌟 `<pro>Field`: Add rang property.
- 🌟 `<pro>DatePicker`: Add multiple and range mode.
- 🌟 `<pro>Button`: Add the primary color.
- 🌟 `<pro>Table`: Advanced search adds a reset button.
- 🌟 `<pro>Table.Column`: The command property adds a hook type.
- 🐞 `<pro>DataSet`: Fix bugs when the response value is empty.
- 🐞 `<pro>Tooltip`: Fix the problem that the z-index is lower than the drop-down box.
- 🐞 `<pro>Table`: Fixed an issue where the value of filterBar was not controlled.

## 0.8.3

`2019-08-08`

- 💄 `<pro>Popup`: Synchronize with scrolling when expanded.
- 💄 `<pro>DatePicker`: Completion of internationalization.
- 🐞 `<pro>SelectBox`: Fix the problem that SelectBox selects multiple values under Form.
- 🐞 `<pro>Anchor`: Fixed an issue where the getContainer property is invalid.

## 0.8.2

`2019-08-06`

- 🌟 `<pro>configure`: The hook `generatePageQuery` adds the `sortName` and `sortOrder` parameters.
- 🌟 `<pro>Form`: Add the pristine attribute to display the initial value of the record.
- 🌟 `<pro>FormField`: Add the pristine attribute to display the initial value of the record.
- 🌟 `<pro>Table`: Add the pristine attribute to display the initial value of the record.
- 💄 `<pro>Range`: Update the style under float label layout.
- 💄 `<pro>CheckBox`: Update the style under float label layout.
- 💄 `<pro>Switch`: Update the style under float label layout.
- 🐞 `<pro>Radio`: When using `label` as `children`, `label` won't be rendered under float label layout.
- 🐞 `<pro>CheckBox`: When using `label` as `children`, `label` won't be rendered under float label layout.

## 0.8.1

`2019-08-02`

- 🐞 `<pro>Table`: Fix the problem that the CheckBox editor displays the label.

## 0.8.0

`2019-08-02`

- 🌟 `configure`: Add global configuration new properties.
- 🌟 `<pro>Modal`: Modal and internal injection modal object add `update` methods.
- 🌟 `<pro>Modal`: Added `okProps`, `cancelProps`, `okFirst`, `border` attribute.
- 🌟 `<pro>DataSet.Field`: Add `requestTransform` & `responseTransform` input property.
- 🌟 `<pro>Table`: Add `advancedBar` type to `queryBar` property.
- 🌟 `message`: Added `placement` config.
- 🌟 `<pro>DataSet.Record`: The set method can pass an object with a key-value pair.
- 🌟 `<pro>DataSet`: Added `reverse`, `reduce`, `reduceRight`, `removeAll`, and `deleteAll` methods.
- 🌟 `<pro>Select`: Add `optionRenderer` input property.
- 💄 `Password`: Change to reveal password by clicking.
- 💄 `Input`: Update the style.
- 💄 `DatePicker`: Update the style.
- 💄 `Select`: Update the style.
- 💄 `<pro>Form`: Optimize rowSpan and colSpan.
- 💄 `<pro>FormField`: Update the style under float label layout.
- 💄 `<pro>DataSet`: The return value of the query and submit events is false which can prevent queries and commits.
- 💄 `<pro>Popup`: upgrade the `z-index` style.
- 💄 `SelectBox`: Update the style(with 'floatLabel' layout).
- 💄 `TextArea`: Update the style.
- 💄 `Tabs`: Update the style.
- 💄 `<pro>Table`: Update the style of `ColumnFilter`.
- 💄 `<pro>DataSet.Field`: The checksum will be reset but not triggered automatically when the dynamic properties changed.
- 💄 `<pro>DataSet`: Cancel the cache strategy in `Validator.checkValidity` method.
- 💄 `<pro>Modal`: `footer` property now supports `function` type.
- 💄 `<pro>Select`: When there is no matching option, the value is displayed instead of automatically clearing the value, except for cascading.
- 💄 `<pro>Select`: When the component is searchable & there is no matching option, the popup menu shows `No Matching Options`.
- 💄 `<pro>DataSet.Field`: `lookupAxiosConfig` supports hooks.
- 💄 `<pro>Modal`: Adjust the footer position to bottom of the viewport in `drawer` modal.
- 💄 `<pro>Radio`: Use `label` as `children` when there is no `children`.
- 💄 `<pro>CheckBox`: Use `label` as `children` when there is no `children`.
- 🐞 `<pro>FormField`: Fix the problem when the label is ReactNode.
- 🐞 `<pro>TextField`: Fix the display style of TextField(and child classes) when using addons.
- 🐞 `<pro>Modal`: Fix the problem when `document.body` has no scrollbar, a popup modal will affect the page layout.
- 🐞 `<pro>Modal`: Fix the problem when using float-label `Form` in a `drawer`, the validation & help message cannot scroll.
- 🐞 `<pro>FormField`: Fix the style of `FormField` label with multiple values.
- 🐞 `<pro>Form`: Fixed an issue where the disabled property could not be passed to the child Form.
- 🐞 `<pro>DataSet`: Fix the problem that the transport hooks does not pass `params`.
- 🐞 `<pro>Lov`: Fix the problem when the Field.type is string, the text is not displayed.
- 🐞 `<pro>SelectBox`: Fix the problem that children changes are not rendered.
- 🐞 `Modal`: Fix the problem that `width` property doesn't work with `SideBar`.

## 0.7.6

`2019-07-09`

- 💄 `<pro>DataSet`: Optimize performance.
- 💄 `<pro>Validator`: Optimize validation.
- 🐞 `<pro>Select`: Fix the bug of compound multiple selection.
- 🐞 `<pro>Select`: With the same text, searchable Select always selects the first option.
- 🐞 `<pro>DataSet`: Fixed the ignore property of the Field will ignore the binding fields.

## 0.7.5

## 0.6.14

`2019-06-28`

- 🐞 `<pro>TextArea`: Fixed an issue where uncontrolled values could not be retained.

## 0.7.3

## 0.6.12

`2019-06-27`

- 💄 `<pro>Validator`: Optimize the verification information displayed by email, url, and color in Output.
- 🐞 `<pro>Table`: After checking the failed drop-down box to reselect the value, other editors cannot be activated.
- 🐞 `<pro>Select`: Fixed a problem with the primitive attribute.

## 0.7.1

## 0.6.10

`2019-06-25`

- 🌟 `configure`: Add global configuration new properties.
- 💄 `<pro>TextField`: Updated the style of the input box with the property `labelLayout` is float.
- 🐞 `<pro>Select`: Fix bugs in the `combo` property.
- 🐞 `Checkbox`: Fixed semi-selection style issues.
- 🐞 `<pro>Validator`: Fixed Unique validates problem when `Transport` setting validate.
- 🐞 `<pro>DataSet`: Fixed the `Field.dirty` property has a problem with loop calculations.
- 🐞 `<pro>DataSet`: Fix the problem that the composite value of lookup is not displayed in Output.

## 0.7.0

## 0.6.9

`2019-06-19`

- 🌟 `<pro>DataSet`: Field adds the `lookupAxiosConfig` property to adapt the configuration of the lookup request.
- 🌟 `configure`: Add global configuration new properties.
- 🌟 `<pro>DataSet`: The property transport supports hooks.
- 💄 `<pro>TextField`: Updates the disabled style when the `labelLayout` is `float`.
- 💄 `<pro>Table`: Optimize the display of empty data.
- 🐞 `<pro>Table`: Fix the problem that the filter bar placeholder always shows.
- 🐞 `<pro>DataSet`: Fixed an issue where the commit response value was empty.
- 🐞 `<pro>DataSet`: Fixed an issue where the commit response value was empty.
- 🐞 `<pro>DataSet`: Fixed the timing issue triggered by indexChange.
- 🐞 `<pro>DataSet`: Fixed an issue where the query parameters of the `query` event were incorrect.
- 🐞 `<pro>DataSet`: Fixed an issue where cascading subdata source data could not be submitted.
- 🐞 `<pro>DataSet`: Fixed an issue where property `ignore` of multi-language field is a `clean` that could not be submitted correctly.

## 0.6.8

`2019-06-13`

- 💄 `<pro>DataSet`: If the query is a get request, the query condition is automatically incorporated into params.
- 🐞 `<pro>Table`: Fix the `header` property of the column does not support ReactNode.

## 0.6.7

`2019-06-13`

- 🌟 `<pro>DataSet`: The property `transport` adds the `adapter`x hook property to adapt the configuration of the CRUD request.
- 🐞 `<pro>DataSet`: Fix the submit method with no return value.

## 0.6.6

`2019-06-12`

- 🌟 `<pro>DataSet`: Added `transport` property to configure CRUD requests.
- 💄 `Message`: The default `placement` property is set to `leftBottom`.
- 🐞 `<pro>DatePicker`: Fix the problem that the `placeholder` does not display.

## 0.6.5

`2019-06-07`

- 💄 `<pro>TextField`: Updated the style of the input box with the property `labelLayout` is float.
- 💄 `<pro>DataSet`: Optimize the problem that memory is not released.
- 🐞 `<pro>Upload`: Fixed an issue where the popup could not be closed.

## 0.6.4

`2019-05-25`

- 🌟 `<pro>FormField`: Added `maxTagPlaceholder`, `maxTagCount`, `maxTagTextLength` properties.
- 🌟 `<pro>Field`: Added the `ignore` property.
- 🌟 `<pro>Select`: Added the `primitiveValue` property.
- 🌟 `<pro>Tranfer`: Added Transfer component.
- 🌟 `<pro>DataSet`: Deprecated the beforeSelect event and adds the create event.
- 🌟 `Ripple`: Added the disabled property to disable the ripple effect.
- 💄 `<pro>Table`: Optimize performance when the size changes.
- 💄 `Pagination`: Optimize the paging effect within 10 pages.
- 💄 `<pro>Lov`: Promote the `placeholder` property with a priority greater than the configured `placeholder`.
- 🐞 `<pro>Table`: Fixed an issue where the inline edit box was not displayed when the binding dataSet create new record.
- 🐞 `<pro>Select`: The value of the renderer is always displayed when it is not editable.

## 0.6.3

`2019-05-24`

- 🐞 `Tree`: Fix style.
- 🐞 `Button`: Fix small button style.

## 0.6.2

`2019-04-25`

- 🌟 `<pro>Form`: Install the disabled attribute.
- 🌟 `<pro>TextField`: Added the restrict attribute to limit the characters that can be entered.
- 🌟 `<pro>Table`: Add inline editing mode.
- 🌟 `<pro>Table`: Added `pagination` property.
- 🌟 `<pro>Pagination`: Added `showTotal`, `showPager`, `itemRender` properties.
- 💄 `<pro>Table`: Optimize the display of required and editable cells.
- 🐞 `<pro>Form`: Fixed an issue with layout when there were empty child elements.
- 🐞 `<pro>Lov`: Fixed an issue where the lovItems in the configuration were null.
- 🐞 `<pro>NumberField`: Fixed an issue where the plus or minus button was incorrect when it was greater than 1000 digits.

## 0.6.1

`2019-04-18`

- 🌟 `<pro>Form`: Property labelLayout adds float value.
- 🌟 `<pro>Table`: Deprecated the property `showQueryBar`, added `queryBar` property, the optional value is `normal` `bar` `none`.
- 🌟 `<pro>Table`: Added expanded row rendering.
- 🌟 `<pro>Table`: Added `onCell` property to set cell properties.
- 🌟 `<pro>Table`: Deprecated the property `rowRenderer`, added `onRow` property to set row properties.
- 🌟 `<pro>Lov`: Added `searchable` property, LovConfig adds `editableFlag` configuration, which can be used to get lov value when input.
- 💄 `<pro>Table`: Optimize Table grouped columns.
- 🐞 `<pro>Field`: Fix property pattern does not support regular constants.
- 🐞 `<pro>Lov`: Fix the problem that the column number does not take effect.
- 🐞 `<pro>NumberField`: Fix the problem that the field could be clicked the plus or minus button when read-only.
- 🐞 `Tabs`: Fix the problem that the tab cannot be switched when the key is not passed.

## 0.6.0

`2019-04-01`

- 🌟 Incorporate the `choerodon-ui/pro` component library.
- 🌟 The default ant prefix is changed to c7n. To use the ant prefix, please [Modify the topic variable @c7n-prefix](https://choerodon.github.io/choerodon-ui/docs/react/customize-theme) And use [global configuration](https://choerodon.github.io/choerodon-ui/components/configure).

## 0.5.7

`2019-04-26`

- 🐞 `Icon`: Fix icon size issues.

## 0.5.6

`2019-04-25`

- 🌟 `Icon`: Add new icons.

## 0.5.5

`2019-04-20`

- 🐞 Fix the problem of 0.5.4 publishing file confusion.

## 0.5.4 (deprecated)

`2019-04-19`

- 🌟 `Icon`: Add new icons.

## 0.5.3

`2019-03-20`

- 💄 `Input`: The Input input shows a prompt when it reaches the character limit.
- 🌟 `Modal`: Modal adds the `disableOk` and `disableCancel` properties.
- 🌟 `TreeNode`: TreeNode adds the `wrapper` attribute.
- 🌟 `Icon`: Add new icons.
- 🌟 `IconSelect`: Add the `showAll` attribute.

## 0.5.2

`2019-02-22`

- 💄 `Table`: The confirmation button for the filter in the repair table is fixed at the bottom of the selection box and the style is overwritten.
- 🌟 `Sidebar`: add `alwaysCanCancel`.

## 0.5.1

`2019-02-19`

- 💄 `Form.Item`: The suffix icon is not hidden when Form.Item is verified as error.
- 💄 `Table`: Table filter does not clear after blur.
- 💄 `Table`: Table filter clear icon is displayed when there is content.
- 💄 `Table`: The confirmation button filtered in the Table is fixed at the bottom of the selection box.
- 🌟 `Icon`: Add new icons.

## 0.5.0

`2019-01-10`

- Change the source of the icon font file to change it from the npm library and package it locally.
- 💄 `IconSelect`: Optimize IconSelect, the icon is larger, and only the common icons are retained.
- 💄 `table`: Optimize the table to automatically return to the first element when turning pages.

## 0.4.5

`2018-12-11`

- 🌟 `Icon`: Add new icons.
- 💄 `Select`: `all` and `no` button change to not valid for disabled options

## 0.4.4

`2018-12-3`

- 💄 `Menu`: Fixed a dependency error.

## 0.4.3

`2018-11-29`

- 🌟 `Select`: Add`onPopupFocus`，Callback executed when Popup is focus.
- 💄 `Select`: In the select search box, you can use the up and down selection and then press Enter to confirm.
- 💄 `Select`: Multi-select box: delete the label, do not open the select box.
- 💄 `Select`: Remove the title information after the tag is hovered in the select.
- 💄 `Menu`: Upgrade the rc-menu component to the community version.

## 0.4.2

`2018-11-13`

- 🌟 `Icon`: Add new icons.
- 🌟 `Table`: Add `noFilters`, Used to block the default filtering.
- 🌟 `Table.Column`: Add `disableClick` to disable the check for the `Table` filter.
- 💄 `Tag`: Fix hot label display issues.
- 💄 `Select`: all-select and no logic optimization.

## 0.4.1

`2018-10-26`

- 🌟 `Icon`: Add new icons.
- 🌟 `Table`: Add onColumnFilterChange. Callback executed when ColumnFilter is changed.
- 💄 `Demo`: Fix bisheng demo site can't expand code by click the button.
- 💄 `Avatar`: Fix avatar Chinese text positioning is not accurate.

## 0.4.0

`2018-09-28`

- 🌟 `Select`: Improve the customization ability of `maxTagCount`.
- 💄 `Input`: Adjust the style.
- 💄 `Select`: Adjust the style.

## 0.3.10

`2018-09-21`

- 🌟 `List`: List add `empty`.
- 🌟 `Table`: Table add `empty`.
- 🌟 `Icon`: Added new icons.
- 💄 `Select`: Adjust the style.
- 💄 `Cascader`: Adjust the style.
- 💄 `Table`: Fixed a bug where the editable cell example could not edit the cell.

## 0.3.9

`2018-09-07`

- 🌟 `Icon`: Added new icons.
- 🌟 `Card`: Add `onHeadClick`.
- 💄 `Input`: Adjust the style.
- 💄 `Sidebar`: Fix props without `getContainer` error.

`2018-09-04`

- 🌟 `Input`: Add `showPasswordEye`.
- 💄 `IconSelect`: Change search not case sensitive.

## 0.3.8

`2018-08-31`

- 🌟 `Icon`: Added new icons.
- 💄 `Input`: Adjust the style.
- 💄 `FormItem`: Adjust the style.

## 0.3.7

- 💄 `Table`: Adjust the style.
- 💄 `Input`: Show default ban icon while hover Input
- 💄 `Spin`: Fixed Spin layer.

## 0.3.6

`2018-08-16`

- 🌟 `Icon`: Added new icons.

## 0.3.5

`2018-08-03`

- 💄 `Switch`: Adjust the style.
- 🌟 `Icon`: Added new icons.

## 0.3.4

`2018-07-19`

- 🌟 `Icon`: Added new icons.

## 0.3.3

`2018-07-06`

- 🌟 `Select`: Added `onChoiceRemove`.
- 🌟 `Input`: Added `showLengthInfo`.
- 🌟 `Modal`: Added `center`.
- 💄 `Select`: Adjust the style.
- 💄 `Tree`: Adjust the style.
- 💄 `Modal.Sidebar`: Adjust the style.
- 💄 `InputNumber`: Adjust the style.
- 💄 `Select`: `filterInput` autoFocus.
- 🐞 `Table`: Fixed `onChange` returned value mistake.
- 🐞 `Select`: Fixed clicked the dropdown's icon can't trigger focus.
- 🐞 `Table`: Fixed the popup of default filters.

## 0.3.2

`2018-06-28`

- 🌟 `Icon`: Added new icons.
- 🌟 `Form`: Added `isModifiedFields` `isModifiedField`.
- 💄 `Table`: Adjust the style of sort's icon.
- 💄 `Select` `Input` `Radio` `DatePicker`: Adjust the style.

## 0.3.1

`2018-06-08`

- 🐞 `Table`: Fixed select dropDown of Column which is always loading.

## 0.3.0

`2018-06-08`

- 🌟 `Select`: Added loading.
- 💄 `Collapse`: Adjust the style of icon.
- 💄 `Modal`: Adjust the style of footer's button.
- 🌟 Added component `IconSelect`.
- 💄 `Table`: Adjust `FilterSelect` function.
- 💄 `Table`: Adjust the position of Popup.

## 0.2.4

`2018-06-01`

- 💄 `Select`: Adjust the style of icon.
- 💄 `Input`: Adjust the style of icon.
- 🌟 `Icon`: Added new icons.

## 0.2.2

`2018-05-31`

- 💄 `Radio`: Adjust the style of disabled.
- 💄 `Pagination`: Adjust the style of select.
- 💄 `Select`: Adjust the style of multiple.
- 🐞 `Select`: Fixed can't select input value without data.

## 0.2.1

`2018-05-28`

- 💄 `Select`: Adjust the style of multiple.

## 0.2.0

`2018-05-18`

- 🌟 migrate to npmjs.

## 0.1.11

`2018-05-15`

- 💄 `Button`: Adjust disabled background color.
- 💄 `Modal.Sidebar`: Adjust the style of title.

## 0.1.10

`2018-05-14`

- 🐞 `Table`: Fixed filter bar remove choice item will effect current state `filteredValue`;
- 💄 `Select`: Adjust disabled style.

## 0.1.9

`2018-05-13`

- 💄 `Form`: Adjust validation feedback icons.
- 💄 `Popover`: Adjust icon.
- 🐞 `Table`: Fixed when `value` in prop `filters` of `column` is not string, the display of filter bar's selection value will be wrong.
- 🌟 `Table`: `column` added `filterTitle` prop.

## 0.1.8

`2018-05-12`

- 🐞 `Table`: Fixed when prop `childrenColumnName` is not `children` and all of first level records's row-select are disabled and others and enabled, the check-all-box is disabled.
- 🐞 `Select`: In Form, select all can't get value.

## 0.1.7

`2018-05-12`

- 💄 `Icon`: font-weight change to inherit.
- 🐞 `Select`: Open the dropdown again after cannot be query.

## 0.1.6

`2018-05-11`

- 💄 `Pagination`: Adjust the style of Pagination.
- 💄 `Modal.Sidebar`: content scroll.
- 💄 `Select`: Adjust the style of Select.
- 🌟 `Select`: Added prop choiceRender.

## 0.1.5

`2018-05-10`

- 🐞 `Ripple`: Fixed style's dependency which use the Ripple.
- 🐞 `Icon`: Fixed icon sizes under different font sizes are not self-adaptive.
- 🌟 `Checkbox`: Added prop label.
- 🌟 `Radio`: Added prop label.
- 💄 `Select`: Adjust when label not exist.
- 🐞 `Input`: Fixed defaultValue and label overlap.

## 0.1.4

`2018-05-08`

- 🐞 `Ripple`: Fixed bugs which inner node's position style is static.

## 0.1.3

`2018-05-07`

- 🌟 `Model.Sidebar`: Add footer
- 💄 `Spin`: Adjust the rotation effect.
- 🐞 `Table`: Fixed filter bar errors when column filter fails to filter columns without dataIndex property.

## 0.1.2

`2018-05-03`

- 🌟 `Pagination`: Added prop `tiny` for table pagination theme.
- 💄 `Tab`: Adjust the icons.
- 🐞 `Table`: Fixed error for the choose value of fiter bar.
- 🐞 `Ripple`: Fixed error for style of child node.
- 🌟 `Icon`: Add new icons.
- 🐞 `Input`: Fix prefix and suffix.

## 0.1.1

`2018-05-02`

- Table
  - 🌟 `FilterBar`: Added multiple choose function by prop `column.filterMultiple`.
  - 🐞 `FilterBar`: Fixed column filter error.
  - 🐞 Fixed the issue that the expand icon does not rotate by center.
- 🐞 `Modal.Sidebar`: Fix Button's loading display.

## 0.1.0

`2018-04-28`

- 💄 `Ripple`: Optimize and abstracted into components.
- 🐞 `Select`: Fixed the content display when it's too large.
- 💄 `Table`: Adjust the row's expanded icon
- 💄 `Table`: When the `column.filters` prop is an empty array, `filterBar` can also display the optional column.

## 0.0.5

`2018-04-26`

- 💄 Adjust Table row's expanded icon.
- 🐞 Fixed rc-components error under IE9.
- 🌟 Added `placement` for message to position.
- 🌟 Added `bottom` for message's config.
- 🌟 Added `footer` for Select.

## 0.0.4

`2018-04-25`

- 💄 Adjust Table's filter bar to forbid OR logic by default.
- 💄 Adjust the style of Select's clear icon .
- 🌟 Added `funcType` for Modal to button function.

## 0.0.3

`2018-04-24`

- 🐞 Fixed Form's Input error.
- 🐞 Fixed the theme style of Input compatibility error.
- 🐞 Fixed the theme style of Select compatibility error.
- 🐞 Fixed the theme style of AutoComplete compatibility error.
- 💄 Adjust the theme style of Radio.
- 💄 Adjust the theme style of Upload.
- 💄 Adjust the eject position of Dropdown.
- 💄 Adjust the Button's loading style.

## 0.0.2

`2018-04-20`

- 🐞 Fixed missing dependencies for each components in `rc-components`.
- 🐞 Fixed Table's filterBar error.
- 💄 Adjust the theme style of Button.
- 💄 Adjust the theme style of Menu.
- 💄 Adjust the theme style of Modal.
- 💄 Adjust the theme style of Progress.
- 💄 Adjust the theme style of Select.
- 💄 Adjust the theme style of Input.
- 🌟 Added value `loading` for Progress's prop `type`.
- 🌟 Added Modal.SideBar.
- 🌟 Added `copy` and `onCopy` for Input to copy function.

## 0.0.1

`2018-04-11`

- Table
  - 🌟 Added `filterBar` to open the filter bar function.
  - 🌟 Added `filters` to control filter conditions selected.
- 🌟 Added `label` for each form control to display floating text.
- 💄 Adjust the theme style of each component.

## 0.0.0

`2018-04-01`

- 🌟 Based on [Ant Design@3.4.0](https://github.com/ant-design/ant-design/blob/master/CHANGELOG.en-US.md#340)
