---
title: API
---

| Property | Description | Type | Default | Version |
|-----|-----|-----|------ | ------  |
| defaultValue | Default value | string | #ff0000 | |
| mode | Display mode; options: default \| button | string | default | 1.5.5 |
| preset | Whether to enable preset color palette | boolean | false | 1.5.5 |
| showNoFill      | Whether to show the no-fill option | boolean | `true` | 1.6.9 |
| gradientMode    | Color mode: `single` for solid colors, `gradient` for linear and radial gradients. Pass `['single', 'gradient']` to enable switching between both modes | 'single' \| 'gradient' \| ('single' \| 'gradient')[] | `single` | 1.6.9 |

Note: **Setting the ColorPicker component multiple property to true is ineffective; likewise for the DataSet field property multiple.**

For more properties, please refer to [TriggerField](/en/procmp/abstract/trigger-field/#TriggerField).
