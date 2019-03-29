---
order: 7
title:
  zh-CN: 渲染器
  en-US: Renderer
---

## zh-CN

渲染器。

## en-US

Renderer.

````jsx
import { DataSet, TextField, Row, Col } from 'choerodon-ui/pro';

function valueRenderer({ value }) {
  return `${value}个`;
}

class App extends React.Component {
  ds = new DataSet({
    data: [{ count: '30' }],
    fields: [
      { name: 'count' },
    ],
  });

  render() {
    return (
      <Row gutter={10}>
        <Col span="12">
          <TextField value="50" renderer={valueRenderer} />
        </Col>
        <Col span="12">
          <TextField dataSet={this.ds} name="count" renderer={valueRenderer} />
        </Col>
      </Row>
    );
  }
}

ReactDOM.render(
  <App />,
  mountNode
);
````
