---
order: 4
title:
  zh-CN: 下载二维码
  en-US: download BarCode
---

## zh-CN

下载二维码

## en-US

download BarCode

```jsx
import { QRBarCode } from 'choerodon-ui';

class App extends React.Component {

  download = () => { 
   const canvas = document.querySelector('.HpQrcode > canvas');
   this.downloadRef.href = canvas.toDataURL();
   this.downloadRef.download = 'mypainting.png';
}

  render() {
    return (
      <div className="HpQrcode">
       <div style={{margin:'10 0'}}>
            <a ref={(ref) => this.downloadRef = ref} onClick={this.download}>
                download
            </a>
       </div>
        <QRBarCode value="我是二维码" />
      </div>
    );
  }
}

ReactDOM.render(<App />, mountNode);
```
