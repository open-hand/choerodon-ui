---
category: Components
type: Data Display
title: Collapse
cols: 1
---

A content area which can be collapsed and expanded.

## When To Use

- Can be used to group or hide complex regions to keep the page clean.
- `Accordion` is a special kind of `Collapse`, which allows only one panel to be expanded at a time.

## API

### Collapse

| Property | Description | Type | Default |
| -------- | ----------- | ---- | ------- |
| activeKey | Key of the active panel | string\[]\|string | No default value. In `accordion` mode, it's the key of the first panel. |
| defaultActiveKey | Key of the initial active panel | string | - |
| onChange | Callback function executed when active panel is changed | Function | - |
| bordered | Toggles rendering of the border around the collapse block | boolean | true |
| accordion | If true, Collapse renders as Accordion	 | boolean | false |
| expandIcon | Allow to customize collapse icon | (panelProps) => ReactNode \| `text`(Default icon + text) | - |
| expandIconPosition | Set expand icon position | `left` \| `right` \| `text-right` | `left` |
| destroyInactivePanel | Destroy Inactive Panel | boolean | false |
| ghost | Make the collapse borderless and its background transparent | boolean | false |
| collapsible(1.5.7) | Specify whether the panels of children be collapsible or the trigger area of collapsible | `header` \| `icon` \| `disabled` | |

### Collapse.Panel

| Property | Description | Type | Default |
| -------- | ----------- | ---- | ------- |
| disabled | If `true`, panel cannot be opened or closed | boolean | `false` |
| header | Title of the panel | string\|ReactNode | - |
| key | Unique key identifying the panel from among its siblings | string | - |
| showArrow | If `false`, panel will not show arrow icon | boolean | `true` |
| forceRender | Forced render of content on panel, instead of lazy rending after clicking on header | boolean | `false` |
| showArrow	| If false, panel will not show arrow icon	| boolean	|  true |
| extra	| The extra element in the corner | ReactNode | - |
| dataSet	| DataSet， The panel will automatically expanded when dataset validation fails | DataSet \| DataSet[] | 无 |
| collapsible(1.5.7) | Specify whether the panel be collapsible or the trigger area of collapsible, Priority is higher than disabled | `header` \| `icon` \| `disabled` | |
| hidden | 是否隐藏 | boolean  | false |
