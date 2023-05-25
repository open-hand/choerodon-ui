---
order: 4
title:
  zh-CN: 个性化
  en-US: DataSet
---

## zh-CN

个性化。

## en-US

customizable.

````jsx

import React from 'react';
import { PerformanceTable, Icon, Button, CheckBox } from 'choerodon-ui/pro';

import '../../../components-pro/performance-table/style/index.less';
import fakeData from '../../../site/theme/mock/performance-data/users';


class SortTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sortColumn: 'id',
      data: fakeData,
      hid: true,
      checkValues: [],
    };
    this.handleSortColumn = this.handleSortColumn.bind(this);
  }

  getData() {
    const { data, sortColumn, sortType } = this.state;

    if (sortColumn && sortType) {
      return data.sort((a, b) => {
        let x = a[sortColumn];
        let y = b[sortColumn];
        if (typeof x === 'string') {
          x = x.charCodeAt();
        }
        if (typeof y === 'string') {
          y = y.charCodeAt();
        }
        if (sortType === 'asc') {
          return x - y;
        } else {
          return y - x;
        }
      });
    }
    return data;
  }

  handleSortColumn(sortColumn, sortType) {
    this.setState({
      loading: true,
    });

    setTimeout(() => {
      console.log(sortColumn);
      this.setState({
        sortColumn,
        sortType,
        loading: false,
      });
    }, 500);
  }
  
    handleChange = (value, oldValue) => {
      console.log('[controlled]', value, '[oldValues]', oldValue);
      const { checkValues } = this.state;
      if (value) {
        checkValues.push(value);
      } else {
        checkValues.splice(checkValues.indexOf(oldValue), 1);
      }
      this.setState({
        checkValues,
      });
    };
  
    handleCheckAllChange = (value, oldValue) => {
      console.log('[controlled]', value, '[oldValues]', oldValue);
      const { data } = this.state;
      if (value) {
        this.setState({
          checkValues: data.map((i) => i.id),
        });
      } else {
        this.setState({
          checkValues: [],
        });
      }
    };
  
    CheckCell = ({ rowData, rowIndex }) => {
      const { checkValues } = this.state;
      return (
        <CheckBox
          key={rowIndex}
          name="controlled"
          value={rowData.id}
          checked={checkValues.indexOf(rowData.id) !== -1}
          onChange={this.handleChange}
        />
      );
    };

  render() {
    const { data, checkValues } = this.state;
    const columns = [
      {
        title: () => (
          <CheckBox
            name="controlled"
            checked={checkValues.length === data.length}
            onChange={this.handleCheckAllChange}
          />
        ),
        key: 'checkbox',
        width: 50,
        align: 'center',
        fixed: true,
        render: ({ rowData, dataIndex, rowIndex }) =>
          this.CheckCell({ rowData, dataIndex, rowIndex }),
      },
      {
        title: () => 'Id1',
        dataIndex: 'id',
        key: 'id',
        width: 70,
        fixed: true,
        sortable: true,
      },
      {
        title: '姓',
        dataIndex: 'lastName',
        key: 'lastName',
        width: 130,
        sortable: true,
        hidden: this.state.hid,
        hideable: false,
      },
      {
        title: '名',
        dataIndex: 'firstName',
        key: 'firstName',
        width: 130,
        sortable: true,
      },
      {
        title: '城市',
        dataIndex: 'city',
        key: 'city',
        width: 200,
        sortable: true,
      },
      {
        title: '街道',
        dataIndex: 'street',
        key: 'street',
        width: 300,
        sortable: true,
      },
      {
        title: '公司',
        dataIndex: 'companyName',
        key: 'companyName',
        width: 300,
        sortable: true,
      },
      {
        title: '邮箱',
        dataIndex: 'email',
        key: 'email',
        width: 300,
      },
    ];
    return (
      <>
        <PerformanceTable
          rowKey='id'
          customizable
          customizedCode="pre-customized-p"
          columnDraggable
          columnTitleEditable
          height={400}
          data={this.getData()}
          sortColumn={this.state.sortColumn}
          sortType={this.state.sortType}
          onSortColumn={this.handleSortColumn}
          loading={this.state.loading}
          columns={columns}
          onRowClick={(data) => {
            console.log(data);
          }}
        />
        <Button onClick={() => this.setState({ hid: !this.state.hid })}>显隐控制</Button>
      </>
    );
  }
}

ReactDOM.render(<SortTable />,
  mountNode
);
````
