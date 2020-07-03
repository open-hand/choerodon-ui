import ReactDOM from 'react-dom';
import { DataSet, Tree } from 'choerodon-ui/pro';
import React, { useMemo } from 'react';
import axios from 'axios';

// 这里面可以控制node结点的判断来实现是否展示为叶结点
function nodeCover({ record }) {
  const nodeProps = {
    title: record.get('text'),
  };
  if (record.get('text') === '岗位管理') {
    nodeProps.isLeaf = true;
  }
  return nodeProps;
}

const TreeDs = () => ({
  primaryKey: 'id',
  queryUrl: '/tree-async.mock',
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
  const dataSet = useMemo(() => new DataSet(TreeDs()), []);

  function onLoadData({ key, children }) {
    return new Promise((resolve) => {
      if (!children) {
        axios
          .get('/tree-async.mock')
          .then((res) => {
            const remianData = dataSet.toData();
            // 获取子结点数据，绑定父节点
            const recordsChildren = res.data.rows.map((item) => {
              item.parentId = key;
              item.id = Math.random() * 100;
              return item;
            });
            // 生成完成的dataSet数据注意会触发load event
            dataSet.loadData([...remianData, ...recordsChildren]);
            resolve();
          })
          .catch((err) => {
            resolve();
          });
      } else {
        resolve();
      }
    });
  }

  return (
    <Tree
      dataSet={dataSet}
      loadData={onLoadData}
      checkable
      treeNodeRenderer={nodeCover}
    />
  );
};

ReactDOM.render(<App />, document.getElementById('container'));
