---
order: 3
title:
  zh-CN: 设置二维码图片
  en-US: Setting Image
---

## zh-CN

设置二维码图片

## en-US

 Setting Image

```jsx
import { QRBarCode } from 'choerodon-ui';


ReactDOM.render(
    <QRBarCode value="我是一个有图片的二维码" imageSettings={{ src:"https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png", height:30, width:30, excavate:true}} />, mountNode);
```
