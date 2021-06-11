---
title: API
---

| Param | Description | Type | Default value |
| ----- | ----------- | ---- | ------------- |
| content | Content of the card | ReactNode \| () => ReactNode | - |
| title | Title of the card | ReactNode \| () => ReactNode | - |

Consult [Tooltip's documentation](/zh/cmp/data-display/tooltip/#API) to find more APIs.

## Note

Please ensure that the child node of `Popover` accepts `onMouseEnter`, `onMouseLeave`, `onFocus`, `onClick` events.
