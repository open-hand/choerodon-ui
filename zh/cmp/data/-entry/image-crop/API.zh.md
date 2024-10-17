---
title: API
---

| 属性名 | 说明 | 类型 | 默认值 |
| ----------- | -------------------- | ------------ | ---------------------------------------------- |
| aspect      | 裁切区域宽高比， width / height                |  number              |  1 / 1       |
| shape       | 裁切区域形状， 'rect'  或  'round'             |  string              |  'rect'      |
| grid        | 显示裁切区域网格（九宫格）                     |  boolean             |  false       |
| zoom        | 启用图片缩放                                   |  boolean             |  true        |
| rotate      | 启用图片旋转                                   |  boolean             |  false       |
| rotateStep  | 每次旋转角度                                   |  number              | 90           |
| beforeCrop  | 弹窗打开前调用，若返回  false ，弹框将不会打开 |  function            |              |
| modalTitle  | 弹窗标题                                       |  string              |  '编辑图片'  |
| modalWidth  | 弹窗宽度，像素值或百分比                       |  number  \|  string  |  520         |
| modalOk     | 弹窗确定按钮文字                               |  string              |  '确定'      |
| modalCancel | 弹窗取消按钮文字                               |  string              |  '取消'      |
| onCancel   | 取消模态框触发 |  onCancel?: () => void           |                |
| onOk  | 点击模态框确定触发 |  { url: string, blob: Blob,area:Area }=> void          |                |
| modalVisible   |  控制模态框的展示 |  boolean          |  ture               |
| serverCrop   | 服务端裁剪 |  boolean          |  false            |
| onCropComplete   | 裁剪完毕触发方法 |({ url: string, blob: Blob, area: Area }) => void        |            |
| cropContent   | 修改裁剪编辑位置的渲染 | (crop: ReactElement<EasyCropProps>) => React.ReactElement<any>      |            |
| modalProps   | modal 的属性配置不可以更改onOk，onCancel | ModalProps     |            |

### ImgCrop.AvatarUploader 

这个组件可以完成对于头像上传的裁剪的场景需求，主要是增加预览效果集成

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| visible | 上传图片模态框的显示状态| boolean | false |
| onClose | 模态框关闭时的回调|   (visible: boolean) => void;  |   |
| onUploadOk | 成功上传时的回调|  (res: any) => void;  |   |
| uploadUrl | 上传链接| string |   |
| uploadFaild | 上传失败|  () => void;  |   |
| uploadError | 上传服务器错误| (error: any) => void; |   |
| handleUpload | 点击上传|   (area: AvatarArea) => void;    |   |
| cropComplete | 裁剪完成|  (imageState: any) => void;   |   |
| title | 上传头像标题|  string \| React.ReactElement;   |   |
| previewTitle | 头像预览标题|  string \| React.ReactElement;  |   |
| reloadTitle | 重新上传标题|  string \| React.ReactElement;  |   |
| uploadProps | 上传配置|  UploadProps  |   |
| modalProps | 模态框的配置|  ModalProps  |   |
| limit | 限制内容| boolean |  {type: 'jpeg,png,jpg',size: 1024,}  |
| previewList | 定义预览的大小| number[] | \[80, 48, 34\] |
| editorWidth | 裁剪容器宽度| number | 380 |
| editorHeight | 裁剪容器高度| number | 380 |
| rectSize | 裁剪区域大小| number | 280 |
| axiosConfig | axios 上传配置 | AxiosRequestConfig |   |
