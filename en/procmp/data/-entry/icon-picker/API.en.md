---
title: API
---

| Property | Description | Type |
|-----------|------------------------------------------|------------|
| pageSize | Control the number of icons displayed per page | number  |
| customFontName | Configure custom icon font name | string |
| icons | Configure the selectable icons list | { [key: string]: string[]; } \| string[]|  |

For more properties, please refer to [TriggerField](/en/procmp/abstract/trigger-field/#TriggerField).

### CustomFontName Property Description

* Requirement: Allow users to customize font libraries for project-specific icon configurations.

* Steps:
    1. First configure custom third-party icons according to icon configuration.
    2. Configure required icons in configure, or wrap icons into a project common component (recommended) using string arrays and categories; after configuration, you can select and use them.
    3. Configure the corresponding customFontName to enable custom project icon selection.

### Custom Icon Example Code

```
// Component individual configuration:
// Configure as an array, each item represents an icon. The following means there is only one icon named 'clubs' in IconPicker, and the dropdown panel will not have Tabs for classification.
<IconPicker icons={['clubs']} customFontName="c7ntest1" />

// Configure as key-value pairs, each pair represents an icon group; the key is the group name and the value is the icon set. The dropdown panel will use Tabs to classify icons.
<IconPicker icons={{ group1: ['icon1-1', 'icon1-2'], group2: ['icon2-1', 'icon2-2'] }} customFontName="c7ntest1" />

// Recommended to maintain as an icon library
import customIcons from 'customIcons';
<IconPicker icons={customIcons} customFontName="c7ntest1" />

// Global configuration
import c7nIcons from 'choerodon-ui-font';
import customIcons from 'customIcons';
configure({ icons: { ...c7nIcons, ...customIcons } });

// View globally applied icons as follows
import { getConfig } from 'choerodon-ui';
console.log('Global Icons:', getConfig('icons'));
```

### Notes

1. Whether global or component configuration, icons data format can be { [key: string]: string[]; } | string[].

2. Don’t forget to import the corresponding style files when configuring new icons.

3. New global configuration will override the default configuration; don’t forget to include default icons (choerodon-ui-font).
