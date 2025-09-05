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
| hoverShowPointer | Tag 组件 hover 时是否显示小手样式 | boolean | - |

### Tag.CheckableTag

| Property | Description | Type | Default |
| -------- | ----------- | ---- | ------- |
| checked | Checked status of Tag | boolean | `false` |
| onChange | Callback executed when Tag is checked/unchecked | (checked) => void | - |
