---
order: 9
title:
  zh-CN: 自动高度
  en-US: auto-height
---

## zh-CN

自适应高度(需要父级元素非仅由 Table 撑开)。

autoHeight:

| 类型 | —— | 默认值 / 自定义 |
| --- | --- |  --- |
| boolean |  | false |
| boolean |  | true = { type: 'minHeight', diff: 0 } |
| object |  | { type: 'minHeight' \| 'maxHeight', diff: number(Table 自适应底部预留调整参数) } |

## en-US

AutoHeight.

````jsx
import { Button, PerformanceTable } from 'choerodon-ui/pro';
import fakeLargeData from '../../../site/theme/mock/performance-data/fakeLargeData.json';

const { Column, HeaderCell, Cell } = PerformanceTable;


class AutoHeightTable extends React.Component {

  columns = () => [
    {
      title: 'Id',
      dataIndex: 'id',
      key: 'id',
      width: 70,
      fixed: true,
    },
    {
      title: '姓名',
      dataIndex: 'firstName',
      key: 'firstName',
      width: 130,
      resizable: true,
    },
    {
      title: '城市',
      dataIndex: 'city',
      key: 'city',
      width: 200,
    },
    {
      title: '街道',
      dataIndex: 'street',
      key: 'street',
      width: 300,
    },
    {
      title: '公司',
      dataIndex: 'companyName',
      key: 'companyName',
      width: 300,
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      width: 300,
    },
  ];

  render() {
    return (
      <div style={{height: 400}}>
        <PerformanceTable
          columns={this.columns()}
          autoHeight={{ type: 'minHeight', diff: 80}}
          data={fakeLargeData}
          virtualized
        />
      </div>
    );
  }
}

ReactDOM.render(<AutoHeightTable />,
  mountNode
);
````
