---
title: API
---


| 属性 | 说明 | 类型 | 默认值 | 版本 |
| --- | --- | --- | --- | --- |
| accept | 接受上传的文件类型 [input accept Attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#attr-accept) | string[] |  | |
| data | 上传所需参数 | object |  | |
| headers | 设置上传的请求头部，IE10 以上有效 | object |  | |
| height | Attachment.Dragger的高度设置 | number |  | |
| multiple | 是否支持多选，IE10 以上有效 | boolean | true | |
| withCredentials | 上传请求时是否携带 cookie | boolean | false | |
| listType | 上传列表的内建样式，支持三种基本样式 text \| picture 和 picture-card | string | text | |
| viewMode | 上传列表的显示模式，支持三种基本样式 none, list 和 popup | string | list | |
| sortable | 是否可排序, 只读模式下不可拖拽 | boolean | true | |
| fileKey | 上传文件的参数名 | string | [attachment.defaultFileKey](/zh/procmp/configure/configure#attachmentconfig) | |
| fileSize | 上传文件的大小限制, 单位 `B` | number | [attachment.defaultFileSize](/zh/procmp/configure/configure#attachmentconfig) | |
| useChunk | 是否开启分片上传 | boolean |  | 1.5.2 |
| chunkSize | 分片大小 | number | [attachment.defaultChunkSize](/zh/procmp/configure/configure#attachmentconfig) | 1.5.2 |
| chunkThreads | 分片上传并发数 | number | [attachment.defaultChunkThreads](/zh/procmp/configure/configure#attachmentconfig) | 1.5.2 |
| pictureWidth | 图片尺寸， 只适用于 listType 为 picture 和 picture-card | number |  | |
| count | 自定义附件数量 | number |  | |
| max | 同时上传文件的最大数量, `0` 表示无限制(设置 `multiple` 为 `false` 后, `max` 无效) | number |  | |
| showHistory | 可显示操作历史记录 | boolean |  | |
| listLimit | 上传列表最大显示数量，只适用于只读模式 | number |  | |
| downloadAll | 是否显示全部下载按钮，只适用于只读模式， 必须配置[attachment.getDownloadAllUrl](/zh/procmp/configure/configure#attachmentconfig) | boolean \| ButtonProps | true | |
| bucketName | 附件上传的桶名 | string |  | |
| bucketDirectory | 附件上传的桶目录 | string |  | |
| storageCode | 附件存储编码 | string |  | |
| template | 附件模板 | { bucketName?: string, bucketDirectory?: string, storageCode?:string, attachmentUUID: string, isPublic?: boolean } |  | 1.5.5 |
| showSize | 显示文件大小信息 | boolean | true | 1.5.3 |
| previewTarget | 预览链接跳转对象， 如要在iframe内预览， 可给 iframe 指定 name={previewTarget} | string | 'attachment-preview'  | 1.5.1 |
| isPublic | 是否是公共的， [attachment](/zh/procmp/configure/configure#attachmentconfig)配置中相关钩子会使用该属性 | boolean | | 1.5.0 |
| attachments | 附件列表 | (AttachmentFile \| FileLike)[] |  | |
| showValidation | 校验信息展示方式 | newLine \| tooltip | viewMode == popup ? tooltip : newLine | |
| getUUID | 获取 uuid | () => Promise<string> \| string | [attachment.getAttachmentUUID](/zh/procmp/configure/#Attachment) | 1.5.3 |
| onAttachmentsChange | 附件列表变更事件 | (AttachmentFile[]) => void |  | |
| beforeUpload | 上传文件之前的钩子，参数为上传的文件，可对文件在上传之前进行校验操作若返回 false 则停止上传并从列表充删除。支持返回一个 Promise 对象，Promise 对象 reject 或 resolve(false) 时则停止上传，resolve 时开始上传。 | (attachment: AttachmentFile, list: AttachmentFile[]) => (boolean \| Promise) | - | |
| onUploadProgress | 上传进度变化的回调 | (percent: number, attachment: AttachmentFile) => void | | |
| onUploadSuccess | 上传成功的回调 | (response: any, attachment: AttachmentFile) => void |  | |
| onUploadError | 上传出错的回调 | (error: Error, attachment: AttachmentFile) => void |  | | |
| onRemove | 删除文件回调，用于发送删除请求, 返回 false 或抛出异常将中止删除 | ({ attachment: AttachmentFile, bucketName?: string, bucketDirectory?: string, storageCode?:string, attachmentUUID: string, isPublic?: boolean }, multiple: boolean) => boolean | | |

更多属性请参考 [FormField](/zh/procmp/abstract/field#formfield) 和 [Button](/zh/procmp/general/button#API)。

附件对象参考 [AttachmentFile](/zh/procmp/dataset/dataset#attachmentfile)

全局配置参考 [attachment](/zh/procmp/configure/configure#attachmentconfig)

### Attachment.Group

> 1.5.0 版本新增组件。

附件组, 属性如下:

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| viewMode | 上传列表的显示模式，可选  list \| popup | string | popup |
| text | 按钮文字 | ReactNode |  |
| count | 自定义附件数量, 未设置时会自动获取组内的附件数量 | number |  |

更多属性请参考 [Button](/zh/procmp/general/button#API)。

### Attachment.Dragger

> 1.5.2 版本新增组件。
