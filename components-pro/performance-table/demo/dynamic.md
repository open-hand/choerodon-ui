---
order: 1
title:
  zh-CN: 动态处理
  en-US: Basic usage
---

## zh-CN

动态处理。

## en-US

Basic usage example.

````jsx
import fakeLargeData from '../../../site/theme/mock/performance-data/fakeLargeData.json';
import users from '../../../site/theme/mock/performance-data/users.ts';
import { Button, Checkbox, PerformanceTable } from 'choerodon-ui/pro';
import isFunction from 'lodash/isFunction';
import get from 'lodash/get';

const { Column, HeaderCell, Cell } = PerformanceTable;


class DynamicTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: users,
      columns: [],
      checkValues: [],
      paddingLeft: 0,
      tableWidth: 'auto'
    };
    this.handleRowClick = this.handleRowClick.bind(this);
    this.handleColumnClick = this.handleColumnClick.bind(this);
    this.handleScrollTop = this.handleScrollTop.bind(this);
    this.handleScrollLeft = this.handleScrollLeft.bind(this);
    this.handleCheckCellChange = this.handleCheckCellChange.bind(this);
    this.handleResizeWidth = this.handleResizeWidth.bind(this);
    this.handleClearData = this.handleClearData.bind(this);
    this.handleResetData = this.handleResetData.bind(this);
  }
  handleRowClick() {
    const { data } = this.state;
    const rowData = createFakeRowObjectData(data.length + 1);
    //data.push(rowData);

    this.setState({
      data: [...data, rowData]
    });
  }
  handleColumnClick() {
    const { columns } = this.state;

    columns.push(
      <Column width={200} key={columns.length + 1}>
        <HeaderCell>Email</HeaderCell>
        <Cell dataKey="email" />
      </Column>
    );

    this.setState({ columns });
  }

  handleClearData() {
    this.setState({ data: [] });
  }
  handleResetData() {
    this.setState({ data: users });
  }
  handleScrollTop() {
    this.table.scrollTop(100);
  }
  handleScrollLeft() {
    this.table.scrollLeft(100);
  }

  handleCheckCellChange(value) {
    value = +value;
    let checkValues = [...this.state.checkValues];

    if (checkValues.includes(value)) {
      checkValues = without(checkValues, value);
    } else {
      checkValues.push(value);
    }
    this.setState({ checkValues });
  }

  handleResizeWidth() {
    this.setState({
      tableWidth: this.state.tableWidth === 1000 ? 'auto' : 1000
    });
  }

  render() {
    const { checkValues, tableWidth, paddingLeft } = this.state;

    return (
      <div style={{ paddingLeft, width: tableWidth, transition: 'padding .1s linear' }}>
        <div>
          <Button onClick={this.handleRowClick}>Add Row</Button>
          <Button onClick={this.handleColumnClick}>Add Column</Button>
          <Button onClick={this.handleScrollTop}>Scroll Top</Button>
          <Button onClick={this.handleScrollLeft}>Scroll Left</Button>
          <Button onClick={this.handleResizeWidth}>Update Width</Button>
          <Button onClick={this.handleResetData}>Reset Data</Button>
          <Button onClick={this.handleClearData}>Clear Data</Button>
        </div>
        <br />
        <hr />
        <br />
        <PerformanceTable
          rowKey='id'
          showScrollArrow
          height={400}
          data={this.state.data}
          ref={ref => {
            this.table = ref;
          }}
          shouldUpdateScroll={false}
        >
          <Column width={70} align="center" fixed>
            <HeaderCell>Id</HeaderCell>
            <Cell dataKey="id" />
          </Column>
          <Column width={130} fixed>
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
          <Column width={200}>
            <HeaderCell>Company Name</HeaderCell>
            <Cell dataKey="companyName" />
          </Column>
          <Column flexGrow={1}>
            <HeaderCell>Email</HeaderCell>
            <Cell dataKey="email" />
          </Column>
          {this.state.columns}
        </PerformanceTable>
      </div>
    );
  }
}
ReactDOM.render(
  <DynamicTable />,
  mountNode
);
````
