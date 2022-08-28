---
title: API
---

```html
<Card title="Card title">Card content</Card>
```

### Card

| Property | Description | Type | Default |
| -------- | ----------- | ---- | ------- |
| actions | The action list, shows at the bottom of the Card. | Array<ReactNode> | - |
| bodyStyle | Inline style to apply to the card content | object | - |
| bordered | Toggles rendering of the border around the card | boolean | `true` |
| cover | Card cover | ReactNode | - |
| extra | Content to render in the top-right corner of the card | string\|ReactNode | - |
| hoverable | Lift up when hovering card | boolean | false |
| loading | Shows a loading indicator while the contents of the card are being fetched | boolean | false |
| tabList | List of TabPane's head. | Array&lt;{key: string, tab: ReactNode}> | - |
| activeTabKey | Current TabPane's key | string | - |
| defaultActiveTabKey | Initial active TabPane's key, if `activeTabKey` is not set. | string | - |
| title | Card title | string\|ReactNode | - |
| type | Card style type, can be set to `inner` or not set | string | - |
| selected | Toggles selected | boolean | false |
| cornerPlacement | Selected corner mark position | `bottomRight` \| `bottomLeft` \| `topLeft` \| `topRight` | bottomRight |
| onSelectChange | Select the callback of the event and click the card content area to trigger | (selected) => void | - |
| onTabChange | Callback when tab is switched | (key) => void | - |
| onHeadClick | Callback while Click Card head | React.MouseEventHandler<any> | - |

### Card.Grid

| Property | Description | Type | Default |
| -------- | ----------- | ---- | ------- |
| className | className of container | string | - |
| style | style object of container | object | - |
| selected | Toggles selected | boolean | false |
| cornerPlacement | Selected corner mark position | `bottomRight` \| `bottomLeft` \| `topLeft` \| `topRight` | bottomRight |
| onSelectChange | Callback for selected event | (selected) => void | - |

### Card.Meta

| Property | Description | Type | Default |
| -------- | ----------- | ---- | ------- |
| avatar | avatar or icon | ReactNode | - |
| className | className of container | string | - |
| description | description content | ReactNode | - |
| style | style object of container | object | - |
| title | title content | ReactNode | - |
