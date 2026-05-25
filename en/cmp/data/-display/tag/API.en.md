---
title: API
---

### Tag

| Property | Description | Type | Default |
| -------- | ----------- | ---- | ------- |
| afterClose | Callback executed when close animation is completed | () => void | - |
| closable | Whether Tag can be closed | boolean | `false` |
| color | Color of the Tag | string | - |
| onClose | Callback executed when tag is closed | (e) => void | - |
| hoverShowPointer | Whether the cursor changes to a hand style when hovering over the Tag component | boolean | - |

### Tag.CheckableTag

| Property | Description | Type | Default |
| -------- | ----------- | ---- | ------- |
| checked | Checked status of Tag | boolean | `false` |
| onChange | Callback executed when Tag is checked/unchecked | (checked) => void | - |
