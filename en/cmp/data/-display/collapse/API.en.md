---
title: API
---

### Collapse

| Property | Description | Type | Default | Version |
| -------- | ----------- | ---- | ------- | ------- |
| activeKey | Key of the active panel | string\[]\|string | No default value. In `accordion` mode, it's the key of the first panel. | |
| defaultActiveKey | Key of the initial active panel | string | - | |
| onChange | Callback function executed when active panel is changed | Function | - | |
| bordered | Toggles rendering of the border around the collapse block | boolean | true | |
| accordion | If true, Collapse renders as Accordion	 | boolean | false | |
| expandIcon | Allow to customize collapse icon | (panelProps) => ReactNode \| `text`(Default icon + text) | - | |
| expandIconPosition | Set expand icon position | `left` \| `right` \| `text-right` | `left` | |
| destroyInactivePanel | Destroy Inactive Panel | boolean | false | |
| collapsible | Whether all sub panels are collapsible or specify collapsible trigger area（Use trigger attribute under 1.5.7） | `header` \| `icon` \| `disabled` | | 1.5.7 |
| ghost | Make the collapse borderless and its background transparent | boolean | false |

### Collapse.Panel

| Property | Description | Type | Default | Version | 
| -------- | ----------- | ---- | ------- | ------- | 
| disabled | If `true`, panel cannot be opened or closed | boolean | `false` | |
| header | Title of the panel | string\|ReactNode | - | |
| key | Unique key identifying the panel from among its siblings | string | - | |
| showArrow | If `false`, panel will not show arrow icon | boolean | `true` | |
| forceRender | Forced render of content on panel, instead of lazy rending after clicking on header | boolean | `false` ||
| showArrow	| If false, panel will not show arrow icon	| boolean	|  true ||
| extra	| The extra element in the corner | ReactNode | - |	|
| dataSet	| The dataset object will be expanded automatically when the dataset verification fails | DataSet \| DataSet[] |  |1.5.3|	
| collapsible | Whether to collapse or specify a collapsible trigger area, with priority over disabled | `header` \| `icon` \| `disabled` | | 1.5.7 
| hidden | 是否隐藏 | boolean  | false | 1.5.7 |	
