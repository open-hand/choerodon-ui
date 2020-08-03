---
order: 0
title:
  zh-CN: 非严格步距
  en-US: Non-strict step
---

## zh-CN

非严格步距，在非严格步距下，允许输入值不为步距的倍数加上最小值，也允许在设置整数步距的情况下输入小数

## en-US

Step-strictly

````jsx
import { NumberField, Row, Col } from 'choerodon-ui/pro';
import { configure } from 'choerodon-ui';

function log(value) {
  console.log(value);
}

ReactDOM.render(
  <div>
    <Row gutter={10}>
      <Col span={12}>
        <NumberField placeholder="非严格步距,可以输入小数以及整数" nonStrictStep step={3} defaultValue={5}  onChange={log} />
      </Col>
    </Row>
  </div>,
  mountNode,
);
````
