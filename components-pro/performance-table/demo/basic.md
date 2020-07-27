---
order: 0
title:
  zh-CN: 基本使用
  en-US: Basic usage
---

## zh-CN

基本使用。

## en-US

Basic usage example.

````jsx
import '../../../components-pro/performance-table/style/index.less';
import fakeLargeData from '../../../site/theme/mock/performance-data/fakeLargeData.json';
import { Button, PerformanceTable } from 'choerodon-ui/pro';

const { Column, HeaderCell, Cell } = PerformanceTable;

class EmptyDataTable extends React.Component {
  render() {
    const tableRef = React.createRef();
    return (
    <div>
      <PerformanceTable
        virtualized
        height={400}
        data={fakeLargeData}
        ref={tableRef}
        onRowClick={data => {
          console.log(data);
        }}
      >
        <Column width={70} align="center" fixed>
          <HeaderCell>Id</HeaderCell>
          <Cell dataKey="id" />
        </Column>

        <Column width={130}>
          <HeaderCell>First Name</HeaderCell>
          <Cell dataKey="firstName" />
        </Column>

        <Column width={130}>
          <HeaderCell>Last Name</HeaderCell>
          <Cell dataKey="lastName" />
        </Column>

        <Column width={200}>
          <HeaderCell>City</HeaderCell>
          <Cell dataKey="city" />
        </Column>

        <Column width={200}>
          <HeaderCell>Street</HeaderCell>
          <Cell dataKey="street" />
        </Column>

        <Column minWidth={200} flexGrow={1}>
          <HeaderCell>Company Name</HeaderCell>
          <Cell dataKey="companyName" />
        </Column>
      </PerformanceTable>
      <Button
        onClick={() => {
          tableRef.current.scrollTop(10000);
        }}
      >
        Scroll top
      </Button>
    </div>
    );
  }
}
ReactDOM.render(
  <EmptyDataTable />,
  mountNode
);
````
