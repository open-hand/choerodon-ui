---
title: API
---

| Property | Description                                                      | Type                            | Default   |
| -------- | ---------------------------------------------------------------- | ------------------------------- | --------- |
| icon     | the `Icon` type for an icon avatar, see `Icon` Component         | string                          | -         |
| shape    | the shape of avatar                                              | `circle` \| `square`            | `circle`  |
| size     | the size of the avatar                                           | `large` \| `small` \| `default` | `default` |
| src      | the address of the image for an image avatar                     | string                          | -         |
| alt      | This attribute defines the alternative text describing the image | string                          | -         |

### Avatar.Group (1.5.6)

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| maxCount | Maximum number of avatars displayed | number | - |
| maxPopoverPlacement | Extra head image bubble pop-up position | `top` \| `bottom` | `top` |
| maxPopoverTrigger | Set the trigger mode of redundant avatar Popover | `hover` \| `focus` \| `click` | `hover` |
| maxStyle | Extra head style | CSSProperties | - |
| size | Set the size of the Avatar | Enum{ 'large', 'small', 'default' } \| number | `default` |
