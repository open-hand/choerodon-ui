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
- 🐞 `Modal`: Fix the problem that `width` property doesn't work with `SideBar`。

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
- 💄 `Demo`: Fix bisheng demo site can't expand code by click the button。
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
- 🐞 `Ripple`: Fixed error for style of child node。
- 🌟 `Icon`: Add new icons.
- 🐞 `Input`: Fix prefix and suffix.

## 0.1.1

`2018-05-02`

- Table
  - 🌟 `FilterBar`: Added multiple choose function by prop `column.filterMultiple`。
  - 🐞 `FilterBar`: Fixed column filter error。
  - 🐞 Fixed the issue that the expand icon does not rotate by center。
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
- 🌟 Added `placement` for message to position。
- 🌟 Added `bottom` for message's config。
- 🌟 Added `footer` for Select。

## 0.0.4

`2018-04-25`

- 💄 Adjust Table's filter bar to forbid OR logic by default.
- 💄 Adjust the style of Select's clear icon 。
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
