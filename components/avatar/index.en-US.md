---
category: Components
type: Data Display
title: Avatar
---

Avatars can be used to represent people or objects. It supports images, `Icon`s, or letters.

## API

| Property | Description | Type | Default |
| -------- | ----------- | ---- | ------- |
| icon | the `Icon` type for an icon avatar, see `Icon` Component | string | - |
| shape | the shape of avatar | `circle` \| `square` | `circle` |
| size | the size of the avatar | `large` \| `small` \| `default` | `default` |
| src | the address of the image for an image avatar | string | - |
| alt | This attribute defines the alternative text describing the image | string | - |

### Avatar.Group (1.5.6)

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| maxCount | Max avatars to show | number | - |
| maxPopoverPlacement | The placement of excess avatar Popover | `top` \| `bottom` | `top` |
| maxPopoverTrigger | Set the trigger of excess avatar Popover | `hover` \| `focus` \| `click` | `hover` |
| maxStyle | The style of excess avatar style | CSSProperties | - |
| size | The size of the avatar | `large` \| `small` \| `default` \| number | `default` |
