---
title: API
---

| 参数      | 说明                                     | 类型        |
|-----------|------------------------------------------|------------|
| pageSize | 控制icon页面展示数量 | number  |
| customFontName | 控制icon的自定义图标配置 | string |
| icons | 配置需要的icons选择列表 | { [key: string]: string[]; } \| string[]|  |

更多属性请参考 [TriggerField](/zh/procmp/abstract/trigger-field/#TriggerField)。

### customFontName 属性说明

* 解决需求：可以用户客制化字体库进行项目专属的 icon 配置。

* 使用步骤：
    1. 先按照 icon 配置进行第三方自定义的 icon 配置
    2. 在 configure 配置需要的 icons 或者 用 icons 封装成项目公共组件（推荐） 字符串数组以及分类，完成配置后可以自定义选择使用
    3. 配置对应的 customFontName 就可以实现自定义项目 icon 选择

### 自定义图标示例代码

```
// 组件单独配置：
// 配置成数组，每一项则代表一个图标，如下代表 IconPicker 中只有一个叫 clubs 的图标，并且下拉面板中不会有 Tabs 进行分类
<IconPicker icons={['clubs']} customFontName="c7ntest1" />

// 配置成键值对，每一个键值对代表一个图标分组，键为分组名，值为图标集合，下拉面板中会使用 Tabs 对图标进行相应分类
<IconPicker icons={{ group1: ['icon1-1', 'icon1-2'], group2: ['icon2-1', 'icon2-2'] }} customFontName="c7ntest1" />

// 建议维护成图标库
import customIcons from 'customIcons';
<IconPicker icons={customIcons} customFontName="c7ntest1" />

// 全局配置
import c7nIcons from 'choerodon-ui-font';
import customIcons from 'customIcons';
configure({ icons: { ...c7nIcons, ...customIcons } });

// 全局应用的图标可以这样查看
import { getConfig } from 'choerodon-ui';
console.log('全局图标：', getConfig('icons'));
```

### 注意事项

1. 不管是全局配置还是组件配置，icons 数据格式满足 { [key: string]: string[]; } | string[] 类型都可以；

2. 配置新图标时对应的样式文件不要忘记引入；

3. 新的全局配置会覆盖默认配置，不要忘记将默认图标（choerodon-ui-font）加入其中。
