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
import { Picture, Switch } from 'choerodon-ui/pro';

const App = () => {
  const [single, setSingle] = React.useState(false);

  return (
    <>
      <p>
        <span>显示一张图片：</span>
        <Switch checked={single} onChange={setSingle} />
      </p>
      <Picture.Provider
        modalProps={{
          onClose: () => console.log('provider onClose...'),
      }}>
        <Picture
          src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
          width={100}
          height={100}
          objectFit="contain"
          block={false}
          index={0}
          lazy
          modalProps={{
            onClose: () => console.log('picture onClose...'),
          }}
        />
        {
          !single && (
            <Picture
              style={{ backgroundColor: '#000' }}
              src="https://file.open.hand-china.com/hsop-image-host/team/3/f0350dbd1f804bd2bf9458d9f3d10f71@y1.png"
              width={100}
              height={100}
              objectFit="contain"
              block={false}
              index={1}
              lazy
            />
          )
        }
      </Picture.Provider>
    </>
  )
}

ReactDOM.render(
  <App />,
  mountNode,
);
````
