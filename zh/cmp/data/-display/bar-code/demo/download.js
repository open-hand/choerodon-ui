import React from 'react';
import ReactDOM from 'react-dom';
import { BarCode } from 'choerodon-ui';

class App extends React.Component {
  download = () => {
    const canvas = document.querySelector('.HpQrcode > canvas');
    this.downloadRef.href = canvas.toDataURL();
    this.downloadRef.download = 'QRCode.png';
  };

  render() {
    return (
      <div className="HpQrcode">
        <div style={{ margin: '10 0' }}>
          <a
            ref={(ref) => {
              this.downloadRef = ref;
            }}
            onClick={this.download}
          >
            点击这里下载二维码
          </a>
        </div>
        <BarCode value="我是二维码" />
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('container'));
