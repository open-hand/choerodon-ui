---
order: 1
title:
  zh-CN: 图片组
  en-US: Picture Group
---

## zh-CN

图片组

## en-US

````jsx
import { Picture } from 'choerodon-ui/pro';

const App = () => {
  return (
    <Picture.Provider>
      <Picture
        src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
        width={100}
        height={100}
        objectFit="contain"
        block={false}
        index={0}
        lazy
      />
      <Picture
        style={{ backgroundColor: '#000' }}
        src="https://choerodon.io/img/nav/logo.png"
        width={100}
        height={100}
        objectFit="contain"
        block={false}
        index={1}
        lazy
      />
    </Picture.Provider>
  )
}

ReactDOM.render(
  <App />,
  mountNode,
);
````
