---
order: 5
title:
  zh-CN: 分组
  en-US: Group
---

## zh-CN

有两种方式进行选项分组：

1. 用 `OptGroup` 进行选项分组。
2. 为OptionDs的Field添加group属性，属性值为从1开始的序数，用来指定分组的优先级。


## en-US

From the stack to the horizontal arrangement.

You can create a basic grid system by using a single set of `Row` and` Col` grid assembly, all of the columns (Col) must be placed in `Row`.

````jsx
import { DataSet, Select, Row, Col } from 'choerodon-ui/pro';

const { Option, OptGroup } = Select;

const App = () => {
  const optionDs = React.useMemo(() => new DataSet({
    queryUrl: '/common/lov/dataset/LOV_CODE',
    fields:[
      { name: 'enabledFlag', type:'string', group: true},
    ],
    autoQuery: true,
  }));

  const ds = React.useMemo(() => new DataSet({
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
  }));


  return (
    <Row gutter={10}>
      <Col span={12}>
        <Select>
          <OptGroup label="Manager">
            <Option value="jack">Jack</Option>
            <Option value="lucy">Lucy</Option>
          </OptGroup>
          <OptGroup label={<em>Engineer</em>}>
            <Option value="wu">Wu</Option>
          </OptGroup>
        </Select>
      </Col>
      <Col span={12}>
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
