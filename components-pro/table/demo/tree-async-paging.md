---
order: 16
title:
  zh-CN: 树形数据异步分页
  en-US: Asynchronous lazy loading Tree Data with paging
---

## zh-CN

异步懒加载实现，加父亲节点分页

## en-US

Asynchronous lazy loading implementation, concerns: 1.icon rendering problem, 2.onExpand event trigger，parent paging

```jsx
import { DataSet, Table, Button, Icon } from 'choerodon-ui/pro';
import axios from 'axios';

const { Column } = Table;

function iconRenderer({ record, text }) {
  return [<Icon key="icon" type={record.get('icon')} />, <span key="text">{text}</span>];
}

class App extends React.Component {
  ds = new DataSet({
    primaryKey: 'id',
    transport: {
      read({ data: { parentId }, params: { page, pagesize } }) {
        return parentId ? {
          url: `/tree-async-${parentId}.mock`,
        } : {
          url: `/tree-async/${pagesize}/${page}.mock`,
        }
      }
    },
    submitUrl: '/tree-async.mock',
    autoQuery: true,
    paging:'server',
    pageSize:5,
    parentField: 'parentId',
    idField: 'id',
    expandField: 'expand',
    checkField: 'ischecked',
    fields: [
      { name: 'id', type: 'number' },
      { name: 'text', type: 'string', label: '功能名称' },
      { name: 'url', type: 'string', label: '入口页面' },
      { name: 'expand', type: 'boolean', label: '是否展开' },
      { name: 'ischecked', type: 'boolean', label: '是否开启' },
      { name: 'score', type: 'number', order: 'asc' },
      { name: 'parentId', type: 'number', parentFieldName: 'id' },
    ],
    events: {
      indexchange: ({ current }) => console.log('current user', current),
      submit: ({ data }) => console.log('submit tree data', data),
    },
  });


  handleCreateChild = () => {
    console.log(this.ds.current.get('id'))
    this.ds.create({ parentId: this.ds.current.get('id') });
  };

  render() {
    return (
        <Table
          className="tree-table-demo"
          mode="tree"
          treeAsync
          dataSet={this.ds}
          rowHeight={40}
        >
        <Column name="text" editor renderer={iconRenderer} width={450} />
        <Column name="url" editor />
        <Column name="ischecked" editor />
        <Column name="expand" editor />
        <Column header="权限设置" width={150} align="center" />
      </Table>
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
