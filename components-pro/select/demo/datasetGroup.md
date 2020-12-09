---
order: 16
title: 
  zh-CN: 分组
  en-US: field group
---

## zh-CN

为OptionDs的Field添加group属性，属性值为从1开始的序数，用来指定分组的优先级。


## en-US

From the stack to the horizontal arrangement.

You can create a basic grid system by using a single set of `Row` and` Col` grid assembly, all of the columns (Col) must be placed in `Row`.

````jsx
import { DataSet, Select, Row, Col, Tooltip } from 'choerodon-ui/pro';

const App = () => {

  const optionDs = new DataSet({
    queryUrl: '/common/lov/dataset/LOV_CODE',
    fields:[
      { name: 'enabledFlagMeaning', type:'string', group: true},
    ],
    autoQuery: true,
  });

  const ds = new DataSet({
    fields: [
      {
        name: 'code',
        type: 'string',
        textField: 'description',
        valueField: 'code',
        label: '用户',
        options: optionDs,
      },
    ],
  });


  return (
    <Row gutter={10}>
      <Col span={8}>
        <Select dataSet={ds} name="code" />
      </Col>
    </Row>
  );
};

ReactDOM.render(
  <App />,
  mountNode
);
````
