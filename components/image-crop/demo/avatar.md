---
order: 1
title:
  zh-CN: 头像切换
  en-US: avatar change
---

## zh-CN

头像切换，进行url配置就可以实现常用的头像切换。

## en-US

just only to configure the url you can upload the avatar .

```jsx
import { ImageCrop, Avatar } from 'choerodon-ui';
import { useState, useCallback } from 'react';

const AvatarUploader = ImageCrop.AvatarUploader

const  Demo = () => {
    const [visable,setVisiable] = useState(false)

    const hanleClick = useCallback(()=>{
        setVisiable(true)
    },[])

    const hanleOk = useCallback(() => {
        setVisiable(false);
    },[])

    const hanleCancel = useCallback(() => {
        setVisiable(false);
        console.log('close')
    },[])

    return (
        <>
            <Avatar onClick={hanleClick} style={{ backgroundColor: '#87d068' }} >我绿了</Avatar>
            <AvatarUploader onUploadOk={hanleOk} onClose={hanleCancel} uploadUrl='https://www.mocky.io/v2/5cc8019d300000980a055e76'  visible={visable} />
        </>
    )
}

ReactDOM.render(
  <Demo />,
  mountNode,
);
```
