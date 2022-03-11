import React from 'react';
import ReactDOM from 'react-dom';
import { DataSet, Table, Transfer } from 'choerodon-ui/pro';

const { Column } = Table;

class App extends React.Component {
  sourceDs;

  targetDs;

  dsCommon = (onItemSelect) => ({
    primaryKey: 'userid',
    autoQuery: true,
    pageSize: 5,
    fields: [
      {
        name: 'userid',
        type: 'string',
        label: '编号',
      },
      {
        name: 'name',
        type: 'intl',
        label: '姓名',
        required: true,
      },
    ],
    events: {
      batchSelect: ({ dataSet }) => {
        onItemSelect(dataSet.selected);
      },
      batchUnSelect: ({ dataSet }) => {
        onItemSelect(dataSet.selected);
      },
    },
  });

  render() {
    return (
      <Transfer style={{ height: 300, width: 500 }}>
        {({ direction, targetOption, onItemSelect }) => {
          if (direction === 'right') {
            if (!this.targetDs) {
              this.targetDs = new DataSet({
                data: [],
                ...this.dsCommon(onItemSelect),
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
                    (x) => x.get('userid') === record.get('userid'),
                  );
                  if (!findRecord) {
                    cacheRecords.push(record);
                  }
                }
                this.sourceDs.appendData([...cacheRecords]);
                this.targetDs.remove(cacheRecords, true);
              } else {
                // 向右 转移
                this.targetDs.appendData(
                  this.sourceDs.selected.map((x) => x.toData()),
                );
                this.sourceDs.remove(this.sourceDs.selected, true);
              }
            }
          } else if (direction === 'left') {
            if (!this.sourceDs) {
              this.sourceDs = new DataSet({
                transport: {
                  read({ params: { page, pagesize } }) {
                    return {
                      url: `/dataset/user/page/${pagesize}/${page}`,
                    };
                  },
                },
                ...this.dsCommon(onItemSelect),
              });
            }
          }

          return (
            <Table
              name="table"
              key="user"
              dataSet={direction === 'left' ? this.sourceDs : this.targetDs}
            >
              <Column name="userid" />
              <Column name="name" />
            </Table>
          );
        }}
      </Transfer>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('container'));
