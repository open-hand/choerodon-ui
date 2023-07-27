import React from 'react';
import ReactDOM from 'react-dom';
import { DataSet, Select, Row, Col } from 'choerodon-ui/pro';
import { Divider } from 'choerodon-ui';

function handleChange(value, oldValue) {
  console.log('[multiple]', value, '[oldValue]', oldValue);
}

function handleDataSetChange({ record, name, value, oldValue }) {
  console.log(
    '[dataset multiple]',
    value,
    '[oldValue]',
    oldValue,
    `[record.get('${name}')]`,
    record.get(name),
  );
}

const { Option } = Select;

const data = [
  {
    user: ['wu'],
  },
];

class App extends React.Component {
  ds = new DataSet({
    data,
    fields: [
      {
        name: 'user',
        type: 'string',
        textField: 'text',
        label: '用户',
        multiple: true,
      },
    ],
    events: {
      update: handleDataSetChange,
    },
  });

  renderSelectAllButtons = (buttons) => [
    ...buttons,
    {
      key: 'custom',
      children: 'custom',
      onClick: () => console.log('custom button clicked'),
    },
  ];

  render() {
    return (
      <Row gutter={10}>
        <Col style={{ marginBottom: 10 }} span={24}>
          <Divider orientation="left">数据源多选：</Divider>
          <Select
            dataSet={this.ds}
            name="user"
            placeholder="数据源多选"
            maxTagCount={2}
            maxTagTextLength={3}
            maxTagPlaceholder={(restValues) => `+${restValues.length}...`}
            selectAllButton={this.renderSelectAllButtons}
          >
            <Option value="jack">Jack</Option>
            <Option value="lucy">Lucy</Option>
            <Option value="wu">Wu</Option>
            <Option value="a1">a1</Option>
            <Option value="b2">b2</Option>
            <Option value="c3">c3</Option>
          </Select>
        </Col>
        <Col style={{ marginBottom: 10 }} span={12}>
          <Divider orientation="left">组件受控多选：</Divider>
          <Select
            multiple
            placeholder="多选"
            onChange={handleChange}
            defaultValue={['jack', 'wu', 'lucy']}
          >
            <Option value="jack">Jack</Option>
            <Option value="lucy">Lucy</Option>
            <Option value="wu">Wu</Option>
          </Select>
        </Col>
        <Col style={{ marginBottom: 10 }} span={12}>
          <Divider orientation="left">组件属性多选 & 可搜索：</Divider>
          <Select
            multiple
            searchable
            placeholder="多选+搜索"
            onChange={handleChange}
          >
            <Option value="jack">Jack</Option>
            <Option value="lucy">Lucy</Option>
            <Option value="wu">Wu</Option>
            <Option value="a1">a1</Option>
            <Option value="b2">b2</Option>
            <Option value="c3">c3</Option>
          </Select>
        </Col>
        <Col style={{ marginBottom: 10 }} span={12}>
          <Divider orientation="left">组件属性多选 & 输入复合：</Divider>
          <Select
            multiple
            combo
            placeholder="多选+复合"
            onChange={handleChange}
          >
            <Option value="jack">Jack</Option>
            <Option value="lucy">Lucy</Option>
            <Option value="wu">Wu</Option>
            <Option value="a1">a1</Option>
            <Option value="b2">b2</Option>
            <Option value="c3">c3</Option>
          </Select>
        </Col>
        <Col style={{ marginBottom: 10 }} span={12}>
          <Divider orientation="left">组件多选 & 复合 & 过滤：</Divider>
          <Select
            multiple
            combo
            searchable
            placeholder="多选+复合+过滤"
            onChange={handleChange}
          >
            <Option value="jack">Jack</Option>
            <Option value="lucy">Lucy</Option>
            <Option value="wu">Wu</Option>
            <Option value="a1">a1</Option>
            <Option value="b2">b2</Option>
            <Option value="c3">c3</Option>
          </Select>
        </Col>
        <Col style={{ marginBottom: 10 }} span={12}>
          <Divider orientation="left">多选禁用：</Divider>
          <Select
            multiple
            placeholder="多选+禁用"
            disabled
            defaultValue={['jack', 'wu']}
          >
            <Option value="jack">Jack</Option>
            <Option value="lucy">Lucy</Option>
            <Option value="wu">Wu</Option>
            <Option value="a1">a1</Option>
            <Option value="b2">b2</Option>
            <Option value="c3">c3</Option>
          </Select>
        </Col>
        <Col style={{ marginBottom: 10 }} span={12}>
          <Divider orientation="left">多选只读：</Divider>
          <Select
            multiple
            placeholder="多选+只读"
            readOnly
            defaultValue={['jack', 'wu']}
          >
            <Option value="jack">Jack</Option>
            <Option value="lucy">Lucy</Option>
            <Option value="wu">Wu</Option>
            <Option value="a1">a1</Option>
            <Option value="b2">b2</Option>
            <Option value="c3">c3</Option>
          </Select>
        </Col>
      </Row>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('container'));
