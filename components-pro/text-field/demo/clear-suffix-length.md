---
order: 9
title:
  zh-CN: 清除-后缀-长度
  en-US: clearButton suffix showLengthInfo
---

## zh-CN

清除-后缀-长度组合。

1.`suffix`设置纯文本，会自动计算文本宽度设置到输入框的`paddingRight`。`suffix`设置非纯文本类型，请设置`style`宽度，否则输入框的`paddingRight`默认加 21px。

2.可以给`TextField`设置`clasName`,然后覆盖`suffix`的`div`样式。

3.`suffix`和`clearButton`同时设置时：如果`suffix`的第一层级没有设置`onClick`属性，它俩会重叠，否则`clearButton`在前，`suffix`在后。

## en-US

clearButton suffix showLengthInfo group.

````jsx
import { TextField, Row, Col, Tooltip, Icon, Button } from 'choerodon-ui/pro';

function handleCustom() {
  console.log('handleCustom');
}

class App extends React.Component {
  render() {
    return (
      <div>
        <Row gutter={10}>
          <Col span={8}>
            <TextField defaultValue="clearButton-clearButton-clearButton" clearButton />
          </Col>
          <Col span={8}>
            <TextField className="custom-suffix-text" defaultValue="suffix-suffix-suffix-suffix-suffix" suffix="文字后缀" />
          </Col>
          <Col span={8}>
            <TextField defaultValue="showLengthInfo-showLengthInfo-showLengthInfo" maxLength={50} showLengthInfo />
          </Col>
        </Row>
        <Row gutter={10}>
          <Col span={8}>
            <TextField className="custom-suffix-text" defaultValue="suffix-showLengthInfo-suffix-showLengthInfo" suffix={<span style={{ width: '0.56rem' }}>文字后缀</span>} maxLength={50} showLengthInfo />
          </Col>
          <Col span={8}>
            <TextField defaultValue="clearButton-showLengthInfo" clearButton maxLength={50} showLengthInfo />
          </Col>
          <Col span={8}>
            <TextField defaultValue="clearButton-suffix-clearButton-suffix" clearButton suffix={<Icon type="dehaze" />} />
          </Col>
        </Row>
        <Row gutter={10}>
          <Col span={8}>
            <TextField defaultValue="clearButton-suffix-showLengthInfo" clearButton suffix={<Icon type="dehaze" />} maxLength={50} showLengthInfo />
          </Col>
          <Col span={8}>
            <TextField defaultValue="suffix-set-onClick-suffix-set-onClick" clearButton suffix={<Icon type="dehaze" onClick={handleCustom} />} maxLength={50} showLengthInfo />
          </Col>
          <Col span={8}>
            <TextField className="custom-suffix-button" defaultValue="suffix-set-style-suffix-set-onClick" clearButton suffix={<Button style={{ width: '0.32rem', height: '0.28rem', padding: '0 0.02rem' }} onClick={handleCustom}>Click</Button>} />
          </Col>
        </Row>
      </div>
    );
  }
}

ReactDOM.render(
  <App />,
  mountNode
);
````

<style>
.custom-suffix-button label .c7n-pro-input-suffix {
  height: 0.28rem;
}
.custom-suffix-text label .c7n-pro-input-suffix {
  line-height: 0.2rem;
}
</style>
