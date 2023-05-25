---
order: 6
title:
  zh-CN: 树形数据异步懒加载
  en-US: Asynchronous lazy loading Tree Data
---

## zh-CN

异步懒加载实现

## en-US

Asynchronous lazy loading implementation, concerns: 1.icon rendering problem, 2.onExpand event trigger

```jsx
import { DataSet, Table, Button, Icon, Row, Col } from 'choerodon-ui/pro';
import axios from 'axios';

const { Column } = Table;

// 这里面可以控制node结点的判断来实现是否展示为叶结点
function nodeCover({record}){
  const nodeProps = {
    title: record.get('text'),
  }
  if (record.get('text') === '岗位管理') {
    nodeProps.isLeaf = true;
  }
  return nodeProps
}

function iconRenderer({ record, text }) {
  return [<Icon key="icon" type={record.get('icon')} />, <span key="text">{text}</span>];
}

class App extends React.Component {
  ds = new DataSet({
    primaryKey: 'id',
    transport: {
      read({ data: { parentId } }) {
        return {
          url: `/tree-async${parentId ? `-${parentId}` : ''}.mock`,
        }
      }
    },
    submitUrl: '/tree-async.mock',
    autoQuery: true,
    parentField: 'parentId',
    idField: 'id',
    checkField: 'ischecked',
    cacheSelection: true,
    cacheModified: true,
    fields: [
      { name: 'id', type: 'number' },
      { name: 'text', type: 'string', label: '功能名称' },
      { name: 'url', type: 'string', label: '入口页面' },
      { name: 'expand', type: 'boolean', label: '是否展开' },
      { name: 'ischecked', type: 'boolean', label: '是否开启' },
      { name: 'score', type: 'number', order: 'asc' },
      { name: 'parentId', type: 'number', parentFieldName: 'id' },
    ],
    record: {
      dynamicProps: {
        defaultExpanded: (record) => record.index === 1,
      }
    },
    events: {
      indexchange: ({ current }) => console.log('current user', current),
      submit: ({ data }) => console.log('submit tree data', data),
    },
  });


  handleCreateChild = () => {
    console.log(this.ds.current.get('id'))
    this.ds.create({ parentId: this.ds.current.get('id') });
  };

  handleLoadData = ({ record, dataSet }) => {
    const { key, children } = record;
    return new Promise(resolve => {
      if (!children) {
        axios.get(`/tree-async-${key}.mock`).then((res)=> {
          dataSet.appendData(res.data.rows, record)
          resolve();
        }).catch((err) => {
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
      <Row gutter={10}>
        <Col span={12}>
          <Table
            className="tree-table-demo"
            mode="tree"
            treeAsync
            dataSet={this.ds}
            rowHeight={40}
            onRow={nodeCover}
            header="treeAsync"
            buttons={['query', ['query', { key: 'cached-query',children: '查询（保留缓存）', onClick: () => this.ds.query(1, {}, true)}]]}
            showCachedSelection
          >
            <Column name="text" editor renderer={iconRenderer} width={250} />
            <Column name="ischecked" editor />
            <Column name="expand" editor />
          </Table>
        </Col>
        <Col span={12}>
          <Table
            className="tree-table-demo"
            mode="tree"
            treeLoadData={this.handleLoadData}
            dataSet={this.ds}
            rowHeight={40}
            onRow={nodeCover}
            header="treeLoadData"
            buttons={['query', ['query', { key: 'cached-query', children: '查询（保留缓存）', onClick: () => this.ds.query(1, {}, true)}]]}
            showCachedSelection
          >
            <Column name="text" editor renderer={iconRenderer} width={250} />
            <Column name="ischecked" editor />
            <Column name="expand" editor />
          </Table>
        </Col>
      </Row>
    );
  }
}

ReactDOM.render(<App />, mountNode);
```
````css
  /* 隐藏图标 */
  .tree-table-demo .c7n-pro-table-expanded-row {
   visibility: collapse;
  } 
  
  .tree-table-demo .c7n-pro-table-cell-prefix {
    padding-right: 18px;
  }

````
