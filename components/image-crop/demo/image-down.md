---
order: 2
title:
  zh-CN: 图片裁剪下载
  en-US: dwonload image
---

## zh-CN

图片裁剪下载

## en-US

picture Crop and Download

```jsx
import { ImageCrop, Button } from 'choerodon-ui';
import { useState, useCallback } from 'react';

const Demo = () => {
    const [visable, setVisiable] = useState(false)

    const hanleClick = useCallback(() => {
        setVisiable(true)
    }, [])

    const hanleOk = useCallback(({ url, blob, area }) => {
        console.log(url, blob, area);
        setVisiable(false);
        // 这里是获取到的图片base64编码,这里只是个例子哈，要自行编码图片替换这里才能测试看到效果
        const imgUrl = url;
        // 如果浏览器支持msSaveOrOpenBlob方法（也就是使用IE浏览器的时候），那么调用该方法去下载图片
        if (window.navigator.msSaveOrOpenBlob) {
            const bstr = atob(imgUrl.split(",")[1]);
            let n = bstr.length;
            const u8arr = new Uint8Array(n);
            while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
            }
            // eslint-disable-next-line no-shadow
            const blob = new Blob([u8arr]);
            window.navigator.msSaveOrOpenBlob(blob, "chart-download.png");
        } else {
            // 这里就按照chrome等新版浏览器来处理
            const a = document.createElement("a");
            a.href = imgUrl;
            a.setAttribute("download", "chart-download");
            a.click();
        }
    }, [])

    const hanleCancel = useCallback(() => {
        setVisiable(false);
        console.log('close')
    }, [])

    return (
        <>
            <Button onClick={hanleClick} funcType="raised">裁剪并下载</Button>
            <ImageCrop
                modalVisible={visable}
                onOk={hanleOk}
                onCancel={hanleCancel}
                src='https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png'
                rotate
                zoom
                grid
                aspect={12 / 13}
            />
        </>
    )
}

ReactDOM.render(
  <Demo />,
  mountNode,
);
```
