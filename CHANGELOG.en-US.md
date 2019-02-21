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
## 0.5.1

`2018-02-19`

- 💄 `Form.Item`:  The suffix icon is not hidden when Form.Item is verified as error.
- 💄 `Table`:  Table filter does not clear after blur.
- 💄 `Table`:  Table filter clear icon is displayed when there is content.
- 💄 `Table`:  The confirmation button filtered in the Table is fixed at the bottom of the selection box.
- 🌟 `Icon`: Add new icons.

## 0.5.0

`2018-01-10`

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
