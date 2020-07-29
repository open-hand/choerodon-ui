---
order: 0
title:
  zh-CN: basic
  en-US: 基础
---

## zh-CN

基础

## en-US

basic

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
    }, [])

    const hanleCancel = useCallback(() => {
        setVisiable(false);
        console.log('close')
    }, [])

    return (
        <>
            <Button onClick={hanleClick} funcType="raised">裁剪并下载</Button>
            <ImageCrop modalVisible={visable} onOk={hanleOk} onCancel={hanleCancel} on src='https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png' rotate zoom grid aspect={12 / 13} aspectControl />
        </>
    )
}

ReactDOM.render(
  <Demo />,
  mountNode,
);
```
