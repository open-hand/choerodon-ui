---
title: API
---

### IconPicker

图标选择框

| 参数      | 说明                                     | 类型        |默认值 |
|-----------|------------------------------------------|------------|--------|
| pageSize | 控制icon页面展示数量 | number  |  |
| customFontName | 控制icon的自定义图标配置 | string |  |
| icons | 配置需要的icons选择列表 | { [key: string]: string[]; } \| string[]|  |  |

### customFontName 属性说明

* 解决需求：可以用户客制化字体库进行项目专属的icon配置。

* 使用步骤：
    1. 先按照 icon 配置进行第三方自定义的icon配置
    2. 在 configure 配置需要的icons 或者 用icons封装成项目公共组件（推荐） 字符串数组以及分类,完成配置后可以自定义选择使用
    3. 配置对应的 customFontName 就可以实现自定义项目的icon选择了

```
// 示例代码
<IconPicker icons={['clubs']} customFontName="c7ntest1" />
```

更多属性请参考 [TriggerField](/zh/procmp/abstract/trigger-field/#TriggerField)。
