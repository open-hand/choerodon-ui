---
order: 1
title:
  zh-CN: check和expand使用以及与dataset关联
  en-US: check and expand use in tree and relevance with dataSet
---

## zh-CN



## en-US

DataSet.

````jsx
import { DataSet, Tree } from 'choerodon-ui/pro';
import {Row, Col} from 'choerodon-ui';

function nodeRenderer({ record }) {
  return record.get('text');
}

class App extends React.Component {
  ds = new DataSet({
    primaryKey: 'id',
    queryUrl: '/tree-less.mock',
    autoQuery: true,
    expandField:'expand',
    checkField:'ischecked',
    parentField: 'parentId',
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
  dsDefault = new DataSet({
      primaryKey: 'id',
      queryUrl: '/tree-less.mock',
      autoQuery: true,
      parentField: 'parentId',
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
  handleExpand = (expandKeys,nodeObj)=> {
   console.log(`this is expand ${expandKeys} obj ${JSON.stringify(nodeObj)}`)
  }

  render() {
    return (
     <>
       <Row>
         <Col span={12}>
             <Tree
                    dataSet={this.ds}
                    checkable
                    showLine
                    draggable
                    showIcon
                    renderer={nodeRenderer}
                  />
         </Col>
         <Col span={12}>
                 <Tree
                    dataSet={this.dsDefault}
                    checkable
                    showLine
                    defaultExpandAll
                    defaultCheckedKeys={['2']}
                    draggable
                    onExpand={this.handleExpand}
                    showIcon
                    checkField='ischecked'
                    renderer={nodeRenderer}
                  />
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
