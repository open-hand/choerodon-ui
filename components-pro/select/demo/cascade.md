---
order: 11
title:
  zh-CN: 选项级联
  en-US: Options Cascade
---

## zh-CN

选项级联。

## en-US

Options Cascade

````jsx
import { Divider } from 'choerodon-ui';
import { DataSet, Select, Row, Col } from 'choerodon-ui/pro';

function handleDataSetChange({ record, value, oldValue }) {
  console.log('[dataset]', value, '[oldValue]', oldValue, '[record.toJSONData()]', record.toJSONData());
}

class App extends React.Component {
  ds = new DataSet({
    autoCreate: true,
    fields: [
      {
        name: 'sheng',
        label: '省',
        lookupCode: 'SHENG',
        valueField: 'codeValueId',
        defaultValue: 10206,
      },
      {
        name: 'shi',
        type: 'number',
        valueField: 'codeValueId',
        label: '市',
        lookupCode: 'SHI',
        cascadeMap: { parentCodeValueId: 'sheng' },
      },
      {
        name: 'sheng-multiple',
        label: '省（多选）',
        lookupCode: 'SHENG',
        valueField: 'codeValueId',
        defaultValue: 10206,
        multiple: true,
      },
      {
        name: 'shi-multiple',
        type: 'number',
        valueField: 'codeValueId',
        label: '市（多选）',
        lookupCode: 'SHI',
        multiple: true,
        cascadeMap: { parentCodeValueId: 'sheng-multiple' },
      },
    ],
    events: {
      update: handleDataSetChange,
    },
  });

  render() {
    return (
      <>
        <Divider>单选</Divider>
        <Row gutter={10}>
          <Col span={12}>
            <Select dataSet={this.ds} name="sheng" />
          </Col>
          <Col span={12}>
            <Select dataSet={this.ds} name="shi" />
          </Col>
        </Row>
        <Divider>多选</Divider>
        <Row gutter={10}>
          <Col span={12}>
            <Select dataSet={this.ds} name="sheng-multiple" />
          </Col>
          <Col span={12}>
            <Select dataSet={this.ds} name="shi-multiple" />
          </Col>
        </Row>
      </>
    );
  }
}

ReactDOM.render(
  <App />,
  mountNode
);
````
