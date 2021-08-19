---
category: Pro Components
subtitle: 附件
type: Data Entry
title: Attachment
---

附件上传和展示

## 何时使用

需要上传文件时。

## API

### Attachment
 
属性说明如下：

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| accept | 接受上传的文件类型 [input accept Attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#attr-accept) | string[] |  |
| data | 上传所需参数 | object |  |
| headers | 设置上传的请求头部，IE10 以上有效 | object |  |
| multiple | 是否支持多选，IE10 以上有效 | boolean | true |
| withCredentials | 上传请求时是否携带 cookie | boolean | false |
| listType | 上传列表的内建样式，支持三种基本样式 `text`, `picture` 和 `picture-card` | string | 'text' |
| viewMode | 上传列表的显示模式，支持三种基本样式 `none`, `list` 和 `popup` | string | 'list' |
| sortable | 是否可排序, 只读模式下不可拖拽 | boolean | true |
| fileKey | 上传文件的参数名 | string | [attachment.defaultFileKey](/component/configure/#Attachment) |
| fileSize | 上传文件的大小限制, 单位 `B` | number | [attachment.defaultFileSize](/component/configure/#Attachment) |
| pictureWidth | 图片尺寸， 只适用于 listType 为 picture 和 picture-card | number |  |
| count | 自定义附件数量 | number |  |
| max | 同时上传文件的最大数量, `0` 表示无限制 | number |  |
| listLimit | 上传列表最大显示数量，只适用于只读模式 | number |  |
| downloadAll | 是否显示全部下载按钮，只适用于只读模式， 必须配置[attachment.getDownloadAllUrl](/component/configure/#Attachment) | boolean \| ButtonProps | true |
| beforeUpload | 上传文件之前的钩子，参数为上传的文件，可对文件在上传之前进行校验操作若返回 false 则停止上传并从列表充删除。支持返回一个 Promise 对象，Promise 对象 reject 或 resolve(false) 时则停止上传，resolve 时开始上传。 | (attachment: AttachmentFile, list: AttachmentFile[]) => (boolean \| Promise) | - |
| onUploadProgress | 上传进度变化的回调 | (percent: number, attachment: AttachmentFile) => void | 无 |
| onUploadSuccess | 上传成功的回调 | (response: any, attachment: AttachmentFile) => void | 无 |
| onUploadError | 上传出错的回调 | (error: Error, attachment: AttachmentFile) => void | 无 |

更多属性请参考 [FormField](/components-pro/field/#FormField)。
附件对象参考 [AttachmentFile](/components-pro/data-set/#AttachmentFile)
全局配置参考 [attachment](/component/configure/#Attachment)
