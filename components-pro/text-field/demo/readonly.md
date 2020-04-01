---
order: 3
title:
  zh-CN: 只读
  en-US: Read Only
---

## zh-CN

只读。

## en-US

Read Only.

````jsx
import { DataSet, TextField, Row, Col, Button } from 'choerodon-ui/pro';

class App extends React.Component {
  ds = new DataSet({
    autoCreate: true,
    fields: [
      { name: 'bind', readOnly: true, defaultValue: 'huazhen' },
    ],
  });

  handleClick = () => {
    this.ds.getField('bind').readOnly = false;
  }

  render() {
    return (
      <Row gutter={10}>
        <Col span="12">
          <TextField placeholder="只读" readOnly />
        </Col>
        <Col span="6">
          <TextField dataSet={this.ds} name="bind" placeholder="DataSet限定只读" clearButton />
        </Col>
        <Col span="6">
          <Button onClick={this.handleClick}>解除只读</Button>
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
