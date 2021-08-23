---
order: 5
title:
  zh-CN: 裁剪区域自定义渲染
  en-US: crop edict custom render 
---

## zh-CN

支持在裁剪区域设置想要的渲染样式

## en-US

You can render the crop area what you want.

```jsx
import { ImageCrop, Button, Row, Col, Avatar } from 'choerodon-ui';
import { useState, useCallback } from 'react';

const avatarRender = (src) => {
    const prefix = `c7n-image-crop`;
    const avatarList = [{
        src,
        size: 80,
        icon: "person",
        text: "80×80",
    }, {
        src,
        size: 40,
        icon: "person",
        text: "40×40",
    }, {
        src,
        size: 20,
        icon: "person",
        text: "20×20",
    }]
    return (
        src ? avatarList.map(
            // eslint-disable-next-line react/jsx-key
            itemProps => (
                <Row key={itemProps.text} className={`${prefix}-avatar-row`} type="flex" justify="center" align="top">
                    <Col key="image" span={24} className={`${prefix}-avatar-col`}>
                        <Avatar {...itemProps} />
                    </Col>
                    <Col key="text" span={24} className={`${prefix}-avatar-col`}>
                        <span>{itemProps.text}</span>
                    </Col>
                </Row>
            ),
        ) : null
    )
}

const Demo = () => {
    const [visable, setVisiable] = useState(false);
    const [srcCrop, setSrcCrop] = useState('');

    const handleClick = useCallback(() => {
        setVisiable(true)
    }, [])

    const handleOk = useCallback(({ url, blob }) => {
        console.log(url, blob);
        setVisiable(false);
    }, [])

    const handleCancel = useCallback(() => {
        setVisiable(false);
        console.log('close')
    }, [])

    const handleCropComplete = useCallback(({ url }) => {
        setSrcCrop(url)
    }, [])

    const renderCrop = (Crop) => {
        return (
            <Row className="c7n-image-crop-crop-content" gutter={8}>
                <Col key="crop" span={18} >
                    {Crop}
                </Col>
                <Col className="c7n-image-crop-avatar-content" key="avatar" span={6}>
                    <h5>预览头像</h5>
                    {avatarRender(srcCrop)}
                </Col>
            </Row>
        )
    }

    return (
        <>
            <Button onClick={handleClick} funcType="raised">查看头像</Button>
            <ImageCrop
                modalWidth={800}
                cropContent={renderCrop}
                onCropComplete={handleCropComplete}
                modalVisible={visable}
                onOk={handleOk}
                onCancel={handleCancel}
                src='https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png'
                rotate
                zoom
                grid
                aspect={1 / 1}
            />
        </>
    )
}

ReactDOM.render(
  <Demo />,
  mountNode,
);
```

````css
.c7n-image-crop-avatar-content h5 {
    margin-bottom: 24px;
    font-size: 18px;
    text-align: center;
}

.c7n-image-crop-avatar-content .c7n-image-crop-avatar-row {
    margin-top: .6rem;
}

.c7n-image-crop-avatar-content .c7n-image-crop-avatar-col {
    text-align: center;
}
````

  
