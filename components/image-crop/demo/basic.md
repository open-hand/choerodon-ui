---
order: 1
title:
  zh-CN: 基础裁剪
  en-US: Basic 
---

## zh-CN

从堆叠到水平排列。

使用单一的一组 `Row` 和 `Col` 栅格组件，就可以创建一个基本的栅格系统，所有列（Col）必须放在 `Row` 内。

## en-US

From the stack to the horizontal arrangement.

You can create a basic grid system by using a single set of `Row` and `Col` grid assembly, all of the columns (Col) must be placed in `Row`.

```jsx
import { ImageCrop,Button } from 'choerodon-ui';
import { useState, useCallback } from 'react';

const  Demo = () => {
    const [visable,setVisiable] = useState(false)

    const hanleClick = useCallback(()=>{
        setVisiable(true)
    },[])

    const hanleOk = useCallback(({url,blob}) => {
        console.log(url,blob); 
        setVisiable(false);
    },[])

    const hanleCancel = useCallback(() => {
        setVisiable(false);
        console.log('close')
    },[])

    return (
        <>
            <Button onClick={hanleClick} funcType="raised">查看裁剪</Button>
            <ImageCrop modalVisible={visable} onOk={hanleOk} onCancel={hanleCancel} on src ='https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png' rotate zoom grid aspect={1/1} aspectControl />
        </>
    )
}

ReactDOM.render(
  <Demo />,
  mountNode,
);
```
