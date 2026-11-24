---
title: API
---


| Property | Description | Type | Default | Version |
| --- | --- | --- | --- | --- |
| accept | File types accepted for upload [input accept Attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#attr-accept) | string[] |  | |
| data | Upload required parameters | object |  | |
| headers | Set the request header for upload, valid for IE10 and above | object |  | |
| height | Attachment.Dragger height setting | number |  | |
| multiple | Whether to support multiple selection, valid for IE10 and above | boolean | true | |
| directory | Whether to upload folders | boolean | - | |
| withCredentials | Whether to carry cookies when uploading requests | boolean | false | |
| listType | Built-in style of upload list, supports three basic styles text \| picture and picture-card | string | text | |
| viewMode | Display mode of upload list, supports three basic styles none, list and popup | string | list | |
| sortable | Whether it is sortable, cannot be dragged in read-only mode | boolean | true | |
| fileKey | Upload file parameter name | string | [attachment.defaultFileKey](/en/procmp/configure/configure#attachmentconfig) | |
| fileSize | Upload file size limit, unit `B` | number | [attachment.defaultFileSize](/en/procmp/configure/configure#attachmentconfig) | |
| useChunk | Whether to enable chunked upload | boolean |  | 1.5.2 |
| chunkSize | Chunk size | number | [attachment.defaultChunkSize](/en/procmp/configure/configure#attachmentconfig) | 1.5.2 |
| chunkThreads | Chunk upload concurrency | number | [attachment.defaultChunkThreads](/en/procmp/configure/configure#attachmentconfig) | 1.5.2 |
| pictureWidth | Image size, only applicable to listType as picture and picture-card | number |  | |
| count | Custom attachment count | number |  | |
| max | Maximum number of files uploaded at the same time, `0` means unlimited (after setting `multiple` to `false`, `max` is invalid) | number |  | |
| showHistory | Can display operation history records | boolean |  | |
| listLimit | Maximum number of upload lists displayed, only applicable to read-only mode | number |  | |
| downloadAll | Whether to display the download all button, only applicable to read-only mode, must configure [attachment.getDownloadAllUrl](/en/procmp/configure/configure#attachmentconfig) | boolean \| ButtonProps | true | |
| bucketName | Attachment upload bucket name | string |  | |
| bucketDirectory | Attachment upload bucket directory | string |  | |
| storageCode | Attachment storage code | string |  | |
| template | Attachment template | { bucketName?: string, bucketDirectory?: string, storageCode?:string, attachmentUUID: string, isPublic?: boolean } |  | 1.5.5 |
| showSize | Display file size information | boolean | true | 1.5.3 |
| previewTarget | Preview link jump object, if you want to preview in iframe, you can specify name={previewTarget} for iframe | string | 'attachment-preview'  | 1.5.1 |
| isPublic | Whether it is public, [attachment](/en/procmp/configure/configure#attachmentconfig) related hooks in configuration will use this property | boolean | | 1.5.0 |
| attachments | Attachment list | (AttachmentFile \| FileLike)[] |  | |
| showValidation | Validation information display method | newLine \| tooltip | viewMode == popup ? tooltip : newLine | |
| getUUID | Get uuid | () => Promise<string> \| string | [attachment.getAttachmentUUID](/en/procmp/configure/#Attachment) | 1.5.3 |
| buttons | Action button array. Built-in names are `preview`, `download`, `remove` and `history`. Use `[name, ButtonProps]` to configure a named button or append a custom Button element. The array merges with the default buttons rather than replacing the entire list | ('preview' \| 'download' \| 'remove' \| 'history' \| [string, ButtonProps] \| ReactElement<ButtonProps>)[] | ['preview', 'download', 'remove'] | 1.6.2; preview: 1.6.9 |
| onAttachmentsChange | Attachment list change event | (AttachmentFile[]) => void |  | |
| beforeUpload | Hook before uploading file, parameter is the uploaded file, can verify the file before uploading, if return false then stop uploading and delete from list. Support returning a Promise object, Promise object reject or resolve(false) then stop uploading, resolve then start uploading. | (attachment: AttachmentFile, list: AttachmentFile[]) => (boolean \| Promise) | - | |
| onUploadProgress | Upload progress change callback | (percent: number, attachment: AttachmentFile) => void | | |
| onUploadSuccess | Upload success callback | (response: any, attachment: AttachmentFile) => void |  | |
| onUploadError | Upload error callback | (error: Error, attachment: AttachmentFile) => void |  | | |
| onRemove | Delete file callback, used to send delete request, return false or throw exception will abort deletion | (attachment: AttachmentFile) => boolean \| void | | |
| onUploadAbort | Callback for upload cancellation. If the input parameter exists, it will cancel the upload of a single file. If it does not exist, it will cancel the upload of all files. | (attachment?: AttachmentFile) => void |  | 1.6.8 |
| getPreviewUrl | Get preview address, default use AttachmentFile.url, return empty then cannot preview. When the return value of the function is (() => string \| Promise< string>), it only supports the case where listType is text | ({ attachment: AttachmentFile, bucketName?: string, bucketDirectory?: string, storageCode?:string, attachmentUUID: string, isPublic?: boolean }) => (string \| (() => string \| Promise< string>) \| undefined) \| Promise<(string \| (() => string \| Promise< string>) \| undefined)>(1.6.8) | | 1.6.3 |
| uploadImmediately | Whether to upload immediately. After closing, you need to manually call the component instance method `upload` to upload | boolean | true | 1.6.8 |
| removeImmediately | Whether to delete immediately, you need to manually call the component instance method `remove` to delete after closing | boolean | true | 1.6.5 |
| onTempRemovedAttachmentsChange | Temporary delete file change callback, valid when `removeImmediately` is false | (tempRemovedAttachments?: AttachmentFile[]) => void |  | 1.6.5 |
| filesLengthLimitNotice | Custom prompt when the number of uploaded files exceeds the limit | (defaultInfo: string) => void | (defaultInfo) => Modal.error(defaultInfo) | 1.6.6 |
| countTextRenderer | Upload button quantity display renderer | (count?: number, max?: number, defaultCountText?: ReactNode) => ReactNode |  | 1.6.6 |
| removeConfirm | Configuration of confirm popover before deletion | boolean \| PopconfirmProps | | 1.6.7 |
| templateDownloadButtonRenderer | Custom download template button, need to fully customize download template related logic after use | () => ReactNode | | 1.6.7 |
| downloadAllMode | Show all download button mode | readOnly \| always | 'readOnly' | 1.6.7 |
| getDownloadAllUrl | Get all download addresses, used as button click event when return value type is function | ({ bucketName?: string, bucketDirectory?: string, storageCode?:string, attachmentUUID: string, isPublic?: boolean }) => string \| Function \| undefined |  | 1.6.7 |
| getDownloadUrl | Get download address, used as button click event when return value type is function, default use AttachmentFile.url | ({ attachment: AttachmentFile, bucketName?: string, bucketDirectory?: string, storageCode?:string, attachmentUUID: string, isPublic?: boolean }) => string \| Function \| undefined | [attachment.getDownloadUrl](/en/procmp/configure/configure#attachmentconfig) | 1.6.7 |
| enableDeleteAll | Turn on delete all function | boolean |  | 1.6.8 |
| onPreview | Callback when file is clicked to preview | (attachment: AttachmentFile) => void |  | 1.6.8 |
| pictureCardShowName | Set whether the `picture-card` type picture displays the file name | boolean |  | 1.6.8 |
| directory | Open the upload folder | boolean |  | 1.6.8 |
| batchMaxFileCount | The maximum number of files in a single batch upload. If exceeded, the user will be prompted whether to continue; continuing uploads only the maximum number of files. Unconfigured or non-positive values impose no limit. | number | [globalConfig.uploadBatchMaxFileCount](/en/procmp/configure/configure) | 1.6.9 |
| onCustomPreview | Custom manual preview behavior that does not affect the acquisition of thumbnail preview URLs | (props: AttachmentFileProps) => void \| Promise<void> | - | 1.6.9 |
| progressThrottle | Whether to throttle the triggering of onUploadProgress. When set to a number greater than 0, throttling is applied based on the time interval; when set to an object type, the step field throttles based on progress steps, and the interval field throttles based on the time interval; when both fields are set, onUploadProgress will be triggered when either condition is met. | number \| { step?: number; interval?: number; } \| false | - | 1.6.9 |
| alwaysShowActions | Set whether the operation buttons remain visible at all times | boolean | [globalConfig.uploadAlwaysShowActions](/en/procmp/configure/configure) | 1.6.9 |

For more properties, please refer to [FormField](/en/procmp/abstract/field#formfield) and [Button](/en/procmp/general/button#API).

Attachment object reference [AttachmentFile](/en/procmp/dataset/dataset#attachmentfile)

Global configuration reference [attachment](/en/procmp/configure/configure#attachmentconfig)

### Attachment.Group

> New component in version 1.5.0.

Attachment group, properties are as follows:

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| viewMode | Display mode of upload list, optional list \| popup | string | popup |
| text | Button text | ReactNode |  |
| count | Custom attachment count, automatically get the number of attachments in the group when not set | number |  |

For more properties, please refer to [Button](/en/procmp/general/button#API).

### Attachment.Dragger

> New component in version 1.5.2.

### Attachment Instance Methods
| Property | Description | Property Name | Return Value Type | Version |
| --- | --- | --- | --- | --- |
| remove | Delete temporarily removed files |  | void | 1.6.5 |
| reset | Restore temporarily removed files |  | void | 1.6.5 |
| abortUpload | Cancel upload. If the parameter is an attachment object, cancel the upload of a single file. If no parameter is passed, cancel the upload of all files. | AttachmentFile \| undefined | void | 1.6.8 |
| upload | Upload temporary files to the backend. You can specify file upload by passing in the attachment parameter, otherwise all temporary files will be uploaded | AttachmentFile \| undefined | void | 1.6.8 |
