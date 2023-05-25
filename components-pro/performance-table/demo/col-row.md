---
order: 6
title:
  zh-CN: 行列合并
  en-US: Row merge and column merge
---

## zh-CN

行列合并。

## en-US

Row merge and column merge.

````jsx
import '../../../components-pro/performance-table/style/index.less';
import fakeDataForColSpan from '../../../site/theme/mock/performance-data/usersForColSpan';
import { Button, PerformanceTable } from 'choerodon-ui/pro';

const transformData = (data) => {
  const rowCombineArr = [];
  let currentName = null;
  let repeatNum = 0;
  let repeatStart = 0;

  for (let i = 0; i < data.length; i++) {
    const record = data[i];
    // 根据name进行合并
    const { companyName } = record;
    if (currentName === null) {
      currentName = companyName;
      repeatNum = 1;
      repeatStart = i;
      rowCombineArr[repeatStart] = 1;
    } else if (currentName === companyName) {
      rowCombineArr[i] = 0;
      repeatNum++;
    } else {
      currentName = null;
      rowCombineArr[repeatStart] = repeatNum;
      repeatNum = 0;
      i--;
    }
    if (i === data.length - 1) {
      rowCombineArr[repeatStart] = repeatNum;
    }
  }
  return rowCombineArr;
};

const rowCombineArr = transformData(fakeDataForColSpan);

class Table extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: fakeDataForColSpan,
    };
  }

  render() {
    const columns = [
      {
        title: 'Id',
        dataIndex: 'id',
        key: 'id',
        width: 70,
        verticalAlign: 'middle',
        fixed: true,
      },
      {
        header: '基本信息',
        type: 'ColumnGroup',
        align: 'center',
        verticalAlign: 'middle',
        fixed: true,
        children: [
          {
            title: '名',
            dataIndex: 'firstName',
            key: 'firstName',
            width: 150,
            colSpan: 2,
            resizable: true,
          },
          {
            title: '姓',
            dataIndex: 'lastName',
            key: 'lastName',
            width: 150,
            resizable: true,
          },

          {
            title: '邮箱',
            dataIndex: 'email',
            key: 'email',
            width: 200,
            resizable: true,
          },
        ],
      },
      {
        title: '公司',
        dataIndex: 'companyName',
        key: 'companyName',
        width: 300,
        verticalAlign: 'middle',
        onCell: ({ rowData, dataIndex, rowIndex }) => {
          const rowSpan = rowCombineArr[rowIndex];
          return {
            rowSpan,
          };
        },
      },
      {
        title: '城市',
        dataIndex: 'city',
        key: 'city',
        width: 300,
        colSpan: 2,
        verticalAlign: 'middle',
        resizable: true,
      },
      {
        title: '街道',
        dataIndex: 'street',
        key: 'street',
        width: 300,
        verticalAlign: 'middle',
        resizable: true,
      },
    ];
    return (
      <PerformanceTable
        bordered
        rowKey="id"
        height={400}
        headerHeight={80}
        data={this.state.data}
        columns={columns}
        onRowClick={(data) => {
          console.log(data);
        }}
      />
    );
  }
}

ReactDOM.render(<Table />,
  mountNode
);
````
