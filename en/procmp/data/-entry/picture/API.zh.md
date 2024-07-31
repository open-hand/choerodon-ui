---
title: API
---

| 属性 | 说明 | 类型 | 默认值 | 版本 |
| --- | --- | --- | --- | --- |
| width | 宽度 | number |  |  |
| height | 高度 | number |  |  |
| src | 路径 | string |  |  |
| border | 边框 | boolean |  |  |
| block | 块级图片 | boolean | true |  |
| lazy | 懒加载 | boolean |  |  |
| modalProps | 图片预览弹窗属性，详情见[ModalProps](/zh/procmp/feedback/modal) | ModalProps |  | 1.6.2 |
| preview | 可预览 | boolean | true |  |
| previewUrl | 预览时的路径， 默认为src | string |  |  |
| downloadUrl | 预览时的下载路径 | string \| Function |  | 1.5.1 |
| previewTarget | 预览方式，若设置则通过 a 标签来预览， 默认是弹窗预览 | string |  |  |
| index | 序号, 配合[Picture.Provider](#pictureprovider)进行组预览 | number |  |  |
| status | 状态 | 'empty' \| 'loaded' \| 'error' \| 'loading' |  |  |
| objectFit | 填充方式, [ObjectFit](#objectfit) | ObjectFit | 'fill' |  |
| objectPosition | 指定图片在容器中的位置。 | 'top' \| 'right' \| 'bottom' \| 'left' \| 'center' \| string | 'center' |  |
| sources | 根据媒体查询显示不同的图片，IE 不支持，[Source](#source) | Source[] |   |  |
| children | 代替图片渲染 | ReactNode |   |  |

### Picture.Provider

图片组预览提供者

| 属性 | 说明 | 类型 | 默认值 | 版本 |
| --- | --- | --- | --- | --- |
| modalProps | 图片预览弹窗属性，详情见[ModalProps](/zh/procmp/feedback/modal) | ModalProps |  | 1.6.2 |

### Picture.Context

图片组预览上下文

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| preview(index) | 打开预览 | Function |  |

### ObjectFit

| 属性 | 说明  | 
| --- | --- | 
| fill | 不保证保持原有的比例，内容拉伸填充整个内容容器。 | 
| contain | 保持原有尺寸比例。内容被缩放。 | 
| cover | 保持原有尺寸比例。但部分内容可能被剪切。 | 
| none | 保留原有元素内容的长度和宽度，也就是说内容不会被重置。 | 
| scale-down | 保持原有尺寸比例。内容的尺寸与 none 或 contain 中的一个相同，取决于它们两个之间谁得到的对象尺寸会更小一些。 | 

### Source

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| media | 媒体查询， 如`(min-width: 800)` | string |  |
| srcset | 图片路径， 当媒体查询匹配时显示 | string |  |
