---
order: 9
title:
  zh-CN: 自动高度
  en-US: auto-height
---

## zh-CN

自适应高度(传入对象则自适应父节点高度，为 true 则由内容撑开高度)，并支持 performanceTableAutoHeight 全局配置。

## en-US

AutoHeight.

````jsx
import { PerformanceTable } from 'choerodon-ui/pro';
import fakeLargeData from '../../../site/theme/mock/performance-data/fakeLargeData.json';

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
          rowKey="id"
          columns={this.columns()}
          autoHeight={{ type: 'minHeight', diff: 80}}
          data={fakeLargeData.slice(0, 50)}
          virtualized
        />
      </div>
    );
  }
}

ReactDOM.render(
  <AutoHeightTable />,
  mountNode
);
````
