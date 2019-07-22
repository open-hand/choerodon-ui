---
order: 6
title: Change Log
toc: false
timeline: true
---

`choerodon-ui` strictly follows [Semantic Versioning 2.0.0](http://semver.org/).

#### Release Schedule

* Weekly release: patch version at the end of every week for routine bugfix (anytime for urgent bugfix).
* Monthly release: minor version at the end of every month for new features.
* Major version release is not included in this schedule for breaking change and new features.

---

- 🌟 `configure`: Add global configuration new properties.
- 🌟 `<pro>Modal`: Modal and internal injection modal object add `update` methods.
- 🌟 `<pro>Modal`: Added `okProps`, `cancelProps`, `okFirst`, `border` attribute.
- 🌟 `<pro>DataSet.Field`: Add `requestTransform` & `responseTransform` input property.
- 🌟 `message`: Added `placement` config.
- 💄 `Password`: Change to reveal password by clicking.
- 💄 `Input`: Update the style.
- 💄 `DatePicker`: Update the style.
- 💄 `Select`: Update the style.
- 💄 `<pro>Form`: Optimize rowSpan and colSpan.
- 💄 `<pro>DataSet`: The return value of the query and submit events is false which can prevent queries and commits.
- 💄 `<pro>Popup`: upgrade the `z-index` style.
- 💄 `SelectBox`: Update the style(with 'floatLabel' layout).
- 💄 `TextArea`: Update the style.
- 🐞 `<pro>FormField`: Fix the problem when the label is ReactNode.

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
- 🌟 The default ant prefix is changed to c7n. To use the ant prefix, please [Modify the topic variable @c7n-prefix] (https://choerodon.github.io/choerodon-ui/docs/react/customize-theme) And use [global configuration] (https://choerodon.github.io/choerodon-ui/components/configure).

## 0.5.7

`2019-04-26`

- 🐞 `Icon`: Fix icon size issues.

## 0.5.6

`2019-04-25`

- 🌟 `Icon`:  Add new icons.

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

- 💄 `Table`:  The confirmation button for the filter in the repair table is fixed at the bottom of the selection box and the style is overwritten.
- 🌟 `Sidebar`: add `alwaysCanCancel`.

## 0.5.1

`2019-02-19`

- 💄 `Form.Item`:  The suffix icon is not hidden when Form.Item is verified as error.
- 💄 `Table`:  Table filter does not clear after blur.
- 💄 `Table`:  Table filter clear icon is displayed when there is content.
- 💄 `Table`:  The confirmation button filtered in the Table is fixed at the bottom of the selection box.
- 🌟 `Icon`: Add new icons.

## 0.5.0

`2019-01-10`

- Change the source of the icon font file to change it from the npm library and package it locally.
- 💄 `IconSelect`:  Optimize IconSelect, the icon is larger, and only the common icons are retained.
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
- 💄 `Table`:  Adjust the position of Popup.

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
