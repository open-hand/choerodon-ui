import React from 'react';
import ReactDOM from 'react-dom';
import { PerformanceTable, Button } from 'choerodon-ui/pro';

class App extends React.Component {
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

  render() {
    const columns = [
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
    const rowSelection = {
      onChange: (selectedRowKeys, selectedRows) => {
        console.log(
          `selectedRowKeys: ${selectedRowKeys}`,
          'selectedRows: ',
          selectedRows,
        );
      },
      getCheckboxProps: (rowData) => ({
        disabled: rowData.firstName === 'Libbie', // Column configuration not to be checked
        name: rowData.firstName,
      }),
      columnIndex: 99,
      fixed: false,
    };
    return (
      <>
        <PerformanceTable
          rowKey="id"
          rowSelection={rowSelection}
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
        <Button onClick={() => this.setState({ hid: !this.state.hid })}>
          显隐控制
        </Button>
      </>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('container'));
