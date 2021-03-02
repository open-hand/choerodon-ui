---
order: 3
title:
  zh-CN: 异步加载
  en-US: async
---

## zh-CN

异步加载

## en-US

async

````jsx
import { DataSet, Tree, Row, Col } from 'choerodon-ui/pro';
import React, { useMemo, useCallback } from 'react';
import axios from 'axios';


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

const TreeDs = () => ({
  primaryKey: 'id',
  transport: {
    read({ data: { parentId } }) {
      return {
        url: `/tree-async${parentId ? `-${parentId}` : ''}.mock`,
      }
    }
  },
  autoQuery: true,
  parentField: 'parentId',
  expandField: 'expand',
  idField: 'id',
  fields: [
    { name: 'id', type: 'number' },
    { name: 'expand', type: 'boolean' },
    { name: 'parentId', type: 'number' },
  ],
  events: {
    select: ({ record, dataSet }) => console.log('select', record, dataSet),
    unSelect: ({ record, dataSet }) => console.log('unSelect', record, dataSet),
  },
});



const App = () => {
  const dataSet = useMemo(() => new DataSet(TreeDs()), [])

  const onLoadData = useCallback(({ key, children }) => {
    return new Promise(resolve => {
      if (!children) {
        axios.get(`/tree-async-${key}.mock`).then((res)=> {
          dataSet.appendData(res.data.rows)
          resolve();
        }).catch((err) => {
          resolve();
          return;
        });
      } else {
        resolve();
      }
    });
  }, []);

  return (
    <Row>
      <Col span={12}>
        <Tree
          dataSet={dataSet}
          checkable
          treeNodeRenderer={nodeCover}
          async
        />
      </Col>
      <Col span={12}>
        <Tree
          dataSet={dataSet}
          loadData={onLoadData}
          checkable
          treeNodeRenderer={nodeCover}
        />
      </Col>
    </Row>
  )
}

ReactDOM.render(
  <App />,
  mountNode
);
````
