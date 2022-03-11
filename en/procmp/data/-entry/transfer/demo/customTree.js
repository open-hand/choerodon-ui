import React from 'react';
import ReactDOM from 'react-dom';
import { DataSet, Tree, Transfer } from 'choerodon-ui/pro';

const treeData = [
  {
    expand: true,
    id: 2,
    text: '组织架构',
  },
  {
    expand: false,
    id: 7,
    text: '员工管理(react)',
    parentId: 2,
  },
  {
    expand: false,
    id: 73,
    text: '组织管理',
    parentId: 2,
  },
  {
    expand: false,
    id: 12,
    text: '公司管理(react)',
    parentId: 2,
  },
  {
    expand: true,
    id: 24,
    text: '报表管理',
  },
  {
    expand: false,
    id: 25,
    text: '报表定义',
    parentId: 24,
  },
  {
    expand: false,
    id: 26,
    text: '报表设计',
    parentId: 24,
    disabled: true,
  },
];

function nodeRenderer({ record }) {
  return record.get('text');
}

class App extends React.Component {
  sourceDs;

  targetDs;

  dsCommon = {
    primaryKey: 'id',
    autoQuery: true,
    parentField: 'parentId',
    expandField: 'expand',
    idField: 'id',
    fields: [
      { name: 'id', type: 'number' },
      { name: 'expand', type: 'boolean' },
      { name: 'parentId', type: 'number' },
      { name: 'disabled', type: 'boolean' },
    ],
  };

  render() {
    return (
      <Transfer style={{ height: 300, width: 400, overflow: 'auto' }}>
        {({ direction, targetOption, onItemSelect }) => {
          if (direction === 'right') {
            if (!this.targetDs) {
              this.targetDs = new DataSet({
                data: [],
                ...this.dsCommon,
              });
            }

            // 当左边的数据转移到右边的时候，此时 targetOption 就会有数据
            // 这里的逻辑是模拟的数据穿梭，真实情况的数据请考虑 ds 结合接口查询
            if (targetOption.length !== this.targetDs.records.length) {
              if (targetOption.length < this.targetDs.records.length) {
                // 向左 转移
                const cacheRecords = [];
                // eslint-disable-next-line no-restricted-syntax
                for (const record of this.targetDs.records) {
                  const findRecord = targetOption.find(
                    (x) => Number(x.key) === Number(record.get('id')),
                  );
                  if (!findRecord) {
                    cacheRecords.push(record);
                  }
                }
                let tempTreeData = treeData;
                // eslint-disable-next-line no-restricted-syntax
                for (const record of targetOption) {
                  tempTreeData = tempTreeData.filter(
                    (x) => x.id !== Number(record.key),
                  );
                }

                this.sourceDs.loadData([...tempTreeData]);
                this.targetDs.remove(cacheRecords, true);
              } else {
                // 向右 转移
                this.targetDs.loadData(
                  targetOption.map((x) => ({
                    expand: true,
                    id: x.key,
                    text: x.title,
                  })),
                );
                this.sourceDs.remove(this.sourceDs.selected, true);
              }
            }
          } else if (direction === 'left') {
            if (!this.sourceDs) {
              this.sourceDs = new DataSet({
                data: treeData,
                ...this.dsCommon,
              });
            }
          }

          const onCheck = (checkedKeys, e) => {
            onItemSelect(e.checkedNodes);
          };
          //
          return (
            <Tree
              showIcon={false}
              dataSet={direction === 'left' ? this.sourceDs : this.targetDs}
              checkable
              selectable={false}
              onCheck={onCheck}
              renderer={nodeRenderer}
            />
          );
        }}
      </Transfer>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('container'));
