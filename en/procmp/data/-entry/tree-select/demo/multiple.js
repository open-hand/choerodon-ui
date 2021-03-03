import React from 'react';
import ReactDOM from 'react-dom';
import { DataSet, TreeSelect, Row, Col } from 'choerodon-ui/pro';

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

const { TreeNode } = TreeSelect;

const data = [
  {
    user: ['sss'],
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

  render() {
    return (
      <Row gutter={10}>
        <Col span={24}>
          <TreeSelect
            dataSet={this.ds}
            name="user"
            placeholder="数据源多选"
            maxTagCount={2}
            maxTagTextLength={3}
            maxTagPlaceholder={(restValues) => `+${restValues.length}...`}
          >
            <TreeNode value="parent 1" title="parent 1">
              <TreeNode value="parent 1-0" title="parent 1-0">
                <TreeNode value="leaf1" title="my leaf" />
                <TreeNode value="leaf2" title="your leaf" />
              </TreeNode>
              <TreeNode value="parent 1-1" title="parent 1-1">
                <TreeNode value="sss" title="sss" />
              </TreeNode>
            </TreeNode>
          </TreeSelect>
        </Col>
        <Col span={12}>
          <TreeSelect
            multiple
            placeholder="多选"
            onChange={handleChange}
            defaultValue={['leaf1', 'leaf2', 'sss']}
          >
            <TreeNode value="parent 1" title="parent 1">
              <TreeNode value="parent 1-0" title="parent 1-0">
                <TreeNode value="leaf1" title="my leaf" />
                <TreeNode value="leaf2" title="your leaf" />
              </TreeNode>
              <TreeNode value="parent 1-1" title="parent 1-1">
                <TreeNode value="sss" title="sss" />
              </TreeNode>
            </TreeNode>
          </TreeSelect>
        </Col>
        <Col span={12}>
          <TreeSelect
            multiple
            searchable
            placeholder="多选+搜索"
            onChange={handleChange}
            style={{ height: 30 }}
          >
            <TreeNode value="parent 1" title="parent 1">
              <TreeNode value="parent 1-0" title="parent 1-0">
                <TreeNode value="leaf1" title="my leaf" />
                <TreeNode value="leaf2" title="your leaf" />
              </TreeNode>
              <TreeNode value="parent 1-1" title="parent 1-1">
                <TreeNode value="sss" title="sss" />
              </TreeNode>
            </TreeNode>
          </TreeSelect>
        </Col>
        <Col span={12}>
          <TreeSelect
            multiple
            combo
            placeholder="多选+复合"
            onChange={handleChange}
          >
            <TreeNode value="parent 1" title="parent 1">
              <TreeNode value="parent 1-0" title="parent 1-0">
                <TreeNode value="leaf1" title="my leaf" />
                <TreeNode value="leaf2" title="your leaf" />
              </TreeNode>
              <TreeNode value="parent 1-1" title="parent 1-1">
                <TreeNode value="sss" title="sss" />
              </TreeNode>
            </TreeNode>
          </TreeSelect>
        </Col>
        <Col span={12}>
          <TreeSelect
            multiple
            combo
            searchable
            placeholder="多选+复合+过滤"
            onChange={handleChange}
          >
            <TreeNode value="parent 1" title="parent 1">
              <TreeNode value="parent 1-0" title="parent 1-0">
                <TreeNode value="leaf1" title="my leaf" />
                <TreeNode value="leaf2" title="your leaf" />
              </TreeNode>
              <TreeNode value="parent 1-1" title="parent 1-1">
                <TreeNode value="sss" title="sss" />
              </TreeNode>
            </TreeNode>
          </TreeSelect>
        </Col>
        <Col span={12}>
          <TreeSelect
            multiple
            placeholder="多选+禁用"
            disabled
            defaultValue={['leaf1', 'sss']}
          >
            <TreeNode value="parent 1" title="parent 1">
              <TreeNode value="parent 1-0" title="parent 1-0">
                <TreeNode value="leaf1" title="my leaf" />
                <TreeNode value="leaf2" title="your leaf" />
              </TreeNode>
              <TreeNode value="parent 1-1" title="parent 1-1">
                <TreeNode value="sss" title="sss" />
              </TreeNode>
            </TreeNode>
          </TreeSelect>
        </Col>
        <Col span={12}>
          <TreeSelect
            multiple
            placeholder="多选+只读"
            readOnly
            defaultValue={['leaf1', 'sss']}
          >
            <TreeNode value="parent 1" title="parent 1">
              <TreeNode value="parent 1-0" title="parent 1-0">
                <TreeNode value="leaf1" title="my leaf" />
                <TreeNode value="leaf2" title="your leaf" />
              </TreeNode>
              <TreeNode value="parent 1-1" title="parent 1-1">
                <TreeNode value="sss" title="sss" />
              </TreeNode>
            </TreeNode>
          </TreeSelect>
        </Col>
      </Row>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('container'));
