import React from 'react';
import ReactDOM from 'react-dom';
import { DataSet, Cascader, Row, Col } from 'choerodon-ui/pro';
import axios from 'axios';

function handleDataSetChange({ record, name, value, oldValue }) {
  console.log(
    '[dataset newValue]',
    value,
    '[oldValue]',
    oldValue,
    `[record.get('${name}')]`,
    record.get(name),
  );
}

// 这里面可以控制node结点的判断来实现是否展示为叶结点
function nodeCover({ record }) {
  const nodeProps = {
    title: record.get('text'),
  };
  if (record.get('text') === '岗位管理') {
    nodeProps.isLeaf = true;
  } else {
    nodeProps.isLeaf = false;
  }
  return nodeProps;
}

class App extends React.Component {
  optionDs = new DataSet({
    transport: {
      read({ data: { parentId } }) {
        return {
          url: `/tree-async${parentId ? `-${parentId}` : ''}.mock`,
        };
      },
    },
    autoQuery: true,
    selection: 'mutiple',
    parentField: 'parentId',
    idField: 'id',
    fields: [
      { name: 'id', type: 'string' },
      { name: 'expand', type: 'boolean' },
      { name: 'parentId', type: 'string' },
    ],
  });

  pageOptionDs = new DataSet({
    selection: 'mutiple',
    transport: {
      read({ data: { parentId }, params: { page, pagesize } }) {
        return parentId
          ? {
              url: `/tree-async-${parentId}.mock`,
            }
          : {
              url: `/tree-async/${pagesize}/${page}.mock`,
            };
      },
    },
    autoQuery: true,
    paging: 'server',
    pageSize: 5,
    idField: 'id',
    parentField: 'parentId',
  });

  ds = new DataSet({
    autoCreate: true,
    fields: [
      {
        name: 'id',
        type: 'string',
        textField: 'text',
        defaultValue: ['2'],
        valueField: 'id',
        label: '部门',
        options: this.optionDs,
      },
      {
        name: 'id2',
        type: 'object',
        textField: 'text',
        valueField: 'id',
        label: '功能',
        options: this.pageOptionDs,
        ignore: 'always',
      },
    ],
    events: {
      update: handleDataSetChange,
    },
  });

  handleLoadData = (targetOption) => {
    const key = targetOption.value.get('id');
    return new Promise((resolve) => {
      if (!targetOption.children) {
        axios
          .get(`/tree-async-${key}.mock`)
          .then((res) => {
            this.pageOptionDs.appendData(res.data.rows);
            resolve();
          })
          .catch((err) => {
            resolve();
            return;
          });
      } else {
        resolve();
      }
    });
  };

  render() {
    return (
      <Row>
        <Col span={12}>
          <Cascader
            async
            changeOnSelect
            onOption={nodeCover}
            dataSet={this.ds}
            name="id"
          />
        </Col>
        <Col span={12}>
          <Cascader
            changeOnSelect
            onOption={nodeCover}
            dataSet={this.ds}
            name="id2"
            loadData={this.handleLoadData}
          />
        </Col>
      </Row>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('container'));
