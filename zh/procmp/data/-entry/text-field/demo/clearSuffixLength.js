import React from 'react';
import ReactDOM from 'react-dom';
import { TextField, Row, Col, Icon, Button } from 'choerodon-ui/pro';

function handleCustom() {
  console.log('handleCustom');
}

// <style>
// .custom-suffix-button label .c7n-pro-input-suffix {
//   height: 28px;
// }
// .custom-suffix-text label .c7n-pro-input-suffix {
//   line-height: 20px;
// }
// </style>

const App = () => {
  return (
    <div>
      <Row gutter={10}>
        <Col span={8}>
          <h4>清除按钮：</h4>
          <TextField
            defaultValue="clearButton-clearButton-clearButton"
            clearButton
          />
        </Col>
        <Col span={8}>
          <h4>文字后缀：</h4>
          <TextField
            // custom-suffix-text 用户自定义类名，适配后缀样式
            className="custom-suffix-text"
            defaultValue="suffix-suffix-suffix-suffix-suffix"
            suffix="文字后缀"
          />
        </Col>
        <Col span={8}>
          <h4>展示长度信息：</h4>
          <TextField
            defaultValue="showLengthInfo-showLengthInfo-showLengthInfo"
            maxLength={50}
            showLengthInfo
          />
        </Col>
      </Row>
      <Row gutter={10}>
        <Col span={8}>
          <h4>文字后缀 & 长度：</h4>
          <TextField
            // custom-suffix-text 用户自定义类名，适配后缀样式
            className="custom-suffix-text"
            defaultValue="suffix-showLengthInfo-suffix-showLengthInfo"
            suffix={<span style={{ width: '60px' }}>文字后缀</span>}
            maxLength={50}
            showLengthInfo
          />
        </Col>
        <Col span={8}>
          <h4>清除 & 长度：</h4>
          <TextField
            defaultValue="clearButton-showLengthInfo"
            clearButton
            maxLength={50}
            showLengthInfo
          />
        </Col>
        <Col span={8}>
          <h4>清除 & Icon 后缀：</h4>
          <TextField
            defaultValue="clearButton-suffix-clearButton-suffix"
            clearButton
            suffix={<Icon type="dehaze" />}
          />
        </Col>
      </Row>
      <Row gutter={10}>
        <Col span={8}>
          <h4>清除 & Icon 后缀 & 长度：</h4>
          <TextField
            defaultValue="clearButton-suffix-showLengthInfo"
            clearButton
            suffix={<Icon type="dehaze" />}
            maxLength={50}
            showLengthInfo
          />
        </Col>
        <Col span={8}>
          <h4>清除 & Icon onClick 后缀 & 长度：</h4>
          <TextField
            defaultValue="suffix-set-onClick-suffix-set-onClick"
            clearButton
            suffix={<Icon type="dehaze" onClick={handleCustom} />}
            maxLength={50}
            showLengthInfo
          />
        </Col>
        <Col span={8}>
          <h4>清除 & onClick 后缀：</h4>
          <TextField
            // custom-suffix-text 用户自定义类名，适配后缀样式
            className="custom-suffix-button"
            defaultValue="suffix-set-style-suffix-set-onClick"
            clearButton
            suffix={
              <Button
                style={{
                  width: '32px',
                  minWidth: '32px',
                  height: '28px',
                  padding: '0px 2px',
                }}
                onClick={handleCustom}
              >
                Click
              </Button>
            }
          />
        </Col>
      </Row>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('container'));
